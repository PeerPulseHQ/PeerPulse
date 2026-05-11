# PeerPulse — Strategy

**Version:** 7.0
**See also:** `spec-resilience.md` — legitimacy inversion, shutdown boomerang, ban resistance

---

## 1. Go-to-Market Strategy

### 1.1 The Launch Principle

PeerPulse launches at an election, not on a date. The app goes viral when it is used in a real election and the data matters. The first election where PeerPulse captures tallies that match or contradict the official result is the event that drives press coverage, downloads, and network growth.

**Everything is timed to one specific target election.**

### 1.2 Target Election Criteria

- Active, organised civil society with existing observer networks
- Contested expected result
- High Android penetration; WhatsApp/Telegram as primary communication channels
- International press interest
- Legal environment where parallel tallying is not explicitly criminalised
- Minimum 4 months lead time for civil society seeding

Primary target markets: Uganda, Kenya, DRC.

### 1.3 Seeding Sequence

**4–6 months before election:**
- Identify 3–5 civil society organisations with existing observer corps
- Reach out pseudonymously (`press@peerpulse.app`) with the whitepaper and a working APK
- Run a pilot — install the app on their observers' devices for a by-election or local vote
- Gather feedback; fix what breaks

**2–4 weeks before election:**
- Brief 2–3 international journalists covering the election (Rest of World, The Intercept, Al Jazeera English, BBC Africa)
- Coordinate publication for election day or results day — not before, to avoid alerting the government
- F-Droid listing live; direct APK download at `peerpulse.app/download`

**Election day:**
- Civil society partners run reporter briefings — the briefing is the install event
- BLE auto-witnesses co-located observers without coordination
- Real tally data flows

**Post-election:**
- Clean count: *"Citizens independently verified the result"*
- Discrepancy: global story

### 1.4 Viral Mechanics

| Mechanic | How it works |
|---|---|
| APK share sheet | One coordinator → 20 reporters via WhatsApp in 5 minutes |
| mDNS HTTP server | One phone → all devices on a shared Wi-Fi at a coordination centre |
| International press | One Reuters or BBC Africa article → 50,000 downloads in 48 hours |
| Diaspora networks | Every target market has a diaspora that follows home-country elections obsessively |

### 1.5 Press Identity

The founder does not appear. The product and the protocol speak.

- All press: `press@peerpulse.app` — ProtonMail alias behind Njalla domain
- All public materials attributed to *"PeerPulse contributors"*
- Founder surfaces on their own terms, if at all, after the network is established

### 1.6 Demand-pull on institutions

Citizen-first adoption is not altruistic — it is the GTM strategy. A critical mass of citizens using the app during elections creates demand-pull pressure on governments, electoral commissions, and NGOs to participate as credentialed authorities. An electoral commission that sees 50,000 citizens independently corroborating (or contradicting) its own counts has strong incentive to become a Gold-tier participant. Adoption precedes institutional engagement.

---

## 2. Legal Structure

### 2.1 Entity Strategy

**Phase 1 — No Entity (through first viral election)**

No incorporated entity. The protocol is open-source software released by "PeerPulse contributors." There is no headquarters to raid, no CEO to subpoena.

**Phase 2 — Swiss Foundation (post-MVP, before institutional partnership)**

A Swiss Foundation (*Stiftung*) is established with a nominee professional council — the founder does not appear in the Swiss Commercial Register or any public document.

```
[Founder — not in any public document]
        ↓
[Foundation deed — records founder's rights; held by Swiss notary]
        ↓
[Swiss Foundation (Stiftung) — Geneva or Zurich]
  Council: 3 nominee professional trustees
  Purpose: "promotion of electoral integrity and civic participation"
        ↓
[Holds: protocol IP, open-source code, PKI root governance]
        ↓
[Swiss GmbH — commercial arm]
```

**Why Switzerland:** The governments PeerPulse targets (Uganda, Kenya, DRC) have no leverage over Switzerland. Compelling Swiss courts to unmask a foundation's beneficial patron requires formal MLAT proceedings demonstrating a crime under Swiss law — election monitoring is not a crime under Swiss law.

### 2.2 Alternatives Considered

| Option | Identity protection | Institutional optics | Banking | Decision |
|---|---|---|---|---|
| Swiss Foundation (nominee) | Strong | Excellent | Good | **Selected** |
| Marshall Islands DAO LLC | Very strong | Poor | Hard | Backup if cost prohibitive |
| Seychelles IBC | Weak (post-2022 FATF) | Toxic | Very hard | Rejected |

### 2.3 PKI Root Key Custody

When the Swiss Foundation is operational, the 3-of-5 root key holders require formal legal agreements covering signing ceremony procedures, liability for key loss, and escrow release conditions. Prior to government adoption, holder #2 (contracting government) is held by an additional civil society representative.

---

## 3. Operational Security

### 3.1 Asset Protection

| Asset | Tool | Rationale |
|---|---|---|
| Domain | Njalla | Registered in Njalla's name; Swedish law; no WHOIS trace |
| Relay servers | 1984 Hosting (Iceland) or Mullvad | Strong press freedom; resistant to informal pressure |
| Infrastructure payments | Monero | Transaction-private |
| Code hosting | Pseudonymous GitHub org | VPN/Tor for commits; no personal account linkage |
| APK signing key | Air-gapped machine; YubiKey storage | Never linked to any identity |
| Press contact | ProtonMail (`press@peerpulse.app`) | No phone number; E2E encrypted |
| Operational comms | SimpleX | No phone number; no server stores messages |

### 3.2 Identity Threat Vectors (Ranked)

1. **APK signing key** — certificate fingerprint is in every APK. Custody as above.
2. **Domain registration** — solved by Njalla.
3. **Code commits** — Git metadata (email, timezone) is forensically useful. Pseudonymous identity; VPN commits.
4. **Infrastructure payments** — solved by Monero.
5. **Press contact** — ProtonMail with no phone number.

### 3.3 APK Signing Key Policy

- Generated on an air-gapped machine never connected to the internet
- Never linked to a Google developer account or any traceable identity
- Stored on hardware security media (YubiKey or equivalent) in at least two geographic locations
- If compromised: all installed copies cannot update in-place and must reinstall from a fresh APK
- Rotation procedure and backup policy to be documented before first public distribution

---

## 4. Open Questions

| # | Question |
|---|---|
| 1 | **Swiss Foundation timing** — set up before or after first viral traction? |
| 2 | ~~**First target election**~~ **DECIDED: Kenya General Election, 10 August 2027.** Civil society seeding begins October 2026. See `elections-pipeline.md`. |
| 3 | ~~**Kenya election law review**~~ **COMPLETE.** See `legal-review-kenya.md`. No blocker to deployment. Three pre-launch actions: ODPC registration once an entity exists, Nairobi advocate to confirm Regs 62/63/67 phone ban scope, civil society PBO compliance verified for seeding partners. |
| 4 | **Nigeria go/no-go** — decide by July 2026 whether Nigeria (Feb 2027) is a parallel launch market. If yes, legal review and YIAGA Africa outreach must begin immediately. See `elections-pipeline.md`. |
| 5 | **HSM vendor** — AWS CloudHSM, Thales, or YubiHSM for root key shares? |
| 6 | **APK signing key custody** — backup procedure and rotation policy to be documented |
| 7 | **Press legal review** — all copy passes legal review before any election-specific market is targeted |
| 8 | **Marshall Islands DAO LLC** — cost/benefit analysis if Swiss Foundation cost is prohibitive |
