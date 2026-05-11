# PeerPulse — Product Overview

**Version:** 7.0
**Domain:** peerpulse.app

---

## Mission

PeerPulse is a decentralised civic intelligence platform. It gives citizens the tools to independently verify elections, engage with government, and hold power accountable — without trusting any central server, government, or corporation.

---

## The Four Pillars

### 🗳️ Elections
**What:** Citizens independently count and co-sign official election tallies at polling stations on election day. Results are aggregated in real time across thousands of stations into a parallel count that can be compared against the official result.

**How it works:** Citizens arrive at their assigned station entrance near survey-close time, start witnessing, and BLE automatically discovers co-witnesses gathered at the same entrance. When a witness threshold is reached and results are posted, they capture and submit a signed tally. Physical co-presence — proven by BLE mutual attestation, live GPS, and hardware-backed device keys — is the trust mechanism. No pre-coordination required. No accreditation needed to stand at the public entrance where results are legally required to be posted.

**Who it's for:** Any citizen with an Android phone. NGOs and electoral commissions participate as credentialed observers with higher trust weight.

**Tab structure:** Two views — **Starred** (elections the user has declared intent for or is watching) and **Explore** (all elections in the system). Starred is the default.

**Election seeding:** Elections are populated from day one by the same AI pipeline as Journal — monitoring electoral commission sites, Wikipedia election calendars, civil society sources, and news feeds. `elections-pipeline.md` is the human-curated seed corpus that bootstraps the pipeline. The system self-updates ongoing.

**Spec:** `spec-protocol.md`, `spec-trust.md`

---

### 📊 Surveys
**What:** Governments, NGOs, civil society organisations, and political parties publish targeted opinion surveys to opted-in citizens. Results are tallied locally on each device — no centralised collection, no demographic data leaves the phone.

**How it works:** A `SurveyDefinition` signed by a certified Organisation or Gold key is gossipped to the network. Each device checks the targeting criteria against its local demographic profile. Matching users see the survey and can respond with a `VotePacket`. Results aggregate pseudonymously across the network.

**Who it's for:** Organisations and governments publish surveys; citizens respond. Citizens opt in to targeting as a separate setting.

**Eligibility tiers:** `open` (anyone), `witnessed` (requires BLE WitnessBundle), `credentialed` (requires Gold/Org key).

**Spec:** `spec-protocol.md §12`

---

### ⚡ Journal
**What:** AI-extracted neutral summaries of official government proceedings — parliament debates, executive orders, budgets, court rulings, bills, and constitutional amendments — delivered to citizens in plain language and local languages.

**How it works:** An AI agent pipeline monitors official sources (Hansard, government gazettes, court registries, treasury publications) continuously. Extracted content is processed into neutral summaries with direct citations back to primary sources. No editorial opinion. Summaries are pushed to the app as a feed, updated as proceedings unfold.

**Why neutral:** Citations link directly to official documents. AI extraction from primary sources is defensible as neutral in a way that human editorial is not. Governments cannot accuse PeerPulse of bias when the source is their own official record.

**Who it's for:** Any citizen who wants to understand what their government is doing without reading 200-page budget documents or parliamentary Hansard.

**Languages:** Summaries translated to local languages of target markets (Swahili, Lingala, French, etc.).

**Access:** Free to citizens.

**Spec:** `journal/spec-journal.md`, `journal/playbook-journal.md`

---

### 🎓 Learn
**What:** Curated civic education content and quizzes. Know your rights. Understand how elections work. Learn what a parliamentary committee does. Understand the budget process.

**How it works:** Short-form educational content with interactive quizzes. Structured as a progression — citizens earn civic literacy badges as they complete modules. Content is localised per jurisdiction (Kenya electoral law is different from DRC).

**Why it matters:** Learn is the year-round retention engine. Citizens who understand how their government works are more likely to participate in Elections on election day and engage with Surveys and Journal between elections. It is also the onboarding funnel — new users learn the platform through Learn before they need it for a live election.

**Who it's for:** All citizens. Jurisdictionally targeted content based on optional self-reported region.

**Access:** Free to citizens.

**Spec:** TBD — to be written when Learn moves to implementation.

---

## How the Pillars Relate

```
Learn        → teaches citizens how civic systems work
Surveys        → gives citizens a voice on specific questions
Journal        → shows citizens what government is actually doing
Elections    → lets citizens verify elections independently
```

Each pillar reinforces the others. A citizen who learns through Learn is more likely to submit a tally through Elections. A citizen who follows Journal knows what's at stake in an election. Surveys close the loop by letting organisations ask targeted questions to engaged citizens.

Together they create a platform citizens open year-round — not just on election day.

---

## Tab Order

| # | Tab | Always useful? | Notes |
|---|---|---|---|
| 1 | **Journal** | Yes | Live content from day one — leads with what's immediately valuable |
| 2 | **Surveys** | When active | Participatory; works as soon as one org publishes |
| 3 | **Elections** | Yes (via Explore) | Countdown + intent for near elections; global browse always available |
| 4 | **Learn** | Yes | Civic education; reference tab, always available |

Elections tab defaults to Starred (user's watched/participated elections). Empty Starred state shows Explore automatically.

## Build Sequence

| Phase | Pillars live | Goal |
|---|---|---|
| **MVP** | Elections + Journal (seeding only) | One election, real tally data, press coverage. Journal pipeline seeds election calendar from day one. |
| **V2** | + Surveys | Targeted opinion polling — organisations and governments engage opted-in citizens |
| **V3** | + Journal (full) | Year-round engagement — AI civic intelligence between elections |
| **V4** | + Learn | Retention and onboarding — daily active use, civic literacy at scale |

Each phase is independently valuable. V2 does not depend on V3. The sequence is driven by complexity, not technical dependencies.

---

## Platform Principles

- **Decentralised by default** — no central server holds the data that matters
- **Citizen-first** — all four pillars work for citizens with zero official participation
- **Neutral** — Journal and Learn are not editorial; they cite primary sources
- **Pseudonymous** — no real identity required at any tier
- **Offline-capable** — BLE and mDNS LAN gossip work without internet
- **Android-only** — 80–90%+ market share in all target markets; no iOS distraction

---

## Detailed Specs

| Document | Contents |
|---|---|
| `tabulate/spec-protocol.md` | Wire format, protobuf schema, BLE, GPS, crypto, stack, testing |
| `tabulate/spec-trust.md` | Trust tiers, weight model, tally aggregation, confirmation states, security |
| `surveys/spec-surveys.md` | Poll schema, targeting model, eligibility tiers, result aggregation |
| `journal/spec-journal.md` | AI pipeline, branches, anti-bias prompts, Journal node |
| `journal/playbook-journal.md` | Repeatable playbook for adding countries and jurisdictions |
| `spec-operations.md` | Onboarding, deployment, monitoring, B2G, website, distribution |
| `spec-strategy.md` | GTM, legal structure, operational security |
| `spec-resilience.md` | Legitimacy inversion, shutdown boomerang, ban resistance — strategic properties |
