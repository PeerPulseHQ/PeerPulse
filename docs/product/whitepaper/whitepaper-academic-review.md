# Academic critique: PeerPulse Whitepaper v7

*Review date: 2026-05-12. Subject: `docs/product/whitepaper-protocol.md`, Protocol edition v7.0, May 2026.*

## Overall grade

**B− / strong-reject-with-major-revisions** if submitted to a top-tier security venue (USENIX Security, S&P, CCS, NDSS). Reads as a polished engineering design document with serious cryptographic intent, not as a research paper. The core protocol is novel and worth defending, but the manuscript has the load-bearing weaknesses peer reviewers would flag immediately: no related-work section, unjustified parameter choices, two specification ambiguities, and unquantified security claims dressed as conclusions. A workshop or systems-track submission (NDSS systems, FC, EVoting workshop) with a tightened threat model and one empirical study would be defensible.

## Strengths

1. **Problem framing is clean.** Centralisation as a coercion surface is the right framing, and the Navalny precedent is the right anchoring example.
2. **Triple-presence proof is a genuine contribution.** TEE attestation + BLE co-witness + GPS as three independent attack surfaces is novel as a *composition*, even if the individual primitives are not.
3. **Explicit threat-model honest limits (§9.1, "PeerPulse is *not* designed against adversaries who…")** are rare in this genre and earn trust.
4. **Concrete worked example in §6.6** (15 Greens, n=14, multiplier ≈4.91, weight ≈7,365 vs Gold at 2,000, ratio 3.68×) is more numerically grounded than most protocol papers.
5. **Two-key TEE architecture (§4.3)** is a genuinely elegant engineering workaround for the API 33 Ed25519-in-Keystore gap, and the offline verification path is well specified.
6. **Falsifiable performance targets (Appendix B)** with offline-verifiable acceptance criteria.

## Major concerns

### 1. No related work. Fatal at a real venue.

There is no Related Work section. The paper does not cite or differentiate from:

- **End-to-end verifiable voting**: Helios (Adida 2008), Scantegrity II, STAR-Vote, ElectionGuard, Belenios, Civitas (Clarkson et al.).
- **Coercion resistance**: Juels–Catalano–Jakobsson (2005), the entire JCJ family. The protocol is *not* coercion-resistant; that gap is never acknowledged as a known unsolved problem.
- **PVT academic literature**: NDI / Carter Center methodology papers, Estok et al., Asunka et al. (Ghana RCT).
- **Witness / timestamping**: Catena (Tomescu & Devadas 2017), OpenTimestamps as commit anchors.
- **Sybil resistance foundations**: Douceur 2002, Proof-of-Personhood (BrightID, World ID), Idena.
- **Hardware attestation literature**: Mayrhofer et al. on Android attestation reliability; Play Integrity field-failure data.
- **Threshold signatures**: FROST is named in §11 but not cited (Komlo & Goldberg 2020).

Without this, any reader fluent in the field will reject the implicit claim of novelty.

### 2. Specification ambiguity: cluster definition is overloaded across §6.3, §6.4, and §6.6.

§6.3 defines the witness graph: nodes are submitters, edges are mutual BLE attestations. §6.4 finds "connected components" and ranks them by base weight sum to identify "the main cluster." §6.6 then refers to "tally clusters" and runs the confirmation state machine over "the cluster with highest effective weight sum."

The aggregation algorithm silently conflates two distinct objects:

- **Witness cluster**: who BLE-saw whom (a presence graph; partitioned by connected component).
- **Agreement cluster**: who submitted the same `vote_count` (a value partition).

A single connected component can contain submitters who reported *different* `vote_count` values. The paper never specifies how the canonical `vote_count` is selected within a witness cluster, nor whether a witness cluster is split by disagreement before §6.6 runs. The worked example in §6.6 implicitly assumes the 15 Greens all submitted the same number, but the algorithm as written does not require this. A peer reviewer flags this on first pass.

Fix: redefine clusters as `(connected_component × vote_count)` pairs, or write the within-component canonical-value selection explicitly.

### 3. The honest-majority proof in §9.3 is wrong as stated.

> "Effective weight per citizen is `100 × f(n)`: a constant across honest and dishonest alike. The winning tally is determined by submitter count alone within the component: a pure majority vote."

This is only true if you treat each submitter's `vote_count` as a separate cluster — which contradicts §6.4's clusters-as-connected-components definition. The proof confuses the witness graph with the value partition. Either redefine clusters (see Concern 2), or write the within-component tiebreak explicitly. As stated, the proposition is a category error and the proof does not type-check.

### 4. GPS plausibility is handwaved (§4.5).

> "GPS spoofing on Android requires running a spoof process alongside PeerPulse on a TEE-attested device, significantly raising attack complexity."

This is empirically not at the level the paper implies. Mock location is a developer-options toggle and `MockLocationProvider` is well-documented. The Android TEE attests the signing key, not the GPS fix; `expo-location` does not consume an attested location source. A non-rooted attacker with a real TEE-attested device, the official APK, and mock locations enabled defeats this gate. The threat model excludes "compromise the devices of a majority of observers" (§9.1) but a single GPS-spoofing observer is in scope and is *not* defended against beyond an unquantified "raises complexity."

The §3.3 claim that location-and-photo are independent attack surfaces holds against remote attackers only. Against a co-located attacker with one spoofing device, they collapse to one signal (the photo).

### 5. TEE attestation reliability is assumed, not measured.

Field deployments of Android attestation (banking apps, Play Integrity) report substantial false-negative rates on legitimate devices — failed provisioning, missing keymaster, OEM bugs, expired chains on older devices. In Kenya / DRC the installed base skews older and includes many devices that have never had a current attestation cert. §4.3 offers the Huawei / de-Googled fallback (BLE-only Green) but treats it as an edge case. In the target markets it is plausibly the **majority** case. Provide a measurement, or downgrade the centrality of HW attestation in the trust model.

The §6.6 CITIZEN-CONFIRMED rule — "≥10 TEE-attested Green citizens in the winning cluster" — is the load-bearing override gate against Gold/Org disagreement. If attestation pass-rate is even 50% on target handsets, the gate effectively doubles the required observer density.

### 6. The "winning cluster" gate is exploitable at uncontested stations.

§9.4's cost analysis ($75–150M nationwide) assumes the attacker attacks everywhere. The aggregation algorithm operates **per station**. At a station with low PeerPulse penetration (0 honest observers, common in rural KE/DRC), 10 attacker devices form the main cluster, no orphan penalty applies, and they CITIZEN-CONFIRM whatever they want provided ≥10 are TEE-attested. Local cost ≈ $1,500–3,000 hardware plus logistics. The paper does not address station-level attack economics, only nationwide aggregate.

A targeted attack at the ~10% of stations that historically decide a Kenyan presidential election is meaningfully different from a nationwide one.

### 7. The 3× confirmation ratio is asserted, not derived.

No probabilistic argument is given for `winning ≥ 3 × runner`. Why 3 and not 2 or 5? What false-CONFIRMED rate does it produce under what dishonest-fraction assumption? Same critique applies to `DISPUTE_THRESHOLD = 50`, `min_witnesses = 1`, the 200 m plausibility radius, the 20% split-witness flag, the 25% deadlock band, the 48-hour evidence window, and the 1000:500:100:1 base-weight ratio. These numbers carry the entire trust contract and none are derived. The "calibrated so that a 15-citizen BLE cluster can decisively override a single contradicting Gold" comment under the §6.1 table is a back-formation, not a derivation.

The repository already contains `scripts/sim-sybil.mjs` and `scripts/simulation-engine.mjs`. Publish their results in an appendix.

### 8. PKI centralisation contradicts the decentralisation claim.

Diamond signs `ElectionDefinition`, including the canonical station list (§4.1, §6.1). PeerPulse is the sole issuer of Gold and Organisation certs (§6.1: "PeerPulse is the sole issuer, self-service registration does not exist"). The 3-of-5 root-holder split mitigates, but two of the named slots (#3 audit firm, #4 civil society observer, #5 escrow) are unbound — *who*? Until those are named with public identities, jurisdictional residence, and revocation procedures, the trust root is "PeerPulse and its friends." §1.1's ban-resistance argument depends on there being no seizable central authority; the PKI as specified is exactly that authority.

The §3.3 "Citizen-First, Authority-Optional" framing is also at minor tension with §6.6: CONFIRMED *requires* "≥1 Gold or Organisation slot in the winning cluster." Without institutional corroboration, the maximum achievable state is CITIZEN-CONFIRMED. "Fully functional with zero official participation" overstates this — the citizen-only path produces a strictly weaker confirmation state. Either say so plainly, or remove the institutional minimum-quorum requirement.

### 9. Photo evidence is publicly opaque.

Photos are encrypted under a 3-of-5 threshold key and decrypted only by "designated auditors" (§4.5). This means:

- The §6.7 48-hour evidence window lets observers submit *hashes* of contradicting photos, but the public cannot evaluate whether the underlying photos actually contradict.
- "Designated auditors" is unspecified — who designates, how, with what accountability?
- The protocol re-centralises dispute interpretation in a small auditor body — the same failure mode §1.1 critiques in traditional PVT.

Either justify why public photo visibility is unsafe (coercion risk for the photographer?) or move to a model where photos are public-by-default with explicit submitter consent.

The §4.5 statement "Gallery upload is not permitted: the photo must be taken live" is enforceable only by API surface choice (`expo-camera` launched directly), not cryptographically. A modified APK with a different signing cert would fail attestation, but the paper does not say this enforcement is in fact load-bearing; it reads as a UX statement.

### 10. No coercion resistance.

An observer compelled at gunpoint to submit a specific tally has no remedy in the protocol. There is no duress signal, no plausibly deniable alternate submission, none of the standard JCJ-family mechanisms. This is an unsolved hard problem and worth saying so explicitly in §11, alongside "vote anonymity."

## Minor concerns

- **§4.5 photo hashes "not machine-comparable"** is correct, but §6.7 leans on hashes for the reopening rule. Spell out: a reopening submission must hash a *different* photo, not match an existing one. Current wording is ambiguous.
- **§6.5 entity dedup** "any disagreement → org slot invalidated" is a footgun. One rogue observer inside a 50-observer NGO zeros that NGO across the entire station. Use a per-station majority within the org instead, with a residual disagreement flag.
- **§6.1 single-party dominance auto-CONTESTED override** is a clever patch, but it triggers regardless of weight arithmetic. A station with three party agents from the same party but also five Greens and a Gold in the winning cluster shouldn't be CONTESTED; the rule as written treats partisan corroboration as a poison pill rather than additive evidence.
- **§7 temporal gate** hard 24-hour rejection biases against late-counting stations, which are disproportionately where fraud occurs. Make the window configurable per `ElectionDefinition` with a longer default (48–72h) for slow-counting jurisdictions.
- **§10.2 relay-side metadata.** The paper claims IP is not included in packets — true, but the receiving Sovereign Relay sees the connecting IP. Three relays plus GossipSub propagation is a quasi-deanonymising side channel. Acknowledge relay-side metadata explicitly in the privacy section.
- **BLE saturation** at a busy station entrance (hundreds of phones, GATT max ~7 concurrent connections per device, Doze / battery-saver killers on Xiaomi / OPPO / Huawei / Tecno) is unaddressed. The protocol assumes the witness graph fills in; in practice it may fragment into many small components, each subject to the §6.4 orphan penalty. Field-test or model.
- **Diamond determines what is an "election."** A regional referendum the platform refuses to sign cannot be observed. State this constraint plainly under §11.
- **Appendix A "TBD"** on photo encryption scheme and HSM vendor leaves the threshold-decryption design unverifiable. At minimum, specify the scheme family (Shamir + symmetric envelope vs threshold ElGamal vs FROST-style threshold ECIES) so reviewers can reason about it.

## Editorial

- **Voice drift** is much improved from prior drafts: the v7 cut to 12 sections removed most of the marketing-register chapters. Two residual spots — "operationally implausible" used three times across §6.6 and §9 as a load-bearing defence without quantification — should be replaced with numbers or removed.
- **Org base weights** NGO / Press / Party at identical 500 is hard to defend; partisan parties' incentives differ structurally from NGOs and press. The §6.1 single-party-dominance CONTESTED rule is a binary patch on what should be graduated weights.
- **§3.1 "no iOS application"** justification is sound (TEE chain, BLE FG service, sideload distribution) but the rhetorical "forced choice rather than a focus decision" reads as defensive. Drop the second sentence; the three reasons stand alone.

## Recommended revisions for academic submission

1. Add a **Related Work** section with at minimum the references in Concern 1.
2. Fix the **cluster definition** across §6.3–§6.6 so witness-clustering and value-selection are formally separated, and rewrite §9.3's honest-majority statement to be type-correct.
3. Add a **probabilistic security analysis**: given assumed honest fraction *p* and dishonest fraction *(1−p)*, what is the false-CONFIRMED rate per station, both with and without institutional corroboration? Analytically or by Monte Carlo via `scripts/sim-sybil.mjs`. Include sensitivity to the 1000:500:100:1 base weights and the 3× ratio.
4. Either **rescue or retire HW-attestation centrality** with a field measurement of attestation pass rates on representative target-market handsets (Tecno, Infinix, Itel, low-end Samsung, common Xiaomi SKUs).
5. Add **per-station attack economics** alongside §9.4's nationwide figure, including the targeted-precincts case.
6. Add a **coercion-resistance** subsection in §9 — even if just naming it as unsolved.
7. **Name the root holders** in §6.2, or specify the procedure by which they are named, verified, and rotated.
8. Tighten the §3.3 "citizen-first" claim against the §6.6 minimum-quorum rule, or remove the institutional-minimum requirement.

## Net

The protocol is good, the document is not yet a paper. As an engineering whitepaper for civil-society and press audiences it is at **A−** — clearer and more numerically grounded than most. As an academic submission it is at **B−** until the cluster ambiguity, the related-work gap, and the parameter-justification gap are closed. The two-key TEE design and the BLE co-presence ceremony are publishable contributions on their own; build a tighter paper around those rather than around the full system.
