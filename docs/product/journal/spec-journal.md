# PeerPulse — Journal Specification

**Version:** 1.0
**Pillar:** Journal (AI civic intelligence)
**Depends on:** Gossip layer for distribution; independent of Tabulate and Surveys protocol
**Playbook:** → see `playbook-journal.md` (adding new countries/jurisdictions)

---

## 1. Overview

Journal is an AI-powered pipeline that monitors official government sources, extracts structured summaries of proceedings, and delivers them to citizens in plain language and local languages — with direct citations back to primary documents.

**What Journal covers:**
- Parliamentary debates and Hansard
- Executive orders, gazette notices, cabinet decisions
- Court rulings — constitutional, supreme, tribunal
- Budget statements, treasury reports, audit reports
- Electoral commission publications
- Bills and constitutional amendments at every reading stage

**What Journal is not:**
- Not editorial. No opinion. No framing beyond what the primary source says.
- Not a news aggregator. Source is always the official record, not a media report.
- Not real-time chat or commentary.

**Why neutrality is defensible:** Extraction from official government documents cannot be accused of bias by the government whose documents are the source. Citations link to the primary document so any reader can verify the summary against the original.

---

## 2. Architecture

```
Official Sources (parliament, gazette, court, treasury)
        ↓
  Source Monitors (per-workstream crawlers)
        ↓
   Raw Content Queue
        ↓
  Extraction Agent (AI — structured data from raw text)
        ↓
  Validation Pipeline
    ├── Bias Checker (AI adversarial pass)
    ├── Citation Verifier (every claim has a source anchor)
    └── Human Review Gate (high-sensitivity content only)
        ↓
  Translation Agent (local languages per jurisdiction)
        ↓
  JournalPacket (signed by Journal node keypair)
        ↓
  GossipSub → Sovereign Relays → Mobile App + Website
```

Journal runs on dedicated **Journal nodes** — a separate node type from Sovereign Relays. A Journal node runs the full AI pipeline and publishes `JournalPacket`s to the network. Sovereign Relays route and pin them. Mobile apps and the website consume them.

---

## 3. Workstreams

Each workstream is an independently configured extraction pipeline for a category of government proceedings.

### 3.1 Legislature

**Sources:** Hansard (official parliamentary record), committee reports, bill text at each reading, voting records, session agendas

**Extraction targets:**
- Bill introduced: title, sponsor, date, summary of purpose
- Debate: key arguments per party/speaker, without attribution of partisan framing
- Vote: outcome, breakdown by party (if published officially)
- Committee report: recommendations, dissenting opinions
- Act passed: final text summary, commencement date

**Update frequency:** Daily during sessions; weekly during recess (for retrospective publications)

### 3.2 Executive

**Sources:** Government gazette, presidential/PM office publications, cabinet communiqués, ministerial directives, statutory instruments

**Extraction targets:**
- Executive orders and their stated legal basis
- Appointments: position, appointee, date
- Policy directives: what was directed, to which body
- Gazette notices: regulations, amendments, commencements

**Update frequency:** Daily — gazettes are published on fixed schedules per jurisdiction

### 3.3 Judiciary

**Sources:** Official court registries, published rulings, constitutional court bulletins

**Extraction targets:**
- Case summary: parties, legal question, court level
- Ruling: decision, legal basis cited, dissenting opinions
- Constitutional interpretation: what provision, how interpreted
- Orders affecting citizens: deadlines, compliance requirements

**Update frequency:** As published — courts release rulings on variable schedules

### 3.4 Budget and Finance

**Sources:** Treasury publications, budget statements, supplementary estimates, audit reports, revenue authority releases

**Extraction targets:**
- Budget: total figures, key allocations by ministry, tax changes
- Supplementary: what changed and why (stated reason only)
- Audit: findings by ministry, red-flagged items
- Revenue authority: rates, deadlines, new obligations

**Update frequency:** Annual budget cycle + ad hoc for supplementaries and audits

### 3.5 Electoral

**Sources:** Electoral commission publications, voter registration notices, constituency delimitation reports, election timetables

**Extraction targets:**
- Registration dates and requirements
- Constituency boundary changes
- Candidate nomination deadlines
- Results when officially published

**Update frequency:** Continuous during election periods; quarterly otherwise

### 3.6 Constitutional

**Sources:** Constitutional amendment bills, referenda publications, constitutional court interpretations

**Extraction targets:**
- Amendment proposed: what provision, who proposed, current vs. proposed text
- Referendum: question, date, requirements for passage
- Constitutional court: binding interpretations

**Update frequency:** As published — constitutional events are infrequent but high-priority

---

## 4. Extraction Pipeline

### 4.1 Source Monitor

Each source has a configured monitor:
- URL pattern or API endpoint
- Polling frequency
- Change detection (hash of last-seen content to avoid reprocessing)
- Authentication if required (some government sites require registration)
- Format handler: HTML, PDF, structured XML, API response

When new content is detected, raw content is queued with metadata: source URL, retrieved timestamp, workstream classification, jurisdiction.

### 4.2 Extraction Agent

The extraction agent processes raw content into structured data.

**System prompt (shared across all jurisdictions):**

```
You are a neutral government proceedings extractor. Your task is to extract 
factual information from the provided official government document and produce 
a structured summary.

Rules you must follow without exception:
1. Extract only what the document says. Do not infer, interpret, or editorialize.
2. Use neutral, factual language. Forbidden words and phrases:
   - Sentiment: "controversial", "historic", "landmark", "sweeping", "bold", 
     "timid", "failed", "succeeded", "impressive", "alarming"
   - Intent attribution: "aims to", "hopes to", "plans to", "tries to"
     (use "proposes to", "directs", "mandates" — the document's own language)
   - Evaluation: "significant", "important", "major", "minor" 
     (use quantities and specifics instead)
3. Every claim must be traceable to a specific section of the source document.
   Include section references (e.g. "§4(2)", "Clause 7", "Page 12").
4. If the document is ambiguous, report the ambiguity. Do not resolve it.
5. If multiple positions are stated in the document, report all of them with 
   equal weight.
6. Do not omit positions because they seem extreme or fringe — if it is in 
   the official record, it belongs in the summary.

Output format:
- title: [document title from source]
- type: [bill | debate | ruling | order | budget | notice | amendment]
- date: [official date from document]
- summary: [2–4 sentences, neutral extraction]
- key_points: [bulleted list — each point cited to source section]
- citations: [list of source anchors used]
- ambiguities: [anything unclear in the source — empty list if none]
```

### 4.3 Bias Checker

After extraction, a separate AI agent runs an adversarial bias check. This agent's only job is to find problems.

**System prompt (bias checker):**

```
You are a bias auditor reviewing a government proceedings summary for a 
neutral civic platform. Your job is to find any language, framing, or 
omission that could be construed as editorial opinion or political bias.

Check for:
1. Sentiment words that imply evaluation (positive or negative)
2. Intent attribution beyond what the source document explicitly states
3. Asymmetric treatment — if multiple positions exist, are they given equal 
   weight and equal framing?
4. Selection bias — are any points from the source document missing from the 
   summary? If so, are they missing for a defensible reason?
5. Framing — does the order of points imply a hierarchy of importance not 
   present in the source?
6. Translation drift — if translated, does the target language introduce 
   connotations not present in the source?

Output: a list of issues found, each with:
- type: sentiment | intent | asymmetry | omission | framing | translation
- text: the specific phrase or element at issue
- suggestion: neutral rewrite

If no issues found, output an empty list. Do not invent issues.
```

A summary with any bias flag is returned to the extraction agent for revision. After revision, the bias checker runs again. After two failed revision cycles, the summary is routed to human review.

### 4.4 Citation Verifier

Automated check that every `citation` in the summary corresponds to a retrievable section in the source document. Citations that cannot be verified are flagged for removal or human confirmation.

### 4.5 Human Review Gate

The following trigger mandatory human review before publication:
- Two failed bias revision cycles
- Content type: constitutional amendment, electoral law change, court ruling on fundamental rights
- Jurisdiction flag: any content from a country where PeerPulse is operating a live election

Human reviewers are designated per jurisdiction and operate pseudonymously. Review turnaround target: 4 hours for flagged content.

---

## 5. Translation

After extraction and validation, the summary is translated into the configured local languages for the jurisdiction.

**Translation agent system prompt:**

```
You are a neutral translator for a civic information platform. Translate the 
following government proceedings summary from [source_lang] to [target_lang].

Rules:
1. Preserve all factual content exactly. Do not add, remove, or reframe.
2. Use the official government terminology in [target_lang] where it exists 
   (e.g. the official name of the bill, the official title of the court).
3. If a legal or procedural term has no direct equivalent in [target_lang], 
   transliterate and add a parenthetical explanation.
4. Preserve all citation references unchanged.
5. Do not make the translation more readable at the expense of accuracy.

After translation, flag any terms where you were uncertain about the correct 
[target_lang] equivalent.
```

Translated summaries pass through the same bias checker in the target language before publication.

---

## 6. JournalPacket Schema

```protobuf
message JournalPacket {
  Header    header          = 1;
  string    journal_id        = 2;   // unique per summary
  string    jurisdiction    = 3;   // ISO 3166-2
  string    workstream      = 4;   // "legislature" | "executive" | "judiciary" | "budget" | "electoral" | "constitutional"
  string    language        = 5;   // BCP 47
  string    title           = 6;
  string    summary         = 7;   // neutral extracted summary
  repeated KeyPoint key_points = 8;
  repeated Citation citations  = 9;
  string    source_url      = 10;  // canonical URL to primary source document
  int64     source_date     = 11;  // official date of source document
  int64     extracted_at    = 12;  // unix timestamp of extraction
  bool      human_reviewed  = 13;  // true if passed human review gate
  string    node_id         = 14;  // Journal node that produced this packet
  bytes     node_cert       = 15;  // Journal node keypair cert
  bytes     signature       = 16;  // signs all above fields
  string    sponsor_id      = 17;  // optional — sponsoring org_id (for sponsored feeds)
}

message KeyPoint {
  string text         = 1;
  string source_ref   = 2;   // e.g. "§4(2)", "Clause 7", "Page 12"
}

message Citation {
  string source_ref   = 1;
  string url          = 2;   // deep link to section if available
  string excerpt      = 3;   // verbatim excerpt from source (max 200 chars)
}
```

---

## 7. Journal Node

A Journal node is a dedicated operator that runs the full AI extraction pipeline and publishes `JournalPacket`s to the network. It is distinct from a Sovereign Relay (which routes packets but does not produce them).

### 7.1 Requirements

| Requirement | Specification |
|---|---|
| Compute | Sufficient for LLM inference — GPU preferred; CPU viable with smaller models or API-backed inference |
| Storage | Source archive: election duration + 90 days; summaries: permanent |
| Network | Stable outbound to government sources; inbound P2P connectivity |
| Jurisdiction coverage | A Journal node declares the jurisdictions and workstreams it covers in its node manifest |
| Signing | Node keypair registered with PeerPulse Diamond key; public key pinned in the app |
| Identity | Operator may be pseudonymous; registered via `press@peerpulse.app` |

### 7.2 Node Manifest

```protobuf
message JournalNodeManifest {
  string   node_id            = 1;
  repeated string jurisdictions = 2;   // ISO 3166-2 list
  repeated string workstreams  = 3;
  repeated string languages    = 4;   // BCP 47 list — what languages this node outputs
  int64    registered_at       = 5;
  bytes    node_cert           = 6;
  bytes    signature           = 7;
}
```

### 7.3 Trust and Verification

All `JournalPacket`s must be signed by a registered Journal node key. Unregistered or unsigned packets are rejected by relays and apps.

PeerPulse operates at least one Sovereign Journal node per active election jurisdiction. Community Journal nodes may supplement coverage; their packets are displayed with a community badge until they accumulate a reputation score.

**Reputation scoring for Journal nodes:**
- Citation accuracy: are source_url links live and do excerpts match?
- Bias audit pass rate: what fraction of summaries pass bias check without human escalation?
- Timeliness: average lag between source publication and JournalPacket publication
- Human review escalation rate: lower is better (indicates cleaner extraction)

Nodes with low reputation scores have their packets labelled accordingly in the UI.

---

## 8. Incentives for Running a Journal Node

### 8.1 For Civil Society Organisations

Running a Journal node for your jurisdiction is a credibility signal: you are the trusted extractor for your country's government proceedings. Your organisation's name appears as the node operator on all summaries you produce. This builds public profile and demonstrates technical capacity to donors and partners.

Subsidy: PeerPulse subsidises or waives Journal node registration for civil society organisations in target markets. Running a node is free; the compute cost is the operator's responsibility.

### 8.2 For NGOs and Research Institutions

Journal nodes produce structured, citable data about government proceedings that has independent research value. An organisation running a Journal node for Kenya's parliament builds a structured archive of parliamentary activity that they can use for their own research, grant reporting, and advocacy — not just for PeerPulse users.

---

## 9. Sponsorship Model

### 9.1 Free to Citizens

All Journal summaries are free to citizens in the app and on the website. No paywall. No registration required to read web summaries.

### 9.2 Sponsored Feeds

Organisations and governments may sponsor Journal feeds for specific topics or jurisdictions, with strict editorial separation:

- The sponsor's name appears as "Supported by [Org]" on all summaries in the sponsored feed
- The sponsor does not influence editorial content — sponsored feeds go through the same extraction and bias pipeline as unsponsored ones
- Sponsored content is labelled in the UI
- The packet `sponsor_id` field surfaces sponsorship in structured form for downstream verification

### 9.3 Programmatic Access

Media organisations and academic institutions may obtain programmatic access to the structured Journal dataset for full-text search, filtering by jurisdiction/branch/date, and webhook subscription. Access terms are not published here.

---

## 10. Distribution

### 10.1 App

JournalPackets are delivered to the mobile app via GossipSub, the same gossip layer as Tabulate. Citizens subscribe to jurisdictions and workstreams. New summaries arrive as push-style feed updates.

Personalisation available in the app (not on web):
- Follow specific bills by their identifier
- Follow specific workstreams per jurisdiction
- Notifications when a followed bill progresses to next reading
- Language preference (receive summaries in preferred local language)

### 10.2 Web

Static pages rendered at `peerpulse.app/journal/[jurisdiction]/[workstream]/[journal_id]`.

Each page: summary, key points, citations with links to source documents, Journal node attribution, sponsor badge if applicable.

SEO targets: bill names, budget year, court case names, executive order subjects — specific long-tail queries that journalists, researchers, and engaged citizens search for.

### 10.3 WhatsApp / Telegram Digest

A daily or weekly digest broadcast on WhatsApp and Telegram channels, per jurisdiction. Plain text format with links to full summaries on the website. The digest is the primary distribution channel in markets where WhatsApp > Google for news discovery.

---

## 11. Open Questions

| # | Question |
|---|---|
| 1 | **LLM selection** — self-hosted open-source model (Mistral, Llama) vs. API-backed (Claude, GPT-4)? Self-hosted protects source document confidentiality; API is faster to deploy |
| 2 | **Source access** — some government sites block automated scraping; strategy for blocked sources: official RSS/API partnership vs. manual submission by human monitors? |
| 3 | **Sponsored feed editorial firewall** — what governance mechanism ensures sponsor payments cannot influence extraction? Written policy sufficient, or technical separation required? |
| 4 | **Multi-node same jurisdiction** — if two Journal nodes both cover Kenya legislature, how are duplicate summaries handled? Last-writer-wins, or merge? |
| 5 | **Historical archive** — should Journal retroactively extract historical proceedings (e.g. last 5 years of Hansard) or start from go-live date only? |
| 6 | **Journal node certification** — same PKI as Tabulate (ObserverSubCA) or a separate Journal SubCA? |
