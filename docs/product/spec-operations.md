# PeerPulse — Operations

**Version:** 7.0
**Depends on:** `spec-protocol.md`, `spec-trust.md`

---

## 1. Election Lifecycle

### 1.1 Phases

| Phase | When | Key Actions |
|---|---|---|
| **Setup** | 4–6 weeks before election | Publish `ElectionDefinition`, issue Gold/Org certs, deploy relays |
| **Seeding** | 4–6 weeks before election | Civil society outreach, APK distribution, pilot run |
| **Pre-election** | Up to election day | `IntentPacket` accumulation, station map population |
| **Election day** | Count period | `WitnessStartPacket`, BLE ceremony, `TallyPacket` submission |
| **Evidence window** | 48h post-result | Contradicting submissions accepted; photos pinned |
| **Lock** | 48h after CONFIRMED | Results immutable; photos retained for 90 days |

### 1.2 ElectionDefinition Fields

Key fields operators must set:

| Field | Notes |
|---|---|
| `election_id` | Unique, human-readable (e.g. `ke-general-2027`) |
| `jurisdiction` | ISO 3166-2 country code |
| `election_date` | Unix timestamp of count day |
| `polls_close_time` | Unix timestamp when polls close — drives election day notifications for IntentPacket holders |
| `org_registration_deadline` | Cutoff for Organisation cert applications — recommend 2 weeks before election |
| `dispute_threshold` | Default 5 — review against target threat model before deployment |
| `stations` | Full list of polling stations with IDs, names, coordinates |

---

## 2. Organisation Onboarding

### 2.1 Application Process

Applications submitted to `press@peerpulse.app`. Required documents:
- Legal registration certificate in the jurisdiction of the target election
- Names of designated observers (may be pseudonymous if observers are at personal risk)
- Target election name and `election_id`
- Preferred contact channel (ProtonMail, SimpleX)

PeerPulse manually verifies legal existence. Turnaround: 5–10 business days. Rushed applications (less than 2 weeks before the `org_registration_deadline`) may be declined.

### 2.2 Cert Issuance

On approval: 3-of-5 root co-signers produce an OrganisationLeaf cert under the ObserverSubCA. The cert is:
- Bound to the organisation's `org_id` (derived from legal registration number + jurisdiction)
- Valid for the election duration + 7 days
- Device-bound — each observer device generates its own keypair; the cert signs the device public key

Multiple observers from the same org receive separate leaf certs but share the same `org_id`. Weight is entity-capped to one slot (500) per station per org.

### 2.3 Pricing

Organisation certification is offered to accredited bodies. Subsidised or zero-cost certification is available for civil society organisations in target markets at PeerPulse's discretion. Commercial terms are not published here.

---

## 3. Deployment

### 3.1 Sovereign Relay Requirements

| Requirement | Specification |
|---|---|
| Minimum relays at launch | 3 |
| Geographic distribution | ≥2 in target country, ≥1 external |
| Hosting | 1984 Hosting (Iceland) or Mullvad — no US or UK |
| Identity | Anonymous — Monero payments, no traceable registration |
| Ports | WS: 9090, Info endpoint: 9876 |
| TLS | Required in production; nginx reverse proxy |

### 3.2 IPFS Photo Storage

Relay nodes run an IPFS node pinning all `photo_cid` references received during the election. Retention: election duration + 90 days. After 90 days, photos are unpinned unless a dispute is still open.

Community relay operators who opt into IPFS pinning receive a pinning fee (rate TBD per election contract). Pinning is opt-in for community relays; mandatory for Sovereign Relays operated by PeerPulse.

### 3.3 Pre-Deployment Checklist

- [ ] `ElectionDefinition` signed by Diamond key and gossipped
- [ ] `polls_close_time` set correctly in `ElectionDefinition` — drives all election day notifications
- [ ] `org_registration_deadline` set and communicated to civil society partners
- [ ] Gold certs issued to verified electoral body (if participating)
- [ ] Organisation certs issued to all verified observer organisations
- [ ] Minimum 3 Sovereign Relays operational and reachable
- [ ] IPFS nodes running and pinning-ready on all Sovereign Relays
- [ ] APK build signed and published to `peerpulse.app/download`
- [ ] F-Droid listing live (or submission pending)
- [ ] `dispute_threshold` reviewed for this election's threat model
- [ ] Legal review of parallel tallying in jurisdiction complete

---

## 4. Monitoring & Anomaly Detection

### 4.1 Dashboard Signals

The Desktop war room and Website monitoring surface display per-station:

| Signal | Description |
|---|---|
| Submission count | Total TallyPackets received |
| Witness density | Average n across submitters |
| Confirmation state | CONFIRMED / CITIZEN-CONFIRMED / LEADING / CONTESTED / DEADLOCKED |
| Photo coverage | % of Gold/Org submissions with valid photo_hash + photo_cid |
| hw_attested ratio | % of citizen submissions that are TEE-attested |
| Split-witness flag | Two sub-clusters detected in witness graph |
| Orphan count | Submissions in non-main clusters |

### 4.2 Automatic Flags

The following trigger automatic flags for Diamond-tier operator review:

| Flag | Condition |
|---|---|
| **High orphan ratio** | >20% of submissions are in non-main clusters |
| **Anomalous submission count** | Station submission count >3× historical average for similar stations |
| **Burst timing** | ≥5 submissions from same station within 500ms of each other |
| **Org outlier pattern** | Org's submissions are CONTESTED or DEADLOCKED at >30% of their stations |
| **No photo, Gold/Org** | Gold or Org submission missing photo — multiplier capped, flag raised |
| **Split-witness** | Main cluster identification finds two components within 20% base weight of each other |
| **Low witness density** | Station has ≥3 submissions but average n < 1 |

### 4.3 Temporal Gating

Submissions are accepted only within the defined count window per station. Submissions received:
- Before `check_in_opens_at`: rejected
- After `count_closes_at` + 2 hours: flagged as late; weight reduced to Yellow regardless of tier
- After `election_date` + 24 hours: rejected entirely

The 2-hour grace window accommodates slow BLE propagation and connectivity issues at remote stations.

---

## 5. Incident Response

PeerPulse operates a 48-hour staffed incident response capability ("the War Room") during election windows for partners and accredited operators. Service is delivered by the operations team and routed through `ops@peerpulse.app`.

### 5.1 War Room SLAs

| Severity | Definition | Response | Resolution |
|---|---|---|---|
| P0 | Network partition | 15 min | 2 hours |
| P1 | Relay failure | 30 min | 4 hours |
| P2 | Credential issue | 1 hour | 8 hours |
| P3 | UI display issue | 4 hours | Next business day |

---

## 6. Website & SEO

### 6.1 Purpose

`peerpulse.app` is the public face of the protocol. It serves press, civil society partners, B2G prospects, and community relay operators. Citizens who find the website download the APK and leave. Journalists who find the website read the whitepaper and write stories. Governments who find the website see a professional protocol with institutional credibility.

### 6.2 Pages

| Route | Content | Primary SEO target |
|---|---|---|
| `/` | What PeerPulse is, how it works in one screen, download CTA | "election monitoring app", "election integrity tool" |
| `/how-it-works` | Non-technical explainer — presence as proof, BLE witnessing, dispute resolution | "how parallel vote tabulation works", "citizen election monitoring" |
| `/whitepaper` | Full whitepaper rendered as HTML with anchor links | "decentralised election monitoring protocol", academic citations |
| `/download` | APK download button + SHA-256 checksum + F-Droid badge + verification instructions | "PeerPulse APK download" |
| `/elections` | Live index of monitored elections — name, jurisdiction, date, observer count, dispute status | election-specific queries, news-adjacent |
| `/elections/[electionId]` | Per-election detail page — station map, tally status, witness counts, dispute feed | jurisdiction + election name queries |
| `/press` | One-paragraph description, key facts, contact (`press@peerpulse.app`), downloadable assets | journalist discovery |
| `/relay` | Sovereign Relay operator docs — Docker setup, config, community registry | "run election monitoring relay" |
| `/protocol` | Protocol reference — packet schema, trust tiers, dispute algorithm | developer and researcher discovery |

### 6.3 Technical Approach

**Framework:** Next.js 15, App Router, TypeScript strict.

**Rendering strategy:**
- Static pages (`/`, `/how-it-works`, `/whitepaper`, `/download`, `/press`, `/relay`, `/protocol`) — fully static, generated at build time, served from CDN edge.
- Election index and detail pages (`/elections`, `/elections/[electionId]`) — ISR, revalidate every 60 seconds. A read-only relay client (`lib/relay.ts`) pulls live tally and dispute data from the nearest Sovereign Relay.

**SEO implementation:**
- `generateMetadata()` per route with election-specific titles and descriptions
- Open Graph image generation (`/opengraph-image.tsx`) — dynamic OG cards for election pages showing observer count and dispute status
- JSON-LD structured data: `Organization` on `/`, `Article` on `/whitepaper`, `Event` on election pages
- `sitemap.ts` — static routes + dynamically generated election routes
- `robots.txt` — all routes indexed; `/api/*` excluded
- Canonical URLs enforced via `alternates.canonical` in metadata
- `next/font` for zero-layout-shift typography
- All images use `next/image` with explicit `width`, `height`, `alt`

**Performance targets:** LCP < 2.5s, CLS = 0, INP < 200ms.

### 6.4 Hosting

**Stealth phase:** Self-hosted nginx on anonymous relay infrastructure (1984 Hosting Iceland or Mullvad). No Vercel account — no identity exposure. Static export for non-ISR pages; ISR pages run as lightweight Node.js server behind nginx.

**Post-entity phase:** Cloudflare Pages when CDN performance at scale is needed. Can be set up under nominee entity once Swiss Foundation is operational.

### 6.5 Content Principles

- No founder name, no company name, no jurisdiction — attributed to "PeerPulse contributors"
- Whitepaper is the primary long-form content asset; all other pages link to it
- Election pages are factual and data-driven — no editorial opinion on election outcomes
- Press page is minimal: one paragraph, one contact address, downloadable assets
- All copy passes through legal review before any election-specific market is targeted

---

## 7. Distribution

### 7.1 No Google Play Store

PeerPulse is not on the Google Play Store. Three reasons:

**The Navalny precedent.** In September 2021, Google removed Navalny's Smart Voting app from the Russian Play Store under direct government pressure, days before a federal election. This is PeerPulse's exact threat model.

**Developer identity.** A Google Play developer account requires identity verification and payment traceability. Google is a US company subject to subpoena.

**Policy conflict.** Google Play prohibits apps that facilitate installation of APKs from outside the Play Store. PeerPulse's self-distribution feature is that feature.

### 7.2 Distribution Stack

| Channel | Role | Identity Risk | Removal Risk |
|---|---|---|---|
| **F-Droid** | Primary store discovery | None | Low |
| **`peerpulse.app/download`** | Primary web distribution + SHA-256 verification | None (Njalla domain) | Low |
| **APK self-distribution** (built in) | Primary viral mechanism | None | None |

### 7.3 APK Signing Key

The APK signing key is the primary long-term identity vector. Every distributed APK embeds the certificate fingerprint permanently.

- Generated on an air-gapped machine never connected to the internet
- Never linked to a Google developer account or any traceable identity
- Stored on hardware security media (YubiKey or equivalent) in at least two geographic locations
- Treated with the same custody policy as PKI root key shares
- If compromised: all installed copies cannot update in-place and must reinstall from a fresh APK

---

## 8. Open Questions

| # | Question |
|---|---|
| 1 | **DISPUTE_THRESHOLD default** — review against Kenya, Nigeria, DRC threat models before first deployment |
| 2 | **Relay count at launch** — minimum 3 Sovereign Relays; two in target country, one external |
| 3 | **Demographic data governance** — Organisation/Gold cert required to publish targeted surveys, or open to any signed publisher? |
| 4 | **BLE foreground service UX** — notification wording and battery impact disclosure for low-end devices |
| 5 | ~~**First target election**~~ **DECIDED: Kenya Aug 2027.** See `spec-strategy.md` and `elections-pipeline.md`. |
| 6 | **IPFS pinning strategy** — which relay nodes pin photo evidence, for how long, and who pays storage costs? |
| 7 | **Photo encryption key management** — threshold encryption for dispute review, or PeerPulse-held decryption key? |
| 8 | **Organisation engagement** — subsidy policy for civil society in target markets; commercial terms not published |
| 9 | **Cross-election reputation bootstrap** — how does an org earn reputation for their first election without a track record? |
| 10 | **Poll vote privacy disclosure** — legal must approve UX copy explaining pseudonymous voting before launch |
| 11 | **Nigeria legal review** — parallel tallying legal framework for Nigeria must be reviewed before July 2026 go/no-go. Contact YIAGA Africa as primary CSO partner. |
| 12 | **DRC civil society scoping** — contact CENCO and Symocel in late 2026 / early 2027. French-language app copy required if DRC is a target. |
| 13 | **Philippines legal review** — parallel tallying framework; PPCRV runs an established PVT programme (direct contact). Target: May 2028 presidential election. |
| 14 | **Kenya pre-launch compliance** — ODPC registration once an entity exists; Nairobi election law advocate to confirm phone ban scope under Regulations 62/63/67; verify PBO compliance of civil society seeding partners. |
