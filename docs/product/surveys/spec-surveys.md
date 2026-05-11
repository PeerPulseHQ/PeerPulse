# PeerPulse — Surveys Specification

**Version:** 1.0
**Pillar:** Surveys (targeted opinion surveys)
**Depends on:** `../tabulate/spec-protocol.md` (packet schema, PKI, gossip layer — Elections pillar)
**Operations:** → see `../spec-operations.md`

---

## 1. Overview

Surveys lets governments, NGOs, civil society organisations, and political parties publish targeted opinion surveys to opted-in citizens. Results are tallied locally on each device — no centralised collection, no demographic data leaves the phone.

**Privacy guarantee:** The publisher learns aggregate response counts. They do not learn which individual devices matched their targeting criteria, nor the demographic profile of any individual respondent.

---

## 2. Publisher Eligibility

Only credentialed entities may publish surveys. Self-service is not available.

| Tier | Who | Certification |
|---|---|---|
| 💎 Diamond | PeerPulse platform | Built-in — signs SurveyDefinitions for system surveys only |
| 🥇 Gold | Electoral commissions, state bodies | Via GovernmentSubCA — same as Elections |
| 🔵 Org-NGO | NGOs, CSOs, observer missions | Via ObserverSubCA, org_type=ngo |
| 📰 Org-Press | Media organisations, journalists | Via ObserverSubCA, org_type=press |
| 🏛️ Org-Party | Registered political parties | Via ObserverSubCA, org_type=party |

Unsigned `SurveyDefinition` packets are rejected by all nodes. A citizen cannot publish a survey.

Political party surveys are rendered with the publishing party's name and affiliation prominently displayed. Users always know which party is asking.

---

## 3. Packet Schema

### 3.1 SurveyDefinition

```protobuf
message SurveyDefinition {
  string   survey_id             = 1;   // unique, human-readable
  string   election_id         = 2;   // optional — links survey to an ElectionDefinition
  string   journal_id            = 14;  // optional — links survey to a specific JournalPacket (bill reading)
  string   title               = 3;   // plain-language survey name
  string   description         = 4;   // displayed to user before they respond
  repeated Question questions  = 5;
  Targeting targeting          = 6;
  string   eligibility         = 7;   // "open" | "witnessed" | "credentialed"
  int64    opens_at            = 8;   // unix timestamp
  int64    closes_at           = 9;   // unix timestamp
  bytes    publisher_cert      = 10;  // Gold or Organisation leaf cert
  bytes    signature           = 11;  // signs all above fields
  string   jurisdiction        = 12;  // ISO 3166-2 — required for targeted surveys
  string   language            = 13;  // BCP 47 — primary display language
}

message Question {
  string         question_id   = 1;
  string         text          = 2;
  string         type          = 3;   // "single_choice" | "multi_choice" | "scale" | "text"
  repeated string options      = 4;   // for choice types
  uint32         scale_min     = 5;   // for scale type
  uint32         scale_max     = 6;
  bool           required      = 7;
}

message Targeting {
  repeated string age_ranges   = 1;   // e.g. ["18-24", "25-34"]
  repeated string regions      = 2;   // ISO 3166-2 subdivisions
  repeated string genders      = 3;   // self-reported values
  repeated string occupations  = 4;
  repeated string languages    = 5;   // BCP 47
  repeated string education    = 6;
}
```

### 3.2 VotePacket

```protobuf
message VotePacket {
  Header           header      = 1;
  string           survey_id     = 2;
  repeated Answer  answers     = 3;
  bytes            signature   = 4;   // signed with device presence_pub_key
  WitnessBundle   witnesses    = 5;   // required for "witnessed" eligibility
  CertChain        cert_chain  = 6;   // required for "credentialed" eligibility
  HWAttestation   hw_attest   = 7;   // optional — strengthens weight
}

message Answer {
  string           question_id = 1;
  repeated string  choices     = 2;   // for choice/multi types
  int32            scale_value = 3;   // for scale type
  string           text_value  = 4;   // for text type — capped at 500 chars
}
```

---

## 4. Demographic Profile

Stored only on device. Never transmitted. The device checks `SurveyDefinition.targeting` locally and decides whether to display the survey.

| Field | Type | Options |
|---|---|---|
| Age range | Enum | 18–24, 25–34, 35–44, 45–54, 55–64, 65+ |
| Region | ISO 3166-2 | Country + subdivision |
| Gender | Free-form | Self-reported |
| Occupation | Enum | Student, Farmer, Trader, Professional, Civil servant, Retired, Other |
| Primary language | BCP 47 | |
| Education level | Enum | Primary, Secondary, Tertiary, Postgraduate |

Citizens explicitly opt in to survey targeting as a separate setting. Citizens who opt out see only surveys with an empty `targeting` field.

---

## 5. Eligibility Tiers

| Tier | Requirement | Use case |
|---|---|---|
| `open` | Any device that received the survey | General sentiment, research |
| `witnessed` | Valid WitnessBundle in VotePacket | Surveys requiring confirmed physical presence |
| `credentialed` | Gold or Organisation cert chain | Official government or institutional surveys |

`witnessed` surveys are appropriate for election-day experience surveys — the respondent was physically at a station and has a WitnessBundle to prove it.

`credentialed` surveys are restricted to Gold and Organisation keyholders responding — peer organisations or officials, not general citizens.

---

## 6. Device-Side Processing

```
SurveyDefinition received via GossipSub
  → Verify publisher_cert chain → pinned Root CA
  → Verify signature
  → Check opens_at / closes_at window
  → Check eligibility (if "witnessed": has local WitnessBundle? if "credentialed": has cert?)
  → Check targeting against local demographic profile
  → If all pass: display survey to user
```

No server is asked whether a device qualifies. The device decides entirely locally. No targeting decision leaves the phone.

---

## 7. Result Aggregation

Results aggregate pseudonymously across the network via GossipSub. Each `VotePacket` carries only the survey_id, answers, and cryptographic proof — no identity beyond the ephemeral device key.

Nodes tally `VotePackets` locally. Publishers query any Sovereign Relay for aggregated tallies. The relay aggregates across received packets — it does not correlate with demographic data, which it never received.

**Deduplication:** one `VotePacket` per (device presence_pub_key, survey_id). Later submissions from the same key overwrite earlier ones within the survey window.

**Result format exposed to publisher:**

```
{
  "survey_id": "...",
  "total_responses": 4821,
  "by_question": {
    "q1": {
      "option_a": 1204,
      "option_b": 3617
    }
  },
  "eligibility_breakdown": {
    "open": 4100,
    "witnessed": 721,
    "credentialed": 0
  }
}
```

Publishers do not receive per-device data. No breakdown by demographic segment is exposed — that would allow re-identification.

---

## 8. Poll Use Cases

| Publisher | Example survey | Eligibility | Targeting |
|---|---|---|---|
| Electoral commission | "Rate your polling station experience today" | `witnessed` | Region |
| NGO | "Do you feel your vote was counted correctly?" | `witnessed` | None |
| Research org | "Youth sentiment on electoral integrity" | `open` | Age 18–34 |
| Political party | "Policy priority ranking" | `open` | Region + language |
| Government | "Preferred voting method for next cycle" | `open` | Region |
| PeerPulse (system) | "How did you hear about PeerPulse?" | `open` | None |

---

## 9. Anti-Fraud

**Poll stuffing:** deduplication per device key prevents a single device from submitting multiple times. TEE hardware attestation (`hw_attest`) signals real hardware — nodes can filter results by attestation quality.

**Bot responses:** `witnessed` eligibility requires a valid BLE WitnessBundle, which requires physical presence at a station. Software bots cannot produce genuine WitnessBundles.

**Publisher impersonation:** all `SurveyDefinition` packets must be signed by a cert chain rooted in the PeerPulse PKI. Unsigned or self-signed surveys are rejected.

**Targeting abuse:** targeting is enforced on-device. The publisher cannot target more narrowly than the demographic fields allow — no free-form SQL query against citizen data.

---

## 10. Open Questions

| # | Question |
|---|---|
| 1 | **Text response privacy** — free-text answers are harder to anonymise; should text type be disabled by default or restricted to credentialed surveys? |
| 2 | **Result publication** — should aggregate results be public (visible on website) or publisher-only? |
| 3 | **Poll chaining** — can a publisher issue follow-up surveys to respondents of a prior survey? (Requires opt-in mechanism) |
| 4 | **Demographic data governance** — Organisation/Gold cert required to publish targeted surveys, or open to any signed publisher? (see spec-operations.md open question #3) |
| 5 | **Poll vote privacy disclosure** — legal must approve UX copy explaining pseudonymous voting before launch |
