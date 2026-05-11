# PeerPulse — Resilience & Strategic Properties

**Version:** 1.0
**Depends on:** `spec-strategy.md`, `spec-operations.md`, `tabulate/spec-protocol.md`

---

## 1. The Legitimacy Inversion

### 1.1 The current default

Today, the official result *is* the result unless fraud is proven. The burden of proof is on challengers. Electoral commissions certify; civil society disputes; courts adjudicate. The asymmetry favours the incumbent.

### 1.2 How PeerPulse shifts the default

Once PeerPulse reaches critical mass in a jurisdiction, a new category of result exists: **verified**. A result that matches the parallel count is confirmed by cryptographic citizen evidence. A result with no parallel count — or one where verification was blocked — carries an implicit question the incumbent must answer:

> *Why wasn't this verified?*

The burden does not shift legally. It shifts politically and reputationally, which is where elections are actually won and lost in the international arena.

### 1.3 Legitimate winners want this most

The counterintuitive truth: the presidents with the strongest incentive to want PeerPulse are the ones who actually won.

Ruto won Kenya 2022 by 50,000 votes in a country of 22 million registered voters — 0.6 percentage points. A Supreme Court challenge followed. He survived it, but the cloud persists. If PeerPulse had confirmed his win with 46,229 signed station tallies carrying hardware attestation and BLE witness counts, the challenge would have had nowhere to stand. A president in that position would pay for that credential.

A rigged win requires no verification. A real win benefits enormously from unimpeachable verification. PeerPulse gives legitimate winners something no official process can provide: cryptographic proof that no court challenge, no opposition campaign, and no foreign government can invalidate after the fact.

### 1.4 The ratchet

Once one election in a region is PeerPulse-verified, every subsequent unverified election is implicitly incomplete. This is the HTTPS pattern: optional at first, then browsers marked HTTP sites "Not Secure," then HTTP became the liability. The default flipped. PeerPulse creates the same ratchet for election legitimacy.

Kenya 2027 verified → Nigeria 2031 without verification looks incomplete → regional press asks why → the question becomes the story.

### 1.5 The competitive dynamic

In a contested race with two serious candidates:

- Candidate A encourages PeerPulse observers at every station
- Candidate B opposes or suppresses PeerPulse

If Candidate B wins the official count but PeerPulse shows a discrepancy — or shows absent data because observers were expelled — Candidate A holds a permanent narrative anchor regardless of legal outcome. If Candidate B wins and PeerPulse confirms it, they lose the ability to claim suppression, and the data is clean.

The candidate who knows they will win legitimately has every incentive to invite verification. The candidate who requires opacity has every incentive to block it — and blocking it is now its own signal.

### 1.6 The demand-pull on governments and electoral commissions

This mechanism creates pull-side demand for institutional participation without any sales effort. An electoral commission watching 50,000 citizens run a parallel count that matches their own result has a strong incentive to become a Gold-tier participant — not because they are compelled to, but because Gold certification converts citizen verification into institutional endorsement.

> *"The IEBC result, confirmed by 120,000 independent observers on PeerPulse"*

is a stronger statement than

> *"The IEBC result, disputed by 120,000 independent observers on PeerPulse."*

They participate to claim the credibility. The citizen network is the GTM motion.

### 1.7 The endgame

A world where PeerPulse is established produces three outcome categories:

| Outcome | Implication |
|---|---|
| Win with PeerPulse confirmation | Unassailable legitimacy — cryptographic record no challenger can dispute |
| Win with no PeerPulse data | Legitimacy gap — opposition and press fill the vacuum with doubt |
| Win against PeerPulse data | Internationally untenable — the record exists and cannot be altered |

No legitimate president wants to leave a gap. No rigging president can close one without being caught. The technology creates a new political credential — the verified win — and its absence becomes the story.

---

## 2. The Shutdown Boomerang

### 2.1 The standard shutdown calculus

A government shuts down the internet on election day to suppress real-time verification: cut communications → delay reporting → buy time to manipulate or dispute results before international pressure mounts.

PeerPulse inverts that calculus entirely.

### 2.2 What a shutdown cannot stop

- **BLE witnessing** — Bluetooth operates independently of internet; co-witnesses continue to discover and attest each other throughout the shutdown
- **Local signing** — Ed25519 signing is on-device; the private key never leaves the phone; no network required to sign a TallyPacket
- **SQLite storage** — every packet is persisted locally; packets accumulate across all observer devices simultaneously
- **LAN gossip** — observers in coordination centres gossip packets via mDNS over shared Wi-Fi with no internet connection; the network rebuilds itself locally

### 2.3 What happens when internet restores

The relay receives a flood of packets created, signed, and witnessed *during* the shutdown. Critically:

- `created_at` is inside the signed payload — it cannot be backdated
- The TEE attestation proves the key was on real hardware at that moment
- GPS coordinates place the device at a specific location at a specific time
- BLE witness counts that accumulated *because* observers were cut off from the relay and had to wait together at station entrances

The shutdown did not suppress anything. It created a denser, more fully-witnessed record than would have existed without it.

### 2.4 The deterrence mechanism

Deterrence requires the government to know this in advance. With PeerPulse deployed at scale, a government considering a shutdown faces the following calculation:

> *Shut down internet → gain nothing → signed tallies flood the relay on restoration → the shutdown itself becomes evidence of intent to manipulate → international press story is now about both the shutdown and the discrepancy.*

A shutdown without PeerPulse buys time. A shutdown with PeerPulse deployed at scale buys condemnation and no time. The government has stronger incentive not to shut down at all.

### 2.5 The design element that makes it true

The LAN gossip and SQLite offline storage (Build Gate 1) are not edge-case resilience features — they are the mechanical foundation of the shutdown deterrence argument. Without durable local storage and mDNS peer discovery, a shutdown could scatter and lose packets. With them, the entire observer network becomes a durable buffer. The relay is the final delivery mechanism; the evidence exists the moment a citizen taps Submit.

---

## 3. Ban Resistance

### 3.1 Why banning normally works

A government bans Telegram: pressure Apple and Google to remove it from app stores. New installs stop immediately. Existing users can be blocked at the network level via ISP-mandated DNS or deep packet inspection. This works because the product lives at seizable points: the store listing, the company identity, the server infrastructure.

PeerPulse has none of those.

### 3.2 Attack surface analysis

| Vector | Effectiveness | Why |
|---|---|---|
| App store removal | None | Not on Google Play by design — the Navalny precedent is exactly this attack |
| Block download domain | Low | Njalla-registered, Swedish jurisdiction; APK share sheet propagates via WhatsApp before any block takes effect; blocking WhatsApp is its own international incident |
| Seize relay servers | Low | 1984 Hosting Iceland, anonymous registration, Monero payments; MLAT to Iceland requires years and a crime under Icelandic law; LAN gossip continues without any relay |
| Internet shutdown | Counterproductive | See §2 — makes the record more complete, not less |
| Make app illegal | High cost, low effect | Criminalising parallel vote tabulation when 80,000 civil society observers are active generates the global story before the election does; cannot invalidate signed data already on phones |
| Confiscate phones | Visible, bounded | Mass confiscation at 120,000-observer scale requires a documented security operation that generates its own international condemnation; data on other phones is unaffected |
| Fake APK at download | None | APK signing key on air-gapped machine, never linked to any identity; mismatched signature fingerprint is detected on install; SHA-256 checksum lets anyone verify before installing |
| Compromise PKI root | Hard | 3-of-5 threshold HSM-backed signing; Swiss Foundation legal structure; MLAT proceedings under Swiss law; multiple years minimum |
| DPI / traffic blocking | Moderate, defeatable | libp2p Noise encryption; traffic can be tunnelled; same mitigations as Signal/Tor |

### 3.3 The Streisand amplifier

Every suppression attempt that becomes visible — a domain block, an ISP order, an observer arrested — feeds the exact press narrative that makes PeerPulse's evidence credible. A government that bans an election verification app the week before an election has already told the world what they expect the count to show.

The attempt to suppress is stronger evidence of intent than any discrepancy in the tally.

### 3.4 The protocol property

PeerPulse is a protocol, not a service. BitTorrent cannot be banned — it can be made harder, but the protocol survives because it lives on the devices of its users, not on any server. Once data is signed, timestamped, and stored on a critical mass of phones, no ban issued after that moment can make it not exist.

Any developer can run a compatible relay. Any developer can build a compatible app against the open protocol. The Swiss Foundation holds the PKI root governance; the code is open-source. There is no single point of failure that maps to a single point of legal attack.

### 3.5 Honest limits

PeerPulse cannot protect against:

**Physical violence against observers.** The app does not stop arrests, beatings, or intimidation at stations. Mitigation: civil society seeding model deploys observers in groups with legal support; each incident is itself a documented international story.

**Chilling effects from legal uncertainty.** In a jurisdiction where parallel tallying has not been explicitly reviewed and cleared, legal ambiguity suppresses participation without any actual ban. Mitigation: legal review (see `legal-review-kenya.md`) is a pre-deployment requirement; a completed review is a publicly distributable civil society document.

**Pre-election suppression of the civil society partner.** If ELOG is shut down before the election, the observer corps does not form. The app and protocol survive but coverage collapses. Mitigation: distribute seeding across multiple independent civil society organisations, not a single point of failure.

**Early bans before installation reaches scale.** A government that bans and blocks before the app reaches a critical mass of installed devices prevents the self-distribution network from forming. Mitigation: this is why the 4–6 month seeding window is non-negotiable — it gets the app onto tens of thousands of phones before any government response crystallises.

### 3.6 The combined effect

The three properties — legitimacy inversion, shutdown boomerang, ban resistance — compound each other:

- A government cannot ban the app without generating the story that makes the app's evidence credible
- A government cannot shut down the internet without making the evidence more complete
- A government that wins legitimately has every reason to want the verification
- A government that wins illegitimately cannot suppress the record once observers are in place

The optimal government response to PeerPulse — if the election is clean — is to become a Gold-tier participant and endorse the result. That is the B2G path. The platform is designed so that cooperation is the rational choice for any government that expects to win fairly.
