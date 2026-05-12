# PeerPulse: Decentralised Civic Intelligence

**A Peer-to-Peer Protocol for Election Verification**

*Protocol edition · Version 7.0, May 2026*

## Abstract

The central problem in election integrity is establishing ground truth in an adversarial environment. Existing approaches depend on a central authority, a trusted server, an accredited observer body, or an official commission, that can be pressured, corrupted, or shut down. Each shares a single point of failure: a human institution that can be compelled.

PeerPulse describes a different model: when a citizen photographs the official tally sheet posted at their polling station's public entrance, the device produces three independent proofs of physical presence — hardware attestation, mutual BLE witness attestations, and GPS — that together are significantly harder to fabricate than any server-issued certificate, with no pre-coordination and no accrediting body required.

This paper specifies the PeerPulse Elections protocol: packet schema, seven-tier trust hierarchy, BLE presence ceremony, hardware attestation chain, photo-and-location evidence model, witness-graph dispute resolution algorithm, and threat model. PeerPulse's additional civic-polling, civic-summary, and civic-education surfaces are specified in companion documents and out of scope here.

## 1. Introduction

### 1.1 The Problem

Democratic elections in contested environments face a consistent set of integrity challenges.

**Result manipulation at the tally centre.** Official counts are aggregated behind closed doors. Discrepancies between station-level tallies and reported national results are common in disputed elections and difficult to prove without distributed witnessing at scale.

**Observer suppression.** Accredited international observers cover a small fraction of polling stations. Local observers can be denied accreditation, physically removed, or intimidated. Their reports flow through central databases controlled by the same authorities whose conduct is under scrutiny.

**Communication blackouts.** Governments facing unfavourable results increasingly impose internet shutdowns during election periods. A monitoring system that requires internet connectivity fails at exactly the moment it is needed most.

**Centralised platforms as attack surfaces.** Applications that rely on a central server create a single target: the server can be seized, the domain can be blocked, the company can be legally compelled to hand over data, and the application can be removed from the app stores. The 2021 removal of Navalny's Smart Voting app from the Russian Google Play Store, days before a federal election, is the precise pattern this work is designed to defeat.

### 1.2 The Existing Landscape

Parallel Vote Tabulation (PVT) is the established methodology for independent election monitoring, refined over decades by organisations such as ELOG (Kenya), YIAGA Africa (Nigeria), NDI, and the Carter Center. The methodology is sound; a sufficiently large random sample of trained observers produces a statistically reliable independent count. Its limitation is organisational: in the most contested environments — precisely where PVT is most needed — the requirement for a credentialed observer corps becomes the binding constraint.

### 1.3 What PeerPulse Does

PeerPulse makes PVT-class witnessing available to any citizen with an Android device, without requiring a credentialed organisation, a central server, or internet connectivity. Critically, it requires no pre-coordination among observers. A citizen does not need to register with any organisation, attend any briefing, or arrange to meet any other observer before election day. They download the app, go to their polling station, and the protocol handles the rest.

PeerPulse the platform also includes civic-polling, civic-summary, and civic-education surfaces that share the same network and trust infrastructure. Those surfaces are specified in companion documents. This paper covers only the Elections protocol.

## 2. Core Insight: Triple Presence as Proof

The central cryptographic primitive in PeerPulse is unusual: it is not a certificate from a trusted authority, but the convergence of three independent physical-presence signals, each automatically generated when a citizen captures the posted tally.

Consider election day at a polling station. Alice, Bob, and Carol each downloaded the PeerPulse app independently. They have never met. They are at the same station for their own reasons, as voters, as citizen journalists, as curious neighbours. Each opens the app at the station entrance, the area where, by law in the target jurisdictions, results must be posted after counting, and taps **Start Witnessing**.

Automatically, invisibly:

1. **Hardware attestation.** The device's Android Keystore generates a fresh signing key inside the Trusted Execution Environment. The TEE produces a certificate chain rooted in Google's Hardware Attestation Root CA, proving that the key was generated on real Android hardware running the genuine PeerPulse APK. The chain is bound to the specific election and station via an attestation challenge.

2. **BLE co-presence.** The device begins advertising and scanning over Bluetooth Low Energy. Other PeerPulse devices nearby are discovered. Mutual `WitnessAttestation` exchanges occur over BLE GATT, each device signs the other's public key. Neither side needs to know the other exists in advance.

3. **GPS plausibility.** Live location tracking begins. GPS samples are kept in memory and not transmitted until the tally is submitted. At capture time, the coordinates are embedded in the signed packet.

When the count concludes and the official tally is posted at the entrance, each citizen photographs it through the app. The submitted `TallyPacket` contains:

- The reported vote count
- A signature over the payload by an Ed25519 session key
- An ECDSA P-256 signature over that session key by the TEE-bound device key
- The hardware attestation certificate chain
- All BLE witness attestations accumulated since check-in
- The photo hash, GPS coordinates, and capture timestamp

A receiving node can verify, fully offline, that this report came from a real Android device that was physically present at this specific station, co-located with N other PeerPulse devices at the same time, and that the photograph commits the submitter to a specific image of the posted tally.

The power of this proof is not that the devices trust each other. They are strangers. The power is that fabricating it requires deploying real hardware to the correct location at the correct time, capturing a photograph of the posted tally, and producing a TEE-backed signature, all while sustaining mutual BLE attestation with other devices that an attacker does not control. A remote attacker with a laptop cannot replicate any of these properties. A local attacker with a phone farm faces logistical constraints that scale poorly against a genuine observer corps.

## 3. System Overview

### 3.1 Applications

The mobile app (Expo / React Native, Android-only) is the only protocol-participating client. A desktop operator surface (Electron) and a public website at `peerpulse.app` consume the same packet stream for monitoring and information but do not originate tally submissions.

There is no citizen-facing web application. Web applications can be blocked by government DNS interference or network-level filtering; an Android APK distributed person-to-person is significantly harder to suppress.

There is no iOS application. Three protocol requirements have no iOS equivalent: a Google-rooted TEE attestation chain bound to a developer-controlled signing certificate (§2, §4.3); continuous foreground BLE advertise-and-scan at the station entrance (§5.1); and sideloadable distribution outside any single corporate gatekeeper (§1.1). Android's 80–90%+ share in target markets (Uganda, Kenya, DRC, Nigeria, Indonesia, the Philippines) makes this a small trade-off in addressable observers and a forced choice rather than a focus decision.

### 3.2 Network Topology

```mermaid
graph TB
  subgraph Apps["Citizen and operator applications"]
    M["📱 Mobile<br/>(React Native)"]
    D["🖥 Desktop<br/>(Electron)"]
    W["🌐 Website<br/>(Next.js)"]
  end
  subgraph Relays["Sovereign Relay network"]
    R1["Relay 1"]
    R2["Relay 2"]
    R3["Relay 3"]
  end
  M ---|"libp2p WS<br/>(internet)"| R1
  D ---|"libp2p WS"| R2
  W ---|"libp2p WS"| R3
  R1 ===|"Circuit Relay v2"| R2
  R2 ===|"Circuit Relay v2"| R3
  M -.->|"BLE presence<br/>+ offline sync"| M
  M -.->|"mDNS LAN<br/>(no internet)"| D
```

**Sovereign Relays** are Docker nodes running `apps/node` that route packets between applications using libp2p Circuit Relay v2. Any operator can run one. The protocol specifies their role, not their identity. Sovereign Relays additionally pin photo evidence to IPFS for the election period plus 90 days.

**mDNS on a shared local network** allows devices without internet to discover each other and gossip directly over TCP. A coordination centre Wi-Fi network with no internet is sufficient for the network to function.

**Bluetooth Low Energy** carries only cryptographic presence attestations and opportunistic offline sync of missing packets between physically near devices. All tally data ultimately travels over libp2p.

### 3.3 Citizen-First, Authority-Optional

The application is fully functional with zero official participation. Crowdsourced Green-tier tallies and station status signals operate from day one. Gold and Organisation tiers layer on as governments and NGOs choose to participate. The protocol does not require institutional adoption to provide value, institutional adoption is the second-stage demand-pull, not the precondition for launch.

## 4. Elections: Protocol Specification

### 4.1 Packet Types

All data travels as signed Protobuf packets gossiped over libp2p GossipSub across eight global topics:

```
peerpulse/tally/1.0.0
peerpulse/intent/1.0.0
peerpulse/witness/1.0.0
peerpulse/heartbeat/1.0.0
peerpulse/survey/1.0.0
peerpulse/vote/1.0.0
peerpulse/election/1.0.0
peerpulse/revocation/1.0.0
```

Global topics keep relay memory bounded. Nodes filter by `election_id` inside the payload.

The relevant packet types for Elections are:

- **`ElectionDefinition`**: a signed description of an election: jurisdiction, date, station list, polls-close time, dispute threshold, minimum witnesses, organisation registration deadline.
- **`IntentPacket`**: a citizen's declaration of intent to observe a specific station, broadcast before election day. Drives the local notification schedule.
- **`WitnessStartPacket`**: broadcast when the user taps Start Witnessing at the station. Triggers the BLE foreground service.
- **`ObserveHeartbeat`**: a 60-second TTL signal indicating a device is currently active at a station. Unsigned and ephemeral; used only for the live observer count.
- **`TallyPacket`**: the citizen observer's record of the vote count at a polling station. The core data structure of the protocol.
- **`RevocationPacket`**: a revocation of a previously issued credential, requiring 2-of-5 root co-signatures.

### 4.2 The TallyPacket

```protobuf
message TallyPacket {
  Header        header         = 1;
  Payload       payload        = 2;
  bytes         signature      = 3;   // Ed25519 over header + payload
  CertChain     cert_chain     = 4;   // empty for Citizen Observers
  WitnessBundle witnesses      = 5;
  bytes         photo_hash     = 6;   // SHA-256 of tally sheet photo
  HWAttestation hw_attestation = 7;   // hardware origin proof
  string        photo_cid      = 8;   // IPFS CID of encrypted photo
  double        photo_lat      = 9;   // GPS latitude at photo capture
  double        photo_lng      = 10;  // GPS longitude at photo capture
  int64         photo_taken_at = 11;  // Unix timestamp of photo capture
}

message Header {
  uint32 schema_version = 1;
  string network_id     = 2;
  string election_id    = 3;
  int64  timestamp      = 4;
  bytes  nonce          = 5;          // 16 random bytes. replay prevention
}

message Payload {
  string station_id   = 1;
  string candidate_id = 2;
  uint64 vote_count   = 3;
  uint32 sequence_num = 4;
}
```

The Ed25519 `signature` field signs the canonical serialisation of `Header + Payload` using a session keypair generated inside the device's TEE. For credentialed observers (Gold / Organisation), the session key is additionally bound to a leaf certificate in `cert_chain`.

Every TallyPacket includes `photo_lat`, `photo_lng`, and `photo_taken_at`: location is required for every tier. Gold and Organisation submissions must additionally include a non-empty `photo_hash` and `photo_cid`; without those two fields, the institutional connectivity-boost multiplier is capped at ×1.0 (see §6.4).

### 4.3 Hardware Attestation

Android Keystore supports Ed25519 hardware-backed keys only from API 33. PeerPulse's `minSdkVersion` is 24. To bring TEE attestation to API 26+ devices, the protocol uses a **two-key architecture**:

```mermaid
graph TB
  ROOT["Google HW Attestation<br/>Root CA"] -->|"certifies"| TEE
  TEE["ECDSA P-256 device key<br/>(generated in TEE)"] -->|"signs (ECDSA)"| ED
  ED["Ed25519 session key<br/>(in-memory)"] -->|"signs (Ed25519)"| PKT
  PKT["TallyPacket<br/>(header + payload)"]
  style ROOT fill:#080c18,stroke:#eab308,color:#dce8f8
  style TEE fill:#0c1222,stroke:#1e3357,color:#dce8f8
  style ED fill:#0c1222,stroke:#1e3357,color:#dce8f8
  style PKT fill:#0c1222,stroke:#22c55e,color:#dce8f8
```

A verifier checks the full chain: attestation → ECDSA key was generated in the TEE → ECDSA key signed this Ed25519 session key → Ed25519 session key signed this payload. Both signatures and the full certificate chain are bundled in `HWAttestation`.

```protobuf
message HWAttestation {
  bytes          device_cert     = 1;   // ECDSA P-256 leaf cert from Android Keystore TEE
  repeated bytes chain           = 2;   // cert chain to Google HW Attestation Root CA
  bytes          session_key_sig = 3;   // ECDSA P-256 sig over Ed25519 session public key
  // Attestation challenge embedded in device_cert extension:
  //   SHA-256(election_id + station_id + nonce)
}
```

The attestation challenge cryptographically binds the device key to a specific election and station. A device cannot reuse a TEE key generated for one election or station to sign tallies for another.

**Verification (offline):**

1. Parse `hw_attestation.chain`. Verify the X.509 chain roots to the pinned Google Hardware Attestation Root CA.
2. Check the attestation extension (OID 1.3.6.1.4.1.11129.2.1.17):
   - `security_level ≥ TEE` (reject `Software`)
   - `package_name == "app.peerpulse"`
   - `signing_cert_hash` matches the pinned PeerPulse APK signing key fingerprint
   - `attestation_challenge == SHA-256(election_id + station_id + nonce)`
3. Verify `session_key_sig` (ECDSA P-256) over the Ed25519 session public key.
4. Verify `TallyPacket.signature` (Ed25519) over `Header + Payload`.

All four steps are fully offline. The Google Hardware Attestation Root CA public key is pinned at build time.

**Huawei and de-Googled devices.** Devices without Google Play Services cannot produce chains rooted in Google's Hardware Attestation Root CA. These devices fall back to BLE-only trust: their TallyPackets carry `hw_attestation = null` and receive trust weight based solely on the BLE WitnessBundle. Hardware attestation is an additive signal, not a binary gate. A future revision may add Huawei HUKS attestation as a secondary trusted root.

### 4.4 The WitnessBundle

```protobuf
message WitnessBundle {
  repeated Witness witnesses = 1;
}

message Witness {
  bytes presence_pub_key = 1;
  bytes attestation_sig  = 2;   // signs {other_keys[], station_id, session_window}
  int64 session_window   = 3;   // Unix timestamp. 4-hour window
}
```

Each `Witness` entry represents one co-located observer. The `attestation_sig` is a signature by that observer's session key over the set of all other observers' public keys, the station ID, and the session window. This signature proves the signer was physically present with the others and observed their Bluetooth advertisements.

A WitnessBundle is valid if and only if:

- All attestation signatures verify against the declared presence public keys
- All session windows fall within the active count window for this station
- The station ID and election ID in each attestation match the TallyPacket header
- The reporter's own key does not appear in their own bundle entry (self-witnessing is invalid)

### 4.5 Photo and Location Evidence

Gold and Organisation submitters capture a photo of the physical tally sheet using `expo-camera` launched directly from the app. **Gallery upload is not permitted**: the photo must be taken live. GPS at capture time is embedded in EXIF and in signed TallyPacket fields.

The photo serves four distinct purposes:

- **Commitment.** The hash binds the submitter to a specific image at submission time. Substituting a different photo later would change the hash.
- **Physical presence signal.** A submitter who is not in the room cannot photograph the tally sheet posted in that room.
- **Location corroboration.** The GPS plausibility check provides a second presence signal independent of BLE, if a packet claims to be from a station but the GPS coordinate is 5km away, it is rejected.
- **Human evidence.** Photos are decrypted during dispute resolution for side-by-side visual review by designated auditors.

Photos are encrypted with a threshold key (3-of-5 root co-signers required to decrypt) and stored on IPFS, content-addressed by CID, pinned by Sovereign Relays for the election duration plus 90 days.

The photo is **not machine-comparable across submitters**: two photos of the same sheet, taken from different angles and under different lighting, produce different hashes. The protocol does not attempt automated photo agreement; the hash is a commitment, the photo is human evidence under dispute review.

**Location plausibility check** (enforced by all receiving nodes):

```
distance(photo_lat, photo_lng, station.lat, station.lng) > station.plausibility_radius_m
→ photo fields treated as absent → multiplier capped at ×1.0
```

Default `plausibility_radius_m` is 200m (urban), configurable up to 1000m for rural stations in `ElectionDefinition`. GPS spoofing on Android requires running a spoof process alongside PeerPulse on a TEE-attested device, significantly raising attack complexity. Combined with BLE WitnessBundle, the two presence signals are independent attack surfaces.

### 4.6 Session Keypair Lifecycle

Citizens use ephemeral session keypairs scoped to a single election and station. This limits the damage from key compromise and prevents cross-election linkability.

- Generated on-device when a citizen starts witnessing at a specific station.
- Scoped to `(election_id, station_id, date)`. The same key cannot be reused across elections or stations.
- The underlying ECDSA P-256 key lives inside the TEE and is non-exportable.
- Only the public key is shared, via Bluetooth advertisement. The private key never leaves the device.
- Discarded 24 hours after the election date.

## 5. BLE Station Presence

### 5.1 The Foreground Service

When the user taps **Start Witnessing** at the station entrance (near or after polls close):

1. A `WitnessStartPacket` is signed and gossipped.
2. An Android foreground service starts with a persistent notification: *"Witnessing [Station Name], tap to stop."*
3. Android Keystore generates the ECDSA P-256 device key inside the TEE. The attestation challenge is computed as `SHA-256(election_id || station_id || nonce)`.
4. The TEE-backed ECDSA key signs the Ed25519 session public key → `session_key_sig`.
5. Live location tracking begins via `expo-location`. GPS samples are kept in memory only.
6. The service advertises a BLE payload: `{ election_id, station_id, presence_pub_key }`. No personally identifying information is included.
7. The service scans for matching advertisements from other PeerPulse users at the same station entrance.
8. On discovery, devices exchange signed `WitnessAttestation` entries over Bluetooth GATT.
9. Discovered peers appear in the UI as live co-witnesses with a running count.
10. The service stops on submission, on explicit Stop, or 24 hours after `election_date`.

```mermaid
sequenceDiagram
  participant A as Reporter A
  participant B as Reporter B
  Note over A,B: BLE foreground service running at the station entrance
  A->>B: BLE advert {election_id, station_id, presenceKey_A}
  B->>A: BLE advert {election_id, station_id, presenceKey_B}
  A->>B: GATT WitnessAttestation signed by A over presenceKey_B
  B->>A: GATT WitnessAttestation signed by B over presenceKey_A
  Note over A,B: Both devices hold mutual proof of co-presence.<br/>No user action required.
```

The foreground service additionally performs opportunistic GossipSub synchronisation over Bluetooth when two devices are physically near each other without internet access, missing tally records propagate person-to-person even during a network blackout.

### 5.2 The Submission Gate

The primary *Submit Tally* button is locked until the witness count reaches `ElectionDefinition.min_witnesses` (default: 1). The UI shows live progress: *"Witnesses: 2 / 3, keep the app open."* This nudges citizens toward producing higher-trust submissions while keeping the app usable when no other observers are present.

A secondary *Submit without witnesses* path is always available, explicitly labelled as an unverified (Yellow) submission with a warning. Yellow submissions are recorded and visible on the dashboard but cannot contribute to a confirmation state.

### 5.3 Observation Model

Citizens stand at the **public station entrance**: the legally mandated area where, in Kenya and equivalent jurisdictions, the presiding officer must post the results form after counting. No access to the counting room is required. No accreditation is required to stand at the entrance.

The BLE session accumulates co-presence proof across the entire closing-and-counting window, typically several hours from polls close to results posting, not only the moment of result capture. This produces a denser witness graph than any single-instant ceremony could.

## 6. Trust Model and Tally Aggregation

### 6.1 The Seven Tiers

| Tier | Badge | Role | Submits Tallies | Base Weight |
|---|---|---|---|---|
| Platform | 💎 Diamond | PeerPulse platform keypair, signs metadata packets only | No | - |
| Government | 🥇 Gold | Electoral commissions and official state bodies | Yes | 1000 |
| Organisation, NGO/CSO | 🔵 Org-NGO | Civil society, observer missions, accredited NGOs | Yes | 500 |
| Organisation, Press | 📰 Org-Press | Accredited media organisations and journalists | Yes | 500 |
| Organisation, Party | 🏛️ Org-Party | Registered political parties and their agents | Yes | 500 |
| Attested Citizen | 🟢 Green | Citizens with valid BLE WitnessBundle | Yes | 100 |
| Reported Citizen | 🟡 Yellow | Citizens without BLE attestation | Yes | 1 |

The 1000 : 500 : 100 : 1 ratio is calibrated so that a 15-citizen BLE cluster — the realistic per-station observer density in target markets — can decisively override a single contradicting Gold submission, while keeping Gold and Organisation as clearly premium tiers when uncontested.

**Diamond.** The PeerPulse relay holds a persistent Ed25519 platform keypair, pinned in the mobile app at build time. Diamond signs metadata packets only. A `TallyPacket` referencing the Diamond key is rejected outright. Diamond establishes the authoritative list of elections without granting any authority over results.

**Gold.** Issued by PeerPulse via the GovernmentSubCA to verified electoral commissions. Device-bound 30-day leaf certs. Per-electoral-body slot caps prevent any single commission from accumulating more than one slot per station.

**Organisation.** Issued by PeerPulse via the ObserverSubCA. **Organisation certification is a paid, manually verified service.** PeerPulse is the sole issuer, self-service registration does not exist. All three Organisation sub-tiers share the same PKI path, same base weight, and same entity deduplication rules. They differ in fees and in how their submissions are displayed.

Political party submissions are always rendered in the UI with the party name visible. A station whose winning cluster is dominated by one party with no cross-party corroboration triggers an automatic CONTESTED override regardless of weight arithmetic, single-party dominance without challenge is not the value the protocol provides.

**Green.** Any citizen who starts witnessing, runs the BLE foreground service, and accumulates at least one valid mutual BLE attestation before submitting. No registration beyond on-device key generation. Base weight 100. Photo submission is encouraged for dispute-review value but does not multiply citizen weight, photo participation in safety-sensitive environments runs around 10%, and gating override power on photos would push the citizen threshold beyond achievable observer density.

### 6.2 PKI Hierarchy

```mermaid
graph TB
  ROOT["MasterRoot<br/>HSM-backed · 3-of-5 threshold"]
  GOVCA["GovernmentSubCA<br/>2-year TTL"]
  ORGCA["ObserverSubCA<br/>2-year TTL"]
  GOLD["OfficialLeaf<br/>30-day · device-bound<br/>🥇 Gold"]
  ORG["OrganisationLeaf<br/>30-day · device-bound<br/>🔵 NGO · 📰 Press · 🏛️ Party"]
  ROOT --> GOVCA
  ROOT --> ORGCA
  GOVCA --> GOLD
  ORGCA --> ORG
  style ROOT fill:#080c18,stroke:#eab308,color:#dce8f8
  style GOLD fill:#0c1222,stroke:#e8b84b,color:#dce8f8
  style ORG fill:#0c1222,stroke:#4d9ef6,color:#dce8f8
```

Diamond is pinned at build time and is not issued via SubCA.

The Master Root CA private key material never exists in software. Credential issuance and root rotation both require **3-of-5 co-signatures** from the following holders:

| # | Holder | Role |
|---|---|---|
| 1 | PeerPulse (vendor) | Operational key management |
| 2 | Contracting government | Sovereign stake in the deployment |
| 3 | Independent audit firm | Third-party verification |
| 4 | Civil society observer | Designated by client |
| 5 | Escrow | Sealed; released only under court order |

No single party, including PeerPulse itself, can unilaterally issue or revoke credentials. Prior to government adoption in a jurisdiction, holder #2 is held by an additional civil society representative.

**Revocation** requires 2-of-5 root co-signers. On receipt, nodes add the key to a local denylist and retroactively downgrade all packets from that key to Yellow.

### 6.3 The Witness Intersection Graph

All tally weight computation for a station runs locally on each node after receiving a batch of TallyPackets. The algorithm is deterministic, all honest nodes converge to the same result.

For a given station, build a graph where:

- **Nodes** are all submitters, identified by `presence_pub_key`.
- **Edges** connect two submitters if they appear in each other's WitnessBundle (BLE is mutual, so edges are undirected).

### 6.4 Main Cluster Identification and Connectivity Boost

Find all connected components in the witness graph. Rank them by sum of raw base weights. The component with the highest base weight sum is the **main cluster**. If two components have equal base weight, the one with more submitters wins; remaining ties are broken lexicographically by lowest `presence_pub_key`.

Submitters in non-main components receive a **×0.1 orphan penalty** on their effective weight. They remain in the aggregation and visible on the dashboard but cannot drive a confirmation state. This preserves all evidence while preventing isolated Sybil clusters from influencing results.

For each submitter, compute `n` = the number of fellow TallyPacket submitters for this station who appear in their WitnessBundle. Effective weight by tier:

| Tier | Formula | Notes |
|---|---|---|
| Gold | `base × min(1 + log₂(n+1), 2.0)` | Requires `photo_hash` and `photo_cid`; without photo, cap is ×1.0 |
| Organisation | `base × min(1 + log₂(n+1), 2.0)` | Same photo requirement; entity-capped per `org_id` |
| Green | `base × (1 + log₂(n+1))` | Full log curve, no cap |
| Yellow | `base × 1.0` | No boost |

| `n` | Multiplier |
|---|---|
| 0 | ×1.00 |
| 1 | ×2.00 |
| 3 | ×3.00 |
| 7 | ×4.00 |
| 15 | ×5.00 |
| 31 | ×6.00 |

**Why Gold and Organisation are capped at ×2.0.** Institutional trust is established at onboarding, not through witness count. The ×2.0 cap confirms physical presence (`n ≥ 1` already hits the cap) without allowing compromised institutional keys to gain disproportionate weight through high-`n` witness rings.

**Why Green gets the full log curve.** Witness connectivity is the citizen's entire trust mechanism. The curve creates strong incentive for BLE participation while making large-scale Sybil rings unprofitable due to diminishing returns.

### 6.5 Entity Deduplication

For Gold and Organisation submitters, group by `org_id` before summing weights. Each `org_id` contributes **at most one base weight slot** to any tally cluster (1000 for Gold, 500 for Organisation). If multiple observers from the same org submit:

- **Unanimous agreement**: one slot is counted at full effective weight.
- **Any disagreement**: the org's slot is invalidated for this station.

This prevents an org from purchasing additional weight by sending more observers.

### 6.6 Confirmation State Machine

After computing effective weights per tally cluster:

```
let winning = cluster with highest effective weight sum
let runner  = cluster with second-highest effective weight sum

if winning.weight >= 3 × runner.weight:
  if winning contains ≥1 Gold or Organisation slot:
    → CONFIRMED
  elif winning contains ≥10 TEE-attested Green citizens:
    → CITIZEN-CONFIRMED   (Gold/Org may be present in the runner cluster)
  else:
    → LEADING
elif runner.weight >= DISPUTE_THRESHOLD:
  if |winning.weight - runner.weight| / winning.weight <= 0.25:
    → DEADLOCKED
  else:
    → CONTESTED
else:
  → LEADING
```

`DISPUTE_THRESHOLD` defaults to **50** (half of one Green base weight) and is configurable per election. The threshold defines what counts as a credible challenger: anything below half a single citizen's base weight is not a meaningful dispute signal.

| State | Symbol | Meaning |
|---|---|---|
| LEADING | 🔵 | One cluster ahead but thresholds not met |
| CONFIRMED | ✅ | Result confirmed with institutional corroboration |
| CITIZEN-CONFIRMED | ✅🟢 | Result confirmed by citizens; Gold/Org may be present but in losing cluster |
| CONTESTED | ⚠️ | Two clusters are competitive, observers notified |
| DEADLOCKED | 🔴 | No cluster dominates, operator alert |

**Minimum quorum rule.** CONFIRMED requires at least one Gold or Organisation slot **in the winning cluster**: citizen weight alone cannot produce CONFIRMED. Without institutional corroboration in the winning cluster, the maximum achievable state is CITIZEN-CONFIRMED (subject to the TEE citizen threshold) or LEADING. The override case — winning cluster citizen-only, runner cluster Gold/Org — is the politically loaded state: the strongest publicly verifiable signal of institutional fraud the protocol produces.

**Worked example.** 15 Green citizens in one BLE cluster (n=14, multiplier ≈ 4.91) submitting the same tally produce 15 × 100 × 4.91 ≈ **7,365** effective weight. A single Gold submission to a contradicting tally, with photo and the ×2.0 multiplier cap, produces **2,000**. The 3.68× ratio satisfies the 3× confirmation rule, and the winning cluster contains ≥10 TEE-attested Greens → CITIZEN-CONFIRMED. This is the operational anchor: 15 honest TEE-attested citizens can produce a green confirmation against an objecting Gold.

### 6.7 The Evidence Window

After a station reaches CONFIRMED or CITIZEN-CONFIRMED, a **48-hour evidence window** opens. During this window, any node may submit a contradicting TallyPacket with a valid photo hash pointing to a different result. A valid contradicting submission reopens the result to CONTESTED. After 48 hours with no valid contradiction, the result locks permanently. Photo hash is required to reopen a confirmed result, bare tallies cannot challenge a locked confirmation.

### 6.8 Split-Witness Flag

If the main cluster identification step finds two components with base weight sums within 20% of each other, the station is flagged as **split-witness** regardless of the confirmation outcome. The flag triggers human review, it may indicate a large venue where BLE range split legitimate observers into two groups, or it may indicate an unusual pattern worth investigating.

## 7. Validation Pipeline

Every packet received via GossipSub is processed through the following pipeline before storage or relay:

```mermaid
flowchart TD
  R[Packet received via GossipSub] --> S{Schema version known?}
  S -->|No| X1([Reject])
  S -->|Yes| C{Seen cache hit?}
  C -->|Yes| X2([Drop silently])
  C -->|No| T{Timestamp inside<br/>count window?}
  T -->|No| X3([Reject — temporal gate])
  T -->|Yes| CC{Has CertChain?}
  CC -->|Yes — Gold/Org| GC{Chain → pinned root?}
  GC -->|No| X4([Reject])
  GC -->|Yes| PH{photo_hash + photo_cid?}
  PH -->|No| ST1([Store, cap multiplier ×1.0])
  PH -->|Yes| SV{Signature valid?<br/>sequence_num > last?}
  SV -->|No| X5([Reject])
  SV -->|Yes| ST2([Store · relay · update UI])
  CC -->|No — Citizen| WB{WitnessBundle<br/>present?}
  WB -->|No| Y([Store as Yellow<br/>weight 1])
  WB -->|Yes| AV{All attestations<br/>valid?}
  AV -->|No| X6([Reject])
  AV -->|Yes| HW{HWAttestation<br/>present and valid?}
  HW -->|Yes| GA([Store Green<br/>hw_attested=1, weight 100])
  HW -->|No| GB([Store Green<br/>hw_attested=0, weight 100])
  style X1 fill:#0c1222,stroke:#ef4444,color:#dce8f8
  style X3 fill:#0c1222,stroke:#ef4444,color:#dce8f8
  style X4 fill:#0c1222,stroke:#ef4444,color:#dce8f8
  style X5 fill:#0c1222,stroke:#ef4444,color:#dce8f8
  style X6 fill:#0c1222,stroke:#ef4444,color:#dce8f8
  style GA fill:#0c1222,stroke:#22c55e,color:#dce8f8
  style GB fill:#0c1222,stroke:#22c55e,color:#dce8f8
  style ST2 fill:#0c1222,stroke:#e8b84b,color:#dce8f8
  style Y fill:#0c1222,stroke:#eab308,color:#dce8f8
```

The seen cache is keyed on a SHA-256 hash of the serialised packet. Duplicate packets received via multiple gossip paths are dropped silently after the first acceptance.

The temporal gate accepts submissions only within the per-station count window. Submissions received before `check_in_opens_at` are rejected; submissions after `count_closes_at + 2 hours` are flagged late and weight-reduced to Yellow regardless of tier; submissions after `election_date + 24 hours` are rejected entirely. The 2-hour grace window accommodates slow BLE propagation and connectivity issues at remote stations.

The 16-byte nonce provides replay resistance within the timestamp window. The monotonic `sequence_num` requirement prevents a single key from submitting multiple conflicting tallies.

## 8. Network Architecture

### 8.1 libp2p and GossipSub

All packet transport uses **js-libp2p v3** with the GossipSub publish-subscribe protocol. GossipSub provides mesh-based propagation for redundancy, peer scoring to isolate misbehaving nodes, and topic-based filtering.

Transport protocols in use:

- **WebSocket**: mobile devices connecting to Sovereign Relays over the internet
- **TCP**: desktop nodes and direct LAN connections
- **Circuit Relay v2**: nodes that cannot accept inbound connections (behind NAT)
- **mDNS**: local network discovery without internet
- **Bluetooth Low Energy**: presence attestation and opportunistic offline sync

### 8.2 Offline-First Operation

The network degrades gracefully under infrastructure pressure: internet relays → LAN mDNS → BLE person-to-person. A tally captured in a remote area with no connectivity will propagate outward hop-by-hop as observers travel, eventually reaching a Sovereign Relay.

### 8.3 Sovereign Relays

Sovereign Relays run `apps/node`: a headless Node.js binary running libp2p, an HTTP info endpoint on port 9876, and a WebSocket listener on port 9090. They are identified by a pre-shared key rather than a domain name, which means their addresses can be distributed out-of-band and are resistant to DNS blocking.

Any organisation can operate a Sovereign Relay using the public Docker image. A government deploying PeerPulse for an official election may operate its own relays alongside community-operated ones.

Minimum deployment: 3 Sovereign Relays per election, with at least 2 in the target country and 1 external. Hosting recommendations are 1984 Hosting (Iceland) or Mullvad, jurisdictions with strong press freedom protections and no US/UK exposure. Anonymous registration; Monero payments.

## 9. Security Analysis

### 9.1 Threat Model

PeerPulse is designed against adversaries who:

- Control the internet infrastructure in the deployment environment
- Control the official election administration
- Have resources to operate coordinated Sybil nodes on the gossip network
- Can legally compel software companies and cloud providers in their jurisdiction

PeerPulse is **not** designed against adversaries who:

- Can compromise the devices of a majority of observers
- Can physically deploy large numbers of real TEE-attested Android devices to every contested station simultaneously
- Control 3 of 5 root CA key holders acting in concert

### 9.2 Realistic Threats and Defences

PeerPulse's threat model is grounded in how election fraud actually happens at counting stations. The mass-device attack (50 phones brought to a station) is theoretically analysable but operationally implausible at scale, the count is a public, witnessed event and everyone in the room sees the same physical tally sheet. The realistic threats are:

| Attack | Description | Primary defence |
|---|---|---|
| **Insider fraud** | A legitimate official or party agent physically present submits a false tally | Photo hash (can't photograph a fake sheet in the room); citizen honest majority |
| **Remote phantom** | Someone submits a tally for a station they never attended | Photo hash + GPS plausibility + orphan penalty |
| **Onboarding fraud** | A fake Organisation certified before the election, deployed at scale | Registration deadline, jurisdiction verification, cross-election reputation, 3-of-5 issuance |
| **Compromised Org key** | A legitimate Org's key is stolen or coerced | Entity cap (one slot per org), revocation, cross-station consistency check |
| **Suppression** | Intimidation or phone confiscation prevents honest submissions | Offline queue, BLE relay, social/legal, out of protocol scope |

### 9.3 Honest Majority Principle

Within the citizen tier, the PeerPulse aggregation model guarantees: **if the majority of citizens physically present at a station submit honestly, the correct result wins.**

Within a connected BLE component, all citizens have `n ≈ (total_submitters − 1)`. The log multiplier is therefore identical for all members of that component. Effective weight per citizen is `100 × f(n)`: a constant across honest and dishonest alike. The winning tally is determined by submitter count alone within the component: a pure majority vote. Honest majority in count → honest majority in weight → correct result.

This holds whether dishonest citizens BLE with honest ones (same multiplier, count vote) or form their own cluster (orphan penalty further reduces their weight). The principle breaks only if the citizen majority **and** the institutional tier at the same station are simultaneously corrupt, operationally implausible in a normal counting environment where party agents from opposing parties are present.

### 9.4 Cost of Attack at Scale

The TEE hardware attestation requirement prices out software Sybil attacks. Physical device farms (real Android hardware) cost USD 150–300 per device. At 10,000 stations with 50 devices per station, a nationwide physical infiltration attack costs USD 75–150M in hardware alone, requires coordinated physical presence at every station simultaneously, and every participant is a potential defector.

The full Sybil-resistance picture: an attacker must (i) procure TEE-attested Android devices at scale, (ii) deploy them physically to specific stations, (iii) maintain mutual BLE attestation among them without being detected as a closed clique, (iv) produce GPS coordinates inside the plausibility radius, and (v) photograph the actual posted tally, which constrains what numbers can be submitted to what the rest of the room can also see.

### 9.5 Cryptographic Validation Suite

| Case | Expected |
|---|---|
| Valid Gold tally with photo | Accepted, stored as gold, multiplier ×2.0 |
| Valid Gold tally without photo | Accepted, stored as gold, multiplier capped at ×1.0 |
| Payload bit-flip | Rejected at signature step |
| Expired timestamp | Rejected |
| Submission outside count window | Rejected, temporal gate |
| Unknown `schema_version` | Rejected |
| Replayed nonce | Dropped silently |
| Out-of-order `sequence_num` | Rejected |
| Revoked key | Rejected after RevocationPacket received |
| Chain to wrong root | Rejected |
| Valid BLE WitnessBundle (3 witnesses) | Green, `hw_attested = 0` |
| Valid HW attestation + BLE WitnessBundle | Green, `hw_attested = 1` |
| HW attestation: `security_level = Software` | `hw_attested = 0`, weight unchanged |
| HW attestation: wrong `package_name` | Rejected |
| HW attestation: wrong APK signing cert | Rejected |
| HW attestation: challenge mismatch | Rejected |
| Tampered WitnessBundle attestation | Rejected |

## 10. Privacy Considerations

### 10.1 What Is Visible on the Network

All `TallyPacket`, `IntentPacket`, and `WitnessStartPacket` data is broadcast publicly over GossipSub. Any node can observe all packets. The following information is therefore public:

- Station ID and election ID of every submission
- Public key associated with each submission
- Vote counts in each tally
- Photo hash and IPFS CID
- GPS coordinates of capture
- WitnessBundle public keys (but not the real-world identities behind them)

### 10.2 What Is Not Visible

- Private key material used to sign any packet
- Real-world identity of any participant, there is no identity registration in the protocol
- IP address of submitting devices, packets are gossipped; originating IP is not included
- Bluetooth MAC addresses, Android randomises BLE MAC addresses; no persistent hardware identifier is exposed
- Demographic profile data, stored locally only, never transmitted
- The plaintext of encrypted photos until the threshold key (3-of-5 root co-signers) authorises decryption for dispute review

### 10.3 Linkability

Session keypairs are scoped to a single election and station, limiting long-term linkability for tally submissions. Long-term device keypairs (used for `IntentPacket` and `WitnessStartPacket`) carry higher linkability risk across elections.

Participants in high-risk environments should be advised that their participation pattern, which elections and stations they observe, is visible to any network observer. GPS coordinates are signed in every TallyPacket; a participant's station appearances are publicly auditable.

## 11. Limitations and Future Work

**Vote anonymity.** v7 does not provide anonymous voting. Full cryptographic anonymity using zero-knowledge proofs (Semaphore or equivalent) is a planned future protocol version.

**Threshold signing scheme.** Whether to use FROST or Shamir's Secret Sharing for root CA threshold operations is an open implementation question. FROST produces standard Ed25519 signatures verifiable by any off-the-shelf library; Shamir requires an offline ceremony and separate verification logic.

**Cross-jurisdiction PKI federation.** v7 uses a single root CA. A future version could support federating multiple root CAs across jurisdictions, allowing regional election monitoring bodies to operate independent roots.

**Huawei attestation path.** Devices without Google Play Services currently fall back to BLE-only trust. A future revision may support Huawei HUKS attestation as a secondary trusted root.

**Election law.** Parallel vote tabulation occupies a legally ambiguous position in many jurisdictions. Operators deploying the application for a specific election are responsible for obtaining jurisdiction-specific legal counsel. Kenya legal review is complete. Reviews for Nigeria, DRC, Philippines, and Indonesia are pending and tracked in the project's elections pipeline.

## 12. Conclusion

The most important thing about PeerPulse is what it does not require.

It does not require a citizen to join an organisation. It does not require pre-coordination with other observers. It does not require internet access. It does not require a trusted server. It does not require a government to cooperate.

A citizen goes to their polling station. They stand at the public entrance, the area where, by law, results must be posted after counting. They tap Start Witnessing. Their phone automatically generates a hardware-attested signing key, discovers other PeerPulse users nearby, and silently exchanges cryptographic attestations. When the count concludes and the tally is posted, they photograph it. Their report goes out over a peer-to-peer network with no single point of failure, carrying three independent proofs that they were physically present.

*PeerPulse is open-source software. The protocol specification, application source code, and this document are published for public review and independent implementation. No entity controls the network.*

*Contact: `press@peerpulse.app`*

## Appendix A: Cryptographic Primitives

| Primitive | Algorithm | Library |
|---|---|---|
| Citizen session signing | Ed25519 | `@noble/curves` |
| TEE device key | ECDSA P-256 | Android Keystore (TEE / StrongBox) |
| Packet hashing | SHA-256 | `@noble/hashes` |
| BLE payload | Ed25519 public key (32 B) + station metadata | Binary-encoded |
| Nonce generation | CSPRNG, 16 bytes | Platform random |
| Certificate format | X.509 v3 | CFSSL-generated |
| Root key protection | HSM (hardware-backed), 3-of-5 threshold | Vendor TBD (AWS CloudHSM / Thales / YubiHSM under evaluation) |
| Photo encryption | Threshold encryption (3-of-5) | TBD |

## Appendix B: Performance Targets

| Metric | Target |
|---|---|
| Tally propagation, relay path | < 15 s |
| Tally propagation, LAN path | < 5 s |
| BLE station peer discovery | < 30 s from witnessing start |
| BLE attestation exchange | < 20 s automatic |
| Dispute detection | < 1 s after conflicting packet received |
| RevocationPacket propagation | < 30 s |
| APK share via local HTTP | < 30 s to install on nearby device |
| HW attestation verification (offline) | < 500 ms per packet |
| Witness graph computation per station | < 100 ms |
| Malicious packet rejection | 100% |

