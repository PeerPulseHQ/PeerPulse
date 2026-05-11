# PeerPulse — Journal Country Playbook

**Version:** 1.0
**Purpose:** Repeatable process for adding a new country or jurisdiction to the Journal pipeline.

This playbook is executed once per jurisdiction. After completion, the jurisdiction runs automatically. Each step has a clear owner (Journal node operator vs. PeerPulse core team) and a clear output.

---

## Step 1 — Source Mapping

**Owner:** Journal node operator (the organisation or team taking on coverage)
**Output:** `sources.json` for the jurisdiction

Identify the official sources for each workstream in the jurisdiction.

### 1.1 Source Map Template

```json
{
  "jurisdiction": "KE",
  "jurisdiction_name": "Kenya",
  "sources": [
    {
      "workstream": "legislature",
      "name": "National Assembly Hansard",
      "url": "https://www.parliament.go.ke/hansard",
      "format": "pdf",
      "update_schedule": "within 48h of session",
      "access": "public",
      "language": "en",
      "notes": "PDFs published per sitting day; index page updated daily"
    },
    {
      "workstream": "executive",
      "name": "Kenya Gazette",
      "url": "https://kenyalaw.org/kenya_gazette/",
      "format": "pdf",
      "update_schedule": "friday",
      "access": "public",
      "language": "en",
      "notes": "Weekly publication; multiple volumes per issue"
    }
  ]
}
```

### 1.2 Source Quality Assessment

For each source, assess:

| Criterion | Check |
|---|---|
| Accessibility | Is it publicly accessible without registration? |
| Machine-readable | Is the content extractable (not scanned image PDFs)? |
| Official | Is this the primary/official publication, not a third-party aggregator? |
| Update frequency | How quickly after the event is it published? |
| Stable URL pattern | Will the URL structure persist for automation? |

Flag sources that are image PDFs (require OCR), require login, or have unstable URL patterns — these need workarounds documented before proceeding.

---

## Step 2 — Scraper Configuration

**Owner:** Journal node operator (technical)
**Output:** Working scraper configuration for each source

Configure a source monitor for each source identified in Step 1.

### 2.1 Monitor Configuration Format

```yaml
jurisdiction: KE
workstream: legislature
source_name: National Assembly Hansard
source_url: https://www.parliament.go.ke/hansard
format: pdf
polling_interval: 6h       # how often to check for new content
change_detection: url_list # "url_list" | "content_hash" | "rss" | "api"
extractor: pdf_text        # "pdf_text" | "pdf_ocr" | "html" | "api_json"
language: en
selectors:
  index_page: "table.hansard-list a[href$='.pdf']"   # CSS selector for PDF links
  document_date: "regex:Hansard.*?(\\d{1,2}\\s\\w+\\s\\d{4})"
```

### 2.2 Blocked Source Strategies

If a source blocks automated access:

| Strategy | When to use |
|---|---|
| Official RSS/API request | Source has a contact; approach as a civic tech partner |
| Human monitor submission | A human downloads and submits manually; flag as `manual_submission` in config |
| Mirror/aggregator | A trusted aggregator (e.g. Kenya Law) re-publishes official content; use with attribution |
| Escalate to PeerPulse | If none of the above work, escalate — PeerPulse may be able to establish an official data partnership |

---

## Step 3 — Jurisdiction Profile

**Owner:** Journal node operator + PeerPulse (review)
**Output:** `jurisdiction.json` registered in Journal network

```json
{
  "jurisdiction": "KE",
  "jurisdiction_name": "Kenya",
  "languages": ["en", "sw"],
  "workstreams": ["legislature", "executive", "judiciary", "budget", "electoral"],
  "node_id": "journal-node-nairobi-01",
  "sources_file": "sources.json",
  "human_reviewers": 2,
  "review_turnaround_hours": 4,
  "go_live_date": "2026-06-01",
  "notes": "Swahili translation required for all summaries. Senate Hansard available separately — add after legislature workstream is stable."
}
```

**PeerPulse review checklist before approving jurisdiction profile:**
- [ ] All workstream sources documented with access assessment
- [ ] At least one human reviewer designated and confirmed
- [ ] Node operator identity verified (may be pseudonymous via ProtonMail/SimpleX)
- [ ] Node keypair registered and cert issued
- [ ] Languages confirmed against available translation model quality

---

## Step 4 — Language Configuration

**Owner:** Journal node operator + PeerPulse (model selection)
**Output:** Translation pipeline configured per target language

For each target language:

| Check | Action |
|---|---|
| Does a quality translation model exist for this language? | Select from approved model list |
| What is the official government terminology in this language? | Document key terms in `glossary-[lang].json` |
| Are there existing official translations to validate against? | Use official bilingual documents for bias calibration |
| Does the language have right-to-left rendering? | Confirm app/web rendering supports it |

### 4.1 Glossary File Format

```json
{
  "language": "sw",
  "jurisdiction": "KE",
  "terms": [
    {
      "en": "National Assembly",
      "sw": "Bunge la Taifa",
      "notes": "Official Swahili name — do not translate as 'Bunge' alone"
    },
    {
      "en": "Cabinet Secretary",
      "sw": "Katibu wa Baraza la Mawaziri",
      "notes": "Abbreviated 'CS' in Kenyan English — expand in Swahili output"
    }
  ]
}
```

---

## Step 5 — Test Run

**Owner:** Journal node operator
**Output:** 30-day historical extraction sample, reviewed and scored

Before going live, run the full pipeline against 30 days of historical content.

### 5.1 Test Run Checklist

- [ ] All configured sources successfully polled
- [ ] At least 20 documents extracted per workstream (or all available if fewer)
- [ ] Extraction agent produces structured output for all document types
- [ ] Bias checker pass rate ≥ 80% without human escalation
- [ ] Citation verifier confirms ≥ 95% of citations are resolvable
- [ ] Translation output reviewed by a native speaker for each configured language
- [ ] End-to-end: JournalPacket published to test relay, visible in app and website

### 5.2 Common Failure Modes

| Failure | Cause | Fix |
|---|---|---|
| Extraction agent returns empty | Document is image PDF (scanned) | Switch to OCR extractor; flag source |
| High bias escalation rate | Source language is highly rhetorical (e.g. political speeches) | Adjust extraction prompt to explicitly note the document type and its rhetorical register |
| Citation not resolvable | Source URL changes after publication | Use DOI or archive.org fallback in citation config |
| Translation bias drift | Language model introduces connotations | Add problematic terms to glossary with explicit instruction |

---

## Step 6 — Bias Audit

**Owner:** PeerPulse core team + independent reviewer
**Output:** Signed-off bias audit report

Before a jurisdiction goes public, PeerPulse runs a bias audit against the test run output.

### 6.1 Audit Sample

- 50 summaries selected across workstreams, weighted toward high-sensitivity types (electoral, constitutional, budget)
- Each summary reviewed against the bias checklist independently by two reviewers
- Discrepancies between reviewers resolved by a third pass

### 6.2 Audit Scoring

| Score | Threshold | Result |
|---|---|---|
| Bias-free | ≥ 90% of summaries pass audit | Approved to go live |
| Minor issues | 80–90% pass | Approved with extraction prompt revision required |
| Significant issues | < 80% pass | Not approved — extraction pipeline requires rework |

Audit report is retained internally. Not published. Audit pass is a precondition for go-live.

---

## Step 7 — Go Live

**Owner:** Journal node operator (operational), PeerPulse (network registration)
**Output:** Live Journal feed for jurisdiction

1. PeerPulse registers the node manifest on the network (Diamond-signed)
2. Node begins live monitoring per configured schedules
3. First JournalPackets published to the network and verified by a Sovereign Relay
4. Jurisdiction appears in the app and on `peerpulse.app/journal/[jurisdiction]`
5. WhatsApp/Telegram channel created for the jurisdiction digest

### 7.1 Go-Live Communication

If the jurisdiction is tied to an active election:
- Notify civil society partners in the jurisdiction that Journal is live
- Include in the pre-election press briefing as a feature alongside Tabulate
- Journal coverage of the electoral commission's publications starts appearing before election day, establishing the brand credibility before the count

If not election-tied:
- Soft launch — no press announcement until enough content has accumulated to demonstrate value (target: 30 days of content before promoting)

---

## Step 8 — Ongoing Maintenance

**Owner:** Journal node operator
**Cadence:** Review quarterly; act on alerts

### 8.1 Source Health Monitoring

The pipeline monitors source health automatically:
- Source URL unreachable: alert within 1 hour
- No new content after expected update window: alert
- Extraction failure rate > 10%: alert

### 8.2 Quarterly Review

Each quarter, the node operator reviews:
- Source map: have any sources changed URLs, format, or access requirements?
- Glossary: any new official terminology introduced (new laws, new ministries)?
- Translation quality: spot-check 10 summaries per language against source
- Bias audit: internal spot-check of 20 summaries per workstream

### 8.3 Government Source Changes

When a government changes its publication platform or Hansard system (common after elections or government transitions):
1. Flag all affected sources as `status: monitoring`
2. Identify new source URLs within 5 business days
3. Update monitor configuration
4. Run a 7-day test before resuming automated publication
5. Document the change in the source history log

---

## Appendix A — Approved Model List

*(Updated by PeerPulse core team — not operator-configurable)*

| Model | Use case | Deployment |
|---|---|---|
| TBD | Extraction (English) | API or self-hosted |
| TBD | Extraction (French) | API or self-hosted |
| TBD | Bias checking | API or self-hosted |
| TBD | Swahili translation | Self-hosted preferred (data privacy) |
| TBD | Lingala translation | Self-hosted preferred |

Model selection is a pending decision (see spec-journal.md open question #1).

---

## Appendix B — Source Map Status Codes

| Status | Meaning |
|---|---|
| `active` | Monitored and extracting successfully |
| `monitoring` | Known issue; manual check ongoing |
| `blocked` | Access blocked; workaround in place or escalated |
| `manual` | Human submission required; automated extraction not possible |
| `deprecated` | Source no longer publishes; replaced by another source |

---

## Appendix C — Jurisdiction Priority Queue

Target jurisdictions in priority order. Priority is driven by active elections, civil society capacity, and operator readiness.

| Jurisdiction | Priority | Status | Node Operator |
|---|---|---|---|
| Kenya (KE) | 1 | Planned | TBD |
| Uganda (UG) | 2 | Planned | TBD |
| DRC (CD) | 3 | Planned | TBD |

Additional jurisdictions added as Journal node operators are onboarded.
