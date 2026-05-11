# PeerPulse — Legal Review: Kenya

*Research date: May 2026. Product risk analysis — not legal advice.*

---

## Executive Summary

Kenya is one of the more permissive African jurisdictions for election observation technology — PVT is established practice, internet shutdowns have not occurred in modern elections, and civil society space is relatively open. Two amber risks require attention before the 2027 general election (data protection registration and communications licensing), with a third amber (phone ban) that is largely resolved by product design.

**The phone ban is not a blocker.** The IEBC ban applies *inside* the station during counting. PeerPulse's UX operates at the *public station entrance* — where Kenyan law requires results to be physically posted after counting. Citizens can stand outside, BLE-discover each other, and photograph the posted Form 35A without entering the station. See §2 for the full analysis.

---

## Summary RAG Table

| Area | Risk | Key Issue |
|---|---|---|
| Polling station phone ban | 🟡 Amber | Applies inside station only; PeerPulse UX is at public entrance — confirm Regs 62/63/67 text |
| Observer accreditation | 🟡 Amber | Inside-station access requires CSO affiliation; outside is public |
| Data Protection Act 2019 | 🟡 Amber | Registration required once a Kenyan entity exists |
| Cybercrimes Act §§22–23 | 🟡 Amber | False publication risk in contested result; mitigated by framing |
| Communications licensing | 🟡 Amber | Relay-in-Kenya may need ASP licence before B2G |
| PBO Act (civil society partners) | 🟡 Amber | Verify compliance of Kenyan CSO partners |
| Parallel vote tabulation legality | 🟢 Green | PVT is established, legally sanctioned practice |
| Internet shutdown | 🟢 Green | Kenya has not shut down internet during elections |
| APK sideloading | 🟢 Green | No restrictions |
| Encryption & cryptography | 🟢 Green | No restrictions |

---

## 1. Parallel Vote Tabulation — GREEN ✅

PVT is legal and has strong precedent in Kenya.

The Elections Act No. 24 of 2011 explicitly provides for the IEBC to "facilitate the observation, monitoring and evaluation of elections" (Constitution Art. 88). ELOG (Elections Observation Group) has conducted accredited PVTs at every major election since 2010 with IEBC cooperation. In 2022, ELOG deployed 1,000 PVT observers to a nationally representative sample of polling stations; their results matched IEBC figures to within 0.1–2.1%.

The Election Offences Act No. 37 of 2016 penalises "publishing false statements" about elections, and the Computer Misuse and Cybercrimes Act 2018 §§22–23 criminalise "false publications." Neither targets good-faith independent tallying, but both carry prosecutorial discretion that an adversarial government could invoke. The spec's dispute resolution model (multiple independent tallies, no single "true result" asserted) and trust tiers are the best framing shield against §22–23.

---

## 2. Polling Station Phone Ban & Citizen Observation Rights — 🟡 Amber

### The ban

The IEBC enforced a phone ban *inside* polling stations at February 2026 by-elections and has publicly stated plans to extend it to the 2027 general election. The stated rationale is preventing voters from photographing marked ballots. Martha Karua has publicly argued the ban "exceeds the IEBC's legal mandate" — the legal basis is contested but unresolved.

IEBC access rules (Elections Act 2011, Regulations 62, 63, 67, 79, 83, 87) restrict inside-station access during counting to:
- IEBC officials on duty
- Accredited party and candidate agents
- Duly accredited observers
- Assigned security personnel
- Accredited media

Accredited agents are permitted to photograph original results forms (Form 35A) only.

### The legal pathway: results posted at the public entrance

The Elections (General) Regulations 2012 require the presiding officer to:

> "affix a copy of the declaration of the results at **the public entrance to the polling station** or at any place convenient and accessible to the public at the polling station"

This is separate from the inside-station access restriction. The results form is **physically posted outside**, in public space, accessible to any citizen without accreditation. The phone ban applies inside the station; the public entrance is outside it.

This creates a clean legal model for PeerPulse:

| Scenario | Legal status | PeerPulse feature status |
|---|---|---|
| Citizen inside station with phone during counting | ❌ IEBC ban (inside) | Not the target UX |
| Accredited observer inside station | ✅ Permitted; phone for Form 35A photo only | Supported, richer trust |
| Citizen standing at public entrance, reads/photographs posted Form 35A | ✅ Public space, public document | **Primary UX pathway** |
| BLE discovery between observers at the entrance area | ✅ Outside station, no restriction | Core feature, fully intact |
| Tally gossip via libp2p | ✅ Unrestricted | Core feature, fully intact |

### Product implication

The citizen observer UX should be framed around the public entrance, not inside-station access. The user taps "I'm at [station]", the BLE foreground service starts, and the app waits for them to capture the posted results form at the entrance. This is legally clean for any citizen without requiring accreditation.

Accredited observer mode (deployed through ELOG/CSO partners) gets richer trust: inside access, Form 35A photography, signed results. Both modes submit the same `TallyPacket` — the difference is witness count and trust tier.

---

## 3. Observer Accreditation — AMBER 🟡

Unaccredited citizens cannot access the counting room but can observe the posted results at the public entrance (see §2). For higher-trust observation:

- Organisation-level accreditation required (individuals affiliate with an accredited CSO/NGO)
- Application through IEBC portal
- Compliance with observer conduct codes
- In 2022 IEBC accredited 120,000 observers — process is accessible, environment described as enabling

**For PeerPulse:** The GTM seeding strategy through ELOG and similar CSOs is not just a nice-to-have — it is the accredited-observer pathway. Citizen-only deployment works via the public entrance model (§2) without accreditation.

---

## 4. Data Protection Act 2019 — AMBER 🟡

**Act No. 24 of 2019, administered by the ODPC (Office of the Data Protection Commissioner).**

**Registration threshold:** The Act's statutory thresholds (annual turnover and headcount) determine when registration becomes mandatory. A pseudonymous open-source project with no Kenyan entity falls below them. Once an entity is incorporated and operational, registration becomes mandatory.

**Key provisions regardless of registration:**
- On-device demographic storage (age, region, gender, occupation) is defensible as data minimisation; the DPA defines processing broadly but the no-transmission design is the strongest position
- Device public keys that persist across sessions are pseudonymous identifiers under the Act — disclose in privacy policy
- Poll targeting done entirely on-device means no party learns which devices matched which criteria — compliant by design
- Certificate validity: 24 months; renewable

**Action required before B2G or any Kenyan entity formation:** register with ODPC, appoint a DPO, publish a privacy notice documenting on-device-only demographic processing.

---

## 5. Computer Misuse and Cybercrimes Act 2018 — AMBER 🟡

**Act No. 5 of 2018.**

Sections 22–23 criminalise publishing false information "with intent to deceive" likely to cause fear, alarm, or despondency. The risk is prosecutorial overreach in a contested election — a tally submitted in good faith that contradicts official results is not false information within the meaning of §22–23.

**Mitigation:** The whitepaper and in-app copy must make explicit that:
- PeerPulse surfaces independently observed tallies, not a single asserted truth
- Dispute resolution shows a plurality of results when they conflict
- The platform makes no editorial claim about which result is correct

This framing is already implicit in the spec's trust model; it needs to be explicit in public-facing copy.

No specific restriction on P2P networks, end-to-end encryption, or BLE in the Act.

---

## 6. Communications Authority Licensing — AMBER 🟡

**Kenya Information and Communications Act Cap. 411A.**

The CA's Unified Licensing Framework covers: Network Facilities Provider, Application Service Provider (ASP), Content Service Provider.

Running a **Sovereign Relay in Kenya** (Node.js relay server serving Kenyan users) likely falls within the ASP category. An ASP licence requires:
- Registered Kenyan entity
- 30% minimum Kenyan shareholding (for foreign-owned companies)
- Business plan and KRA compliance
- 135-day approval timeline

The mobile app itself (citizen client) is not separately licensed. Cross-border relay access from Kenyan users to a relay outside Kenya is not independently licensed.

**Phase 1 (no entity) risk:** Low — CA targets commercial operators, not anonymous P2P tools.

**Phase 2 (institutional partnership) risk:** Medium — formal government engagement creates regulatory visibility; resolve before first institutional contract.

---

## 7. Public Benefits Organisations (PBO) Act 2013 — AMBER 🟡

Operational as of May 2024; compliance deadline extended to May 2026.

PeerPulse itself (no entity) is not subject to the PBO Act. **Kenyan CSO partners** deploying PeerPulse in their observer programmes must be PBO-compliant — verify during seeding phase.

For a future Swiss Foundation running activities in Kenya: must appoint an authorised Kenyan agent (Kenyan citizen, resident in Kenya) and maintain a Kenya office. An exemption is available if the Foundation does not directly implement activities in Kenya — a protocol layer with Kenyan CSO partners doing deployment likely qualifies for the exemption.

---

## 8. Internet Shutdown Risk — GREEN ✅

Kenya has not implemented internet shutdowns in the 2017 or 2022 elections. The government explicitly stated in 2022 that it would not block or restrict social media. Freedom House rates Kenya's internet freedom as "Partly Free" — more open than Uganda or Ethiopia.

The spec's offline-first design (mDNS LAN gossip, BLE, APK self-distribution) already addresses shutdown scenarios. This is a genuine differentiator for Kenya where shutdown risk is lower than in other target markets.

---

## 9. APK Sideloading — GREEN ✅

No Kenyan law restricts distribution of APK files outside official app stores. F-Droid + direct download + peer APK distribution is unimpeded.

---

## 10. Encryption & Cryptography — GREEN ✅

No Kenyan law restricts Ed25519, ECDSA P-256, or any strong cryptographic primitive. No mandatory key escrow. No crypto export controls. Hardware attestation is unrestricted.

---

## Three Actions Before Kenya Deployment

1. **Anchor the citizen UX to the public entrance** — The primary observation model should be: user at the public entrance area, BLE running, reads/photographs posted Form 35A results. This is legally clean for unaccredited citizens. Document this explicitly in the spec and in-app guidance. Inside-station accredited mode is a higher-trust overlay via CSO partners.

2. **Brief a Nairobi election law advocate** — One day of advice from a Kenya election law specialist (IKM Advocates, Bowmans Kenya, or Clyde & Co Kenya) on Elections (General) Regulations 62/63/67/79/83/87 specifically: whether the phone ban is in those regulations or purely administrative, and whether accredited observer equipment is explicitly exempt. This is the one area where research-based analysis needs eyes-on the current regulatory text.

3. **Data protection baseline before any B2G** — Before approaching any Kenyan government entity, register with the ODPC, publish a privacy policy, and document the on-device-only demographic processing architecture. Credibility signal as much as compliance requirement.

---

## Sources

- [Elections Act No. 24 of 2011 – Kenya Law](https://new.kenyalaw.org/akn/ke/act/2011/24/eng@2022-12-31)
- [Elections (General) Regulations 2012 – Kenya Law](https://new.kenyalaw.org/akn/ke/act/ln/2012/128/eng@2022-12-31)
- [Election Offences Act No. 37 of 2016 – IEBC](https://www.iebc.or.ke/uploads/resources/NfhHDLlhJq.pdf)
- [ELOG – Elections Observation Group](https://elog.or.ke/)
- [IEBC accredited 120,000 survey observers in 2022 – The Star](https://www.the-star.co.ke/news/realtime/2023-09-27-iebc-accredited-120000-survey-observers-in-2022-report/)
- [IEBC plans phone ban at polling stations in 2027 elections – Capital FM](https://www.capitalfm.co.ke/news/2026/05/iebc-plans-phone-ban-at-polling-stations-in-2027-election/)
- [IEBC to regulate use of phones inside polling stations – The Star](https://www.the-star.co.ke/news/2026-02-24-iebc-to-regulate-use-of-phones-inside-polling-stations/)
- [Karua criticises IEBC phone ban – Eastleigh Voice](https://eastleighvoice.co.ke/politics/302264/karua-criticises-iebc-phone-ban-at-polling-stations-says-rule-exceeds-legal-mandate)
- [Kenya Data Protection Act 2019 – ODPC FAQs](https://www.odpc.go.ke/faqs/)
- [Mandatory Registration of Data Controllers – MWC Legal](https://mwc.legal/mandatory-registration-of-data-controllers-and-processors/)
- [Computer Misuse and Cybercrimes Act No. 5 of 2018 – Kenya Law](http://kenyalaw.org/kl/fileadmin/pdfdownloads/Acts/ComputerMisuseandCybercrimesActNo5of2018.pdf)
- [Public Benefits Organisations Act 2013 now operational – MMTK](https://mmtklaw.com/the-public-benefits-organizations-act-2013-now-operational-and-ngo-coordination-act-repealed/)
- [Communications Authority of Kenya – Licensing Procedures](https://www.ca.go.ke/licensing-procedures)
- [Kenya Freedom on the Net 2022 – Freedom House](https://freedomhouse.org/country/kenya/freedom-net/2022)
