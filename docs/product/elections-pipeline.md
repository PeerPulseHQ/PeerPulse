# PeerPulse — Global Elections Pipeline

*As of May 2026. Covers through mid-2031.*

## How this feeds the app

This document is the **human-curated seed corpus** for the Elections tab. On day one, the Journal AI pipeline is pointed at this list and bootstraps the in-app elections index — pulling dates, electoral commission sources, civil society actors, and station data for each entry. From there the pipeline self-updates by monitoring electoral commission websites, Wikipedia election calendars, and civil society news feeds. No manual curation required after the seed.

The in-app Elections tab shows all seeded elections in **Explore**. Users star elections they care about; those appear in **Starred** (the default view).

---

Target election criteria (from `spec-strategy.md §1.2`): active civil society with existing observer corps · contested expected result · high Android penetration · WhatsApp/Telegram as primary channels · international press interest · parallel tallying not explicitly criminalised · minimum 4 months lead time for seeding.

**Legend:**
- 🎯 Primary target — meets all criteria, actionable now
- ⚡ High interest — meets most criteria, monitor closely
- 👁 Watch — significant but constraints (timing, access, legal risk)
- 📋 Catalogue — major global election, not a target market

---

## Elections of Interest — Detailed

### 🎯 Kenya General Election
**Date:** Tuesday 10 August 2027
**Type:** Presidential + Parliamentary + County
**Lead time from today:** ~15 months

The primary PeerPulse launch target. Kenya has the strongest civil society election observation infrastructure in Sub-Saharan Africa — ELOG has conducted accredited PVTs since 2010 with IEBC cooperation, deploying 120,000 observers in 2022. The 2022 result (Ruto over Odinga, 50.5% vs 48.9%) was contested at the Supreme Court. The 2027 race is expected to be equally tight.

**Why it fits:**
- ELOG, ICJ Kenya, and AFRICOG are established PVT organisations — ready-made seeding partners
- Android penetration >80%; WhatsApp dominant for CSO coordination
- Strong international press coverage (BBC Africa, Reuters, Al Jazeera)
- Legal environment permissive: PVT is established practice, no restriction on parallel tallying
- 15 months of lead time — sufficient for civil society seeding (4–6 months needed), pilot run, journalist briefings
- Legal review complete: see `legal-review-kenya.md`

**Risks:**
- IEBC phone ban at polling stations being extended (mitigated by public entrance observation model — see legal review)
- 2027 election date has been challenged in court (petitioners argue 2026 per constitutional reading) — Supreme Court rejected the petition but monitor for further legal challenges
- High political tension; past elections have involved violence at some stations

**Action:** Begin civil society outreach by **October 2026** (4 months before the standard 4–6 month seeding window). Target ELOG first as the established PVT lead.

---

### ⚡ Nigeria General Election
**Date:** Saturday 20 February 2027 (Presidential + Legislative); State elections 6 March 2027
**Type:** Presidential + National Assembly + Governorship
**Lead time from today:** ~9 months

Africa's largest democracy (220M+ people, 80M+ registered voters). The 2023 election was highly contested — Tinubu won with 36.6% in a three-way race, results disputed at the Supreme Court. The 2027 election is expected to be equally fragmented and contested.

**Why it fits:**
- Civil society: YIAGA Africa runs a well-organised PVT (Parallel Vote Tabulation) called the "Watching the Vote" programme — direct analogue to PeerPulse's use case
- WhatsApp penetration is among the highest in Africa
- International press interest is high (largest African economy)
- Android dominant
- Strong diaspora following elections obsessively (UK, US, Canada)

**Risks:**
- Lead time is short (~9 months from today — seeding should start immediately if Nigeria is a target)
- Security situation varies by region; some states carry significant observer risk
- Civil society space has come under pressure since 2023
- Legal framework for parallel tallying not reviewed — **add to open questions**

**Action:** Decide by **July 2026** whether Nigeria is a launch market. If yes, begin CSO outreach immediately. YIAGA Africa is the natural first contact.

---

### ⚡ DRC Presidential & Legislative Election
**Date:** 16 December 2028
**Type:** Presidential + National Assembly
**Lead time from today:** ~31 months

One of PeerPulse's three named target markets. The 2023 election was widely disputed — CENCO (Catholic bishops' observer network) and international observers documented serious irregularities. Tshisekedi declared winner; opposition rejected results.

**Why it fits:**
- Active civil society observer network (CENCO is one of Africa's most credible domestic observer organisations)
- Extremely contested — the 2023 result remains disputed
- Android dominant; WhatsApp and Telegram are primary comms
- International press interest is high (largest Francophone country, critical minerals)
- 31 months of lead time — sufficient for deep civil society integration

**Risks:**
- Ongoing armed conflict in the east — President Tshisekedi has said elections may not happen if war continues
- CENI (electoral commission) has faced severe credibility problems
- Internet restrictions and communications blackouts have occurred during elections
- French-language market — app copy and civil society comms need French
- Legal framework for parallel tallying not reviewed — **add to open questions**

**Action:** Monitor conflict situation. Begin civil society scoping (CENCO, Symocel) in **late 2026 / early 2027**. Do not commit resources until conflict trajectory is clearer.

---

### 👁 Zambia General Election
**Date:** 13 August 2026
**Type:** Presidential + Parliamentary + Local
**Lead time from today:** ~3 months

Zambia has a strong democratic tradition and President Hichilema (elected 2021 in a landmark peaceful transition) is expected to seek re-election. Civil society space is relatively open.

**Why it fits:** Strong civil society, contested, Android dominant, peaceful electoral tradition.

**Why it doesn't fit right now:** Only ~3 months of lead time — below the 4-month minimum for civil society seeding. Too tight for a launch deployment. Monitor as a **pilot opportunity** — Zambia could be a low-stakes test run for the app infrastructure with an established CSO partner, without the pressure of a primary launch.

---

### 👁 Ethiopia Federal Parliamentary Election
**Date:** June 2026 (expected)
**Type:** Parliamentary
**Lead time from today:** ~1 month

Abiy Ahmed's Prosperity Party is expected to consolidate one-party rule. The election takes place amid ongoing armed conflict in Amhara and Oromia.

**Why it's interesting:** Large population, high international press interest, deeply contested political environment.

**Why it's not a target:** Civil society space has been severely restricted — journalists and observers have been arrested. Internet shutdowns have occurred. The legal and physical environment for election observation is hostile. **Not a target market for PeerPulse.**

---

### 👁 Zimbabwe General Election
**Date:** ~2028 (due by July 2028)
**Type:** Presidential + Parliamentary
**Lead time from today:** ~26 months

ZANU-PF has held power since independence. The 2023 election was heavily criticised by domestic and international observers. Civil society (ZESN, ZIDERA) is active but under pressure.

**Why it's interesting:** Deeply contested, strong observer tradition, Android dominant.

**Risks:** Government routinely restricts observer access and has criminalised certain forms of civic reporting. Legal risk for parallel tallying is higher than Kenya. Needs jurisdiction-specific legal review before targeting.

---

## Full Calendar

### 2026

| Date | Country | Election Type | PeerPulse Flag | Notes |
|---|---|---|---|---|
| Jan 15 *(done)* | Uganda | Presidential + Parliamentary | — | Museveni won 7th term (71.6%); result disputed; civil society crackdown; internet shutdown. PeerPulse was not deployed. High-value retrospective case for press narrative. |
| Feb 12 *(done)* | Bangladesh | Parliamentary | — | BNP landslide post-Hasina; democratic transition. Android dominant, large civil society. Watch for 2031 cycle. |
| ~Jun | Ethiopia | Parliamentary | 👁 | Consolidation election; hostile civil society environment. Not a target. |
| Aug 13 | Zambia | General | 👁 | 3-month lead — pilot candidate only |
| ~Sep | Morocco | Legislative | 📋 | Relatively controlled; moderate civil society space |
| ~Oct | Cameroon | Parliamentary | 👁 | Biya era fatigue; rising youth frustration; watch for 2030 presidential |
| ~Oct | Cape Verde | Presidential | 📋 | Stable democracy; small market |
| Nov/Dec | South Africa | Municipal | 📋 | Post-ANC coalition era; OUTA and civil society active but municipal focus |
| Oct | Brazil | Presidential + Congress | 📋 | Lula vs Bolsonaro family (Flavio); high stakes; large market but not Africa-focused |
| ~Oct | Israel | Parliamentary | 📋 | High stakes but mature democracy with strong independent media |
| ~Oct | Hungary | Parliamentary | 📋 | Orbán vs Magyar; EU democracy stakes; not a target market |
| Nov | USA | Midterms | 📋 | Congress; not a target market |
| ~Nov | Lebanon | Parliamentary | 📋 | First major test for post-Nasrallah government |

### 2027

| Date | Country | Election Type | PeerPulse Flag | Notes |
|---|---|---|---|---|
| Feb 20 | Nigeria | Presidential + Legislative | ⚡ | 9-month lead; YIAGA Africa PVT programme; largest African democracy |
| Mar 6 | Nigeria | State elections | ⚡ | Follows federal election |
| ~Q2 | France | Presidential | 📋 | Macron term ends; high global stakes; not a target market |
| Aug 10 | **Kenya** | **General** | 🎯 | **PRIMARY TARGET. 15-month lead. Begin seeding Oct 2026.** |
| ~Q4 | Germany | Federal (if snap) | 📋 | — |

### 2028

| Date | Country | Election Type | PeerPulse Flag | Notes |
|---|---|---|---|---|
| May 8 | Philippines | Presidential + Congress | ⚡ | High Android penetration; contested politics; large diaspora; strong civil society (PPCRV runs a PVT) |
| ~Jul | Zimbabwe | General | 👁 | Contested; needs legal review; civic space under pressure |
| Nov | USA | Presidential | 📋 | — |
| Dec 16 | **DRC** | **Presidential + Legislative** | ⚡ | **Core target market — conditional on conflict resolution. Begin scoping 2027.** |

### 2029

| Date | Country | Election Type | PeerPulse Flag | Notes |
|---|---|---|---|---|
| ~Feb | Indonesia | Presidential + DPR | ⚡ | 280M people; Android dominant; contested since Jokowi era; strong civil society (KIPP, Perludem) |
| ~Feb | Pakistan | General | 👁 | Deeply contested (PTI vs establishment); high Android; but civic space for observers is constrained and dangerous |
| ~Q2 | South Africa | General | 📋 | Post-coalition era; ANC further erosion expected; mature democracy |
| ~Q3 | India | General | 👁 | 1B+ voters; Android dominant; but civic space for independent observation is under pressure |

### 2030

| Date | Country | Election Type | PeerPulse Flag | Notes |
|---|---|---|---|---|
| ~Q2 | Uganda | General | ⚡ | If post-Museveni transition occurs (he would be 86); strong civil society history; prior internet shutdowns |
| ~Q3 | Tanzania | General | 👁 | CCM dominance; 2025 election marked by unprecedented abductions and killings of opposition figures; hostile environment |
| ~Q4 | Cameroon | Presidential | 👁 | Biya has ruled since 1982; succession question; potential for contested result |
| TBD | Ethiopia | General | 👁 | Monitor civil society recovery |

### 2031

| Date | Country | Election Type | PeerPulse Flag | Notes |
|---|---|---|---|---|
| Aug | Kenya | General | 🎯 | Second cycle if 2027 launch succeeds; network effect compounds |
| ~Q1 | Nigeria | General | ⚡ | Second cycle |
| ~Q2 | Bangladesh | Parliamentary | ⚡ | Post-BNP consolidation; democratic trajectory unclear |

---

## Market Prioritisation

| Priority | Country | Election | Date | Why |
|---|---|---|---|---|
| **1** | Kenya | General | Aug 2027 | Legal review done, civil society ready, 15-month lead |
| **2** | Nigeria | General | Feb 2027 | Largest African democracy; 9-month lead — decide now |
| **3** | Philippines | Presidential | May 2028 | High Android, strong PVT tradition (PPCRV), English-language |
| **4** | DRC | Presidential | Dec 2028 | Core target market; conditional on conflict |
| **5** | Indonesia | Presidential | ~2029 | Scale; strong civil society; high complexity |
| **Watch** | Zambia | General | Aug 2026 | 3-month lead — pilot run only |
| **Watch** | Uganda 2030 | General | ~2030 | Post-Museveni could change the environment entirely |

---

## Open Questions Added

- Legal review of parallel tallying for Nigeria (before July 2026 go/no-go decision)
- Legal review of parallel tallying for DRC / Philippines / Indonesia
- French-language app copy required if DRC is a target
- YIAGA Africa initial contact for Nigeria outreach
- CENCO / Symocel initial contact for DRC scoping

---

## Sources

- [2027 Kenyan general election – Wikipedia](https://en.wikipedia.org/wiki/2027_Kenyan_general_election)
- [Nigeria schedules 2027 elections – Ecofin Agency](https://www.ecofinagency.com/news/1702-52955-nigeria-schedules-2027-elections-amid-economic-reforms-and-security-strains)
- [DRC sets December 16 2028 for elections – DNE Africa](https://africa.dailynewsegypt.com/drc-sets-december-16-2028-for-presidential-legislative-elections/)
- [2026 Ugandan general election – Wikipedia](https://en.wikipedia.org/wiki/2026_Ugandan_general_election)
- [Africa's 2026 Elections – Africa Center for Strategic Studies](https://africacenter.org/spotlight/en-elections-2026/)
- [12 African Elections to Watch in 2026 – African Elections](https://africanelections.org/news/12-african-elections-to-watch-in-2026/)
- [2026 Zambian general election – Wikipedia](https://en.wikipedia.org/wiki/2026_Zambian_general_election)
- [2028 Philippine presidential election – Wikipedia](https://en.wikipedia.org/wiki/2028_Philippine_presidential_election)
- [2029 Indonesian presidential election – Wikipedia](https://en.wikipedia.org/wiki/2029_Indonesian_presidential_election)
- [List of next general elections – Wikipedia](https://en.wikipedia.org/wiki/List_of_next_general_elections)
- [Ten Elections to Watch in 2026 – CFR](https://www.cfr.org/articles/ten-elections-watch-2026)
- [Museveni wins seventh term – Al Jazeera](https://www.aljazeera.com/news/2026/1/17/ugandas-president-yoweri-museveni-wins-seventh-term-electoral-commission)
- [Bangladesh 2026 elections – Al Jazeera](https://www.aljazeera.com/news/2026/2/9/bangladesh-2026-elections-explained-in-maps-and-charts)
- [ELOG – Elections Observation Group Kenya](https://elog.or.ke/)
