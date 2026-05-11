// Mockup constants for the Journal page. Mirrors apps/web/data/uganda-parliament-may2026.json
// (list-view subset). When wiring to real data, delete this file —
// TypeScript errors will point at every call site.

export type Workstream = 'legislature' | 'executive' | 'judiciary';

export type Citation = {
  ref: string;          // human-readable source name + date
  url: string;
};

export type JournalPacket = {
  id: string;
  jurisdiction: string;
  jurisdictionFlag: string;
  workstream: Workstream;
  title: string;
  summary: string;          // short card-length text
  fullSummary: string;      // full detail-page summary
  keyPoints: string[];
  citations: Citation[];
  sourceUrl: string;        // primary source landing page
  date: string;
  dateLabel: string;
  /** Hosting civil society / human rights org that human-verified the extraction. */
  verifiedBy: string;
  sourceLabel: string;
};

export const WORKSTREAM_META: Record<Workstream, { label: string; color: string }> = {
  legislature: { label: 'LEGISLATURE', color: '#c084fc' },
  executive:   { label: 'EXECUTIVE',   color: '#60a5fa' },
  judiciary:   { label: 'JUDICIARY',   color: '#4ade80' },
};

export type State = {
  id: string;     // 'ke-nairobi'
  name: string;
};

export type Country = {
  id: string;     // 'ke'
  flag: string;
  name: string;
  /** Sub-region label — used in copy. e.g. 'counties', 'states', 'regions'. */
  regionLabel: string;
  /** Hosting org for this jurisdiction, or null if no partner yet. */
  hostOrg: string | null;
  states: State[];
};

export const COUNTRIES: Country[] = [
  {
    id: 'ke', flag: '🇰🇪', name: 'Kenya', regionLabel: 'counties',
    hostOrg: 'ELOG · ICJ Kenya',
    states: [
      { id: 'ke-nairobi',     name: 'Nairobi'     },
      { id: 'ke-mombasa',     name: 'Mombasa'     },
      { id: 'ke-kisumu',      name: 'Kisumu'      },
      { id: 'ke-nakuru',      name: 'Nakuru'      },
      { id: 'ke-kiambu',      name: 'Kiambu'      },
      { id: 'ke-uasin-gishu', name: 'Uasin Gishu' },
      { id: 'ke-kilifi',      name: 'Kilifi'      },
      { id: 'ke-kakamega',    name: 'Kakamega'    },
    ],
  },
  {
    // Unitary state — districts have local councils but no separate government.
    id: 'ug', flag: '🇺🇬', name: 'Uganda', regionLabel: 'districts',
    hostOrg: 'CCEDU · Chapter Four',
    states: [],
  },
  {
    id: 'ng', flag: '🇳🇬', name: 'Nigeria', regionLabel: 'states',
    hostOrg: 'YIAGA Africa',
    states: [
      { id: 'ng-lagos',   name: 'Lagos'     },
      { id: 'ng-fct',     name: 'FCT Abuja' },
      { id: 'ng-rivers',  name: 'Rivers'    },
      { id: 'ng-kano',    name: 'Kano'      },
      { id: 'ng-kaduna',  name: 'Kaduna'    },
      { id: 'ng-oyo',     name: 'Oyo'       },
      { id: 'ng-anambra', name: 'Anambra'   },
      { id: 'ng-plateau', name: 'Plateau'   },
    ],
  },
  {
    // Unitary state — regions are administrative groupings without separate governments.
    id: 'ph', flag: '🇵🇭', name: 'Philippines', regionLabel: 'regions',
    hostOrg: 'PPCRV',
    states: [],
  },
  {
    id: 'cd', flag: '🇨🇩', name: 'DRC', regionLabel: 'provinces',
    hostOrg: 'CENCO',
    states: [
      { id: 'cd-kinshasa',     name: 'Kinshasa'     },
      { id: 'cd-northkivu',    name: 'North Kivu'   },
      { id: 'cd-southkivu',    name: 'South Kivu'   },
      { id: 'cd-lualaba',      name: 'Lualaba'      },
      { id: 'cd-haut-katanga', name: 'Haut-Katanga' },
    ],
  },
  {
    // Unitary state — provincial ministers are central appointees, no separate provincial govts.
    id: 'zm', flag: '🇿🇲', name: 'Zambia', regionLabel: 'provinces',
    hostOrg: null,
    states: [],
  },
  {
    id: 'in', flag: '🇮🇳', name: 'India', regionLabel: 'states',
    hostOrg: null,
    states: [
      { id: 'in-maharashtra', name: 'Maharashtra' },
      { id: 'in-karnataka',   name: 'Karnataka'   },
      { id: 'in-tamilnadu',   name: 'Tamil Nadu'  },
      { id: 'in-delhi',       name: 'Delhi'       },
      { id: 'in-kerala',      name: 'Kerala'      },
      { id: 'in-wb',          name: 'West Bengal' },
    ],
  },
  {
    // Devolved — Scotland/Wales/NI have own parliaments + governments.
    // England is governed by Westminster directly; covered by country-level follow.
    id: 'gb', flag: '🇬🇧', name: 'United Kingdom', regionLabel: 'devolved nations',
    hostOrg: null,
    states: [
      { id: 'gb-scotland', name: 'Scotland'         },
      { id: 'gb-wales',    name: 'Wales'            },
      { id: 'gb-ni',       name: 'Northern Ireland' },
    ],
  },
];

export const WORKSTREAM_TABS: Array<{ id: 'all' | Workstream; label: string }> = [
  { id: 'all',         label: 'All' },
  { id: 'legislature', label: 'Legislature' },
  { id: 'executive',   label: 'Executive' },
  { id: 'judiciary',   label: 'Judiciary' },
];

export const JOURNAL_PACKETS: JournalPacket[] = [
  {
    id: 'UG-legislature-20260506-001',
    jurisdiction: 'Uganda',
    jurisdictionFlag: '🇺🇬',
    workstream: 'legislature',
    title: 'Protection of Sovereignty Bill, 2026 — Passed with Amendments',
    summary:
      "Uganda's Parliament passed the Protection of Sovereignty Bill, 2026 on May 6, 2026, following approximately eight hours of debate. The bill criminalises soliciting foreign sanctions against Uganda or its officials, with penalties up to life imprisonment.",
    fullSummary:
      "Uganda's Parliament passed the Protection of Sovereignty Bill, 2026 on May 6, 2026, following approximately eight hours of debate. The bill, as amended, requires non-citizens, foreign governments, and organisations incorporated outside Uganda to register and declare foreign funds exceeding approximately 400 million shillings when engaged in specified political activities. The maximum penalty for non-compliance was reduced from 20 years to 10 years imprisonment during the amendment process. The bill was enacted 20 days after its introduction on April 15, 2026, and proceeds to presidential assent.",
    keyPoints: [
      'The amended bill applies to non-citizens, foreign governments, and organisations incorporated outside Uganda. A clause classifying Ugandan citizens residing abroad as foreigners was removed during revision on April 30, 2026.',
      'Agents of a foreigner engaged in regulated political activities must declare foreign funds exceeding approximately 400 million shillings. The original bill required ministerial approval for such funds; the amended bill requires declaration only.',
      'Regulated political activities under Clause 2 include attempts to influence legislation, funding or campaigning for political parties, and activities intended to influence governance.',
      'Maximum imprisonment for non-compliance reduced from 20 years to 10 years.',
      'Exemptions added for financial institutions, academic and research bodies, health facilities, and entities already regulated under existing laws.',
      'Clause 18 explicitly permits court challenges to ministerial decisions, including High Court appeals. Warrantless inspection powers and mandatory health examination provisions were removed.',
      'The Bank of Uganda submitted that the original bill could weaken the shilling, drain foreign reserves, and undermine central bank independence.',
      "The Leader of the Opposition characterised the bill as 'unnecessary, legally redundant and potentially harmful' during plenary debate on April 27, 2026.",
    ],
    citations: [
      { ref: 'Parliament of Uganda — Parliament passes Sovereignty Bill (6 May 2026)', url: 'https://www.parliament.go.ug/news' },
      { ref: 'allAfrica — What Parliament Changed in Sovereignty Bill (7 May 2026)',     url: 'https://allafrica.com/stories/202605070389.html' },
      { ref: 'The Independent Uganda — Sovereignty Bill 2026 set for 2nd reading',         url: 'https://www.independent.co.ug/sovereignty-bill-2026-set-for-2nd-and-final-reading-in-parliament-today/' },
      { ref: 'allAfrica — Sovereignty Bill 2026 set for 2nd and Final Reading (5 May 2026)', url: 'https://allafrica.com/stories/202605050127.html' },
    ],
    sourceUrl: 'https://www.parliament.go.ug/news',
    date: '2026-05-06',
    dateLabel: '6 May 2026',
    verifiedBy: 'CCEDU',
    sourceLabel: 'Hansard',
  },
  {
    id: 'UG-budget-20260427-001',
    jurisdiction: 'Uganda',
    jurisdictionFlag: '🇺🇬',
    workstream: 'legislature',
    title: 'National Budget 2026/27 — Shs84.3 Trillion Approved',
    summary:
      "Uganda's Parliament passed the Shs84.3 trillion national budget for the 2026/27 financial year on April 27, 2026, through adoption of the Appropriation Bill. Defence, infrastructure and security claim the largest sectoral allocations.",
    fullSummary:
      "Uganda's Parliament passed the Shs84.3 trillion national budget for the 2026/27 financial year on April 27, 2026, through adoption of the Appropriation Bill and the Budget Committee report, in a session chaired by Speaker Anita Among. Domestic revenue of Shs44.18 trillion accounts for the largest share of financing. Of total expenditure, Shs47.16 trillion is classified as discretionary spending and Shs37.23 trillion as statutory expenditure covering debt servicing, wages, pensions, and other legally mandated obligations.",
    keyPoints: [
      'Total budget: Shs84.3 trillion for financial year 2026/27.',
      'Financing: domestic revenue Shs44.18 trillion; domestic borrowing Shs11.97 trillion; external project support Shs11.27 trillion; domestic refinancing Shs13.97 trillion; petroleum revenues Shs1.44 trillion; budget support grants Shs1.22 trillion.',
      'Infrastructure development allocated Shs10.8 trillion for roads, railways, water, electricity, and transport systems.',
      'Agro-industrialisation allocated Shs2.2 trillion for agricultural research, inputs, irrigation, extension services, agro-processing, and market access.',
      'Priority gap allocations include Shs664.3 billion for road completion works, Shs100 billion for medicines and health supplies, Shs100 billion for cattle compensation in Northern Uganda, Shs45 billion for rural electrification, and Shs20 billion for ambulances.',
      'Kira Municipality MP Ssemujju Nganda raised objections to last-minute changes, stating government had introduced budget figure adjustments in a manner inconsistent with the Public Finance Management Act.',
    ],
    citations: [
      { ref: 'Parliament of Uganda — Shs84.3T 2026/27 Budget (27 Apr 2026)',     url: 'https://www.parliament.go.ug/news' },
      { ref: 'Uganda Online — Parliament Approves 2026/27 Budget (27 Apr 2026)', url: 'https://www.ugandaonline.net/news/2026-04-27--uganda-parliament-approves-shs84-3-trillion-budget-for-2026-27-amid-debt-pressures--a8b3b1e26dc8/' },
      { ref: 'Africa Newsroom — Parliament passes Shs84.3T Budget',              url: 'https://www.africa-newsroom.com/press/uganda-parliament-passes-shs843-trillion-202627-budget?lang=en' },
    ],
    sourceUrl: 'https://www.parliament.go.ug/news',
    date: '2026-04-27',
    dateLabel: '27 Apr 2026',
    verifiedBy: 'CSBAG',
    sourceLabel: 'Treasury · Appropriation Bill',
  },
  {
    id: 'UG-budget-20260505-001',
    jurisdiction: 'Uganda',
    jurisdictionFlag: '🇺🇬',
    workstream: 'legislature',
    title: 'Supplementary Expenditure Schedule No.5 — Shs1.1 Trillion Approved',
    summary:
      "Uganda's Parliament approved Supplementary Expenditure Schedule No.5 totalling Shs1.1 trillion for the 2025/26 financial year during the May 5 sitting. Funds will cover unbudgeted security and election-preparation costs.",
    fullSummary:
      "Uganda's Parliament approved Supplementary Expenditure Schedule No.5 totalling Shs1.1 trillion for the 2025/26 financial year during the May 5, 2026 plenary session. State Minister for Finance Henry Musasizi tabled the request. Parliament suspended Rule 160 — which requires Budget Committee review before plenary approval — on a motion by MP Fox Odoi-Oywelowo. Funds cover presidential inauguration costs, AFCON 2027 preparations, local council elections, and wage shortfalls across government sectors.",
    keyPoints: [
      'Total supplementary allocation: Shs1.1 trillion for financial year 2025/26.',
      'Allocations: Shs56 billion for local council elections (Ministry of Local Government); Shs46 billion for wage shortfalls across sectors; Shs29 billion for AFCON 2027 preparations (Ministry of Sports); Shs3 billion for presidential inauguration.',
      'Rule 160, which requires Budget Committee review before plenary approval, was suspended to allow direct passage.',
      'Shadow Minister for Finance Ibrahim Ssemujju stated the items are foreseen expenditures and disagreed with their classification as emergencies.',
    ],
    citations: [
      { ref: 'Parliament of Uganda — Shs1.1T supplementary (5 May 2026)',    url: 'https://www.parliament.go.ug/news' },
      { ref: 'Uganda Online — Shs1.1 Trillion Supplementary Budget (6 May)', url: 'https://www.ugandaonline.net/news/2026-05-06--parliament-approves-shs1-1-trillion-supplementary-budget-amid-controversy--fd1ba783c4a7/' },
      { ref: 'Daily Monitor — Inside the Shs1.1T supplementary budget',       url: 'https://www.monitor.co.ug/uganda/news/national/inside-the-shs1-1-trillion-supplementary-budget-5448890' },
    ],
    sourceUrl: 'https://www.parliament.go.ug/news',
    date: '2026-05-05',
    dateLabel: '5 May 2026',
    verifiedBy: 'CCEDU',
    sourceLabel: 'Hansard',
  },
  {
    id: 'UG-legislature-20260423-001',
    jurisdiction: 'Uganda',
    jurisdictionFlag: '🇺🇬',
    workstream: 'legislature',
    title: 'National Teachers Bill, 2024 — Passed, Awaiting Presidential Assent',
    summary:
      "Uganda's Parliament passed the National Teachers Bill, 2024 during a plenary session on April 23, 2026, chaired by Speaker Anita Among. The bill establishes a regulatory framework for teacher registration and professional conduct.",
    fullSummary:
      "Uganda's Parliament passed the National Teachers Bill, 2024 during a plenary session on April 23, 2026, chaired by Speaker Anita Among. The bill converts the Cabinet's 2019 National Teachers' Policy into enforceable law. It establishes a National Teachers Council, introduces mandatory registration and licensing for all practising teachers, and requires teacher internship programmes and continuous professional development. The bill awaits presidential assent before implementation.",
    keyPoints: [
      'All teachers in Uganda will be required to register with the National Teachers Council and hold a valid teaching licence before practising.',
      'The National Teachers Council is mandated to handle registration and licensing, enforce ethical standards, and administer disciplinary procedures.',
      'The bill introduces teacher internship programmes and mandatory continuous professional development requirements.',
      "The bill converts the 2019 National Teachers' Policy into enforceable law, addressing teacher absenteeism, qualification standards, and supervision frameworks.",
    ],
    citations: [
      { ref: 'Parliament of Uganda — Reforms to Professionalise Teaching (23 Apr 2026)', url: 'https://www.parliament.go.ug/news' },
      { ref: 'allAfrica — National Teachers Bill (24 Apr 2026)',                          url: 'https://allafrica.com/stories/202604240143.html' },
      { ref: 'Uganda Online — Approves National Teachers Bill (23 Apr 2026)',             url: 'https://www.ugandaonline.net/news/2026-04-23--uganda-parliament-approves-national-teachers-bill-to-boost-teaching-standards--f0d0d6177d28/' },
    ],
    sourceUrl: 'https://www.parliament.go.ug/news',
    date: '2026-04-23',
    dateLabel: '23 Apr 2026',
    verifiedBy: 'CCEDU',
    sourceLabel: 'Hansard',
  },
  {
    id: 'UG-legislature-20260423-002',
    jurisdiction: 'Uganda',
    jurisdictionFlag: '🇺🇬',
    workstream: 'legislature',
    title: 'Income Tax (Amendment) Bill, 2026 — Diaspora Earnings Provision Rejected',
    summary:
      "Uganda's Parliament passed the Income Tax (Amendment) Bill, 2026 on April 23, 2026, with a government proposal to tax income earned abroad by Ugandan residents struck out following committee objection.",
    fullSummary:
      "Uganda's Parliament passed the Income Tax (Amendment) Bill, 2026 on April 23, 2026, with a government proposal to tax income earned abroad and remitted to Uganda by Ugandan citizens removed during deliberation. The bill as passed does not include taxation of remittances sent home by Ugandans working abroad. No further details on other provisions of the bill were available in sources retrieved.",
    keyPoints: [
      "Parliament rejected the government's proposal to tax income earned and sent home by Ugandans living and working abroad.",
      'The Income Tax (Amendment) Bill, 2026 was passed with the diaspora earnings tax clause removed.',
    ],
    citations: [
      { ref: 'Parliament of Uganda — rejects taxing kyeyo earnings (23 Apr 2026)', url: 'https://www.parliament.go.ug/news' },
    ],
    sourceUrl: 'https://www.parliament.go.ug/news',
    date: '2026-04-23',
    dateLabel: '23 Apr 2026',
    verifiedBy: 'CCEDU',
    sourceLabel: 'Hansard',
  },
  {
    id: 'UG-executive-20260424-001',
    jurisdiction: 'Uganda',
    jurisdictionFlag: '🇺🇬',
    workstream: 'executive',
    title: 'Trade Order Enforcement Suspended Nationwide',
    summary:
      'Minister of State for Trade, Cooperatives and Industry Hon. David Bahati announced suspension of trade order enforcement across Uganda, pending stakeholder consultation on the implementation regime.',
    fullSummary:
      'Minister of State for Trade, Cooperatives and Industry (Industry) Hon. David Bahati announced suspension of trade order enforcement across Uganda during the plenary sitting of April 24, 2026. The announcement followed parliamentary concerns about the order. No timeframe for lifting the suspension was stated in available sources. Full details of which trade order was suspended were not available in sources retrieved.',
    keyPoints: [
      'Minister of State for Trade David Bahati announced suspension of trade order enforcement during the April 24, 2026 plenary sitting.',
      'The suspension applies across Uganda. Duration not specified in available sources.',
    ],
    citations: [
      { ref: 'Parliament of Uganda — Govt suspends trade order enforcement (24 Apr 2026)', url: 'https://www.parliament.go.ug/news' },
    ],
    sourceUrl: 'https://www.parliament.go.ug/news',
    date: '2026-04-24',
    dateLabel: '24 Apr 2026',
    verifiedBy: 'Chapter Four Uganda',
    sourceLabel: 'Gazette',
  },
];
