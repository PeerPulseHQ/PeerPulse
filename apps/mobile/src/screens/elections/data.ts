// Mockup constants for the Elections page. Mirrors apps/web/data/elections-pipeline.json.
// When wiring to real data (relay or shared package), delete this file —
// TypeScript errors will point at every call site that needs updating.

export type ElectionCategory = 'general' | 'presidential' | 'parliamentary' | 'state' | 'by-election';

export type Election = {
  id: string;
  flag: string;
  country: string;
  type: string;
  /** Human-readable: "10 Aug 2027", "~Feb 2029", "Jan 2026" */
  date: string;
  /** ISO 8601 used purely for chronological sort. May be approximate. */
  sortDate: string;
  category: ElectionCategory;
  lead: string;
  notes: string;
  action: string;
};

export const CATEGORY_META: Record<ElectionCategory, { label: string }> = {
  general:       { label: 'GENERAL' },
  presidential:  { label: 'PRESIDENTIAL' },
  parliamentary: { label: 'PARLIAMENTARY' },
  state:         { label: 'STATE' },
  'by-election': { label: 'BY-ELECTION' },
};

export type KeyDate = {
  label: string;
  date: string;          // human-readable
  status: 'past' | 'upcoming' | 'tbc';
};

export type Candidate = {
  name: string;
  party: string;
  partyFull?: string;
  status: 'confirmed' | 'provisional' | 'withdrawn';
  note?: string;
};

export type ElectionDetail = {
  /** Speculative — provisional candidates and indicative dates. Not a forecast. */
  speculative: boolean;
  keyDates: KeyDate[];
  candidates: Candidate[];
};

export const ELECTION_DETAILS: Record<string, ElectionDetail> = {
  'ke-general-2027': {
    speculative: true,
    keyDates: [
      { label: 'Nominations open',  date: '~Apr 2027',  status: 'tbc' },
      { label: 'Nominations close', date: '~May 2027',  status: 'tbc' },
      { label: 'Campaign start',    date: '~9 May 2027', status: 'tbc' },
      { label: 'Campaign ends',     date: '8 Aug 2027',  status: 'tbc' },
      { label: 'Election day',      date: '10 Aug 2027', status: 'upcoming' },
    ],
    candidates: [
      { name: 'William Ruto',     party: 'UDA',  partyFull: 'United Democratic Alliance',     status: 'confirmed',  note: 'Incumbent, seeking 2nd term' },
      { name: 'Rigathi Gachagua', party: 'DCP',  partyFull: 'Democracy for the Citizens Party', status: 'provisional' },
      { name: 'Kalonzo Musyoka',  party: 'WIPER', partyFull: 'Wiper Democratic Movement',      status: 'provisional' },
      { name: 'Martha Karua',     party: 'NRK',  partyFull: 'National Rainbow Coalition Kenya', status: 'provisional' },
      { name: 'Fred Matiang’i', party: 'JUBILEE', partyFull: 'Jubilee Party',              status: 'provisional', note: 'Rumoured to enter race' },
    ],
  },

  'ng-general-2027': {
    speculative: true,
    keyDates: [
      { label: 'Nominations open',  date: '~Aug 2026',  status: 'tbc' },
      { label: 'Nominations close', date: '~Nov 2026',  status: 'tbc' },
      { label: 'Campaign start',    date: '~Sep 2026',  status: 'tbc' },
      { label: 'Campaign ends',     date: '18 Feb 2027', status: 'tbc' },
      { label: 'Election day',      date: '20 Feb 2027', status: 'upcoming' },
    ],
    candidates: [
      { name: 'Bola Tinubu',     party: 'APC', partyFull: 'All Progressives Congress', status: 'provisional', note: 'Incumbent — re-election bid expected' },
      { name: 'Peter Obi',       party: 'LP',  partyFull: 'Labour Party',              status: 'provisional' },
      { name: 'Atiku Abubakar',  party: 'PDP', partyFull: 'Peoples Democratic Party',  status: 'provisional' },
      { name: 'Rabiu Kwankwaso', party: 'NNPP', partyFull: 'New Nigeria Peoples Party', status: 'provisional' },
    ],
  },

  'ph-presidential-2028': {
    speculative: true,
    keyDates: [
      { label: 'Filing of candidacy', date: 'Oct 2027',  status: 'tbc' },
      { label: 'Campaign start',      date: 'Feb 2028',  status: 'tbc' },
      { label: 'Campaign ends',       date: '6 May 2028', status: 'tbc' },
      { label: 'Election day',        date: '8 May 2028', status: 'upcoming' },
    ],
    candidates: [
      { name: 'Sara Duterte',    party: 'HNP',     partyFull: 'Hugpong ng Pagbabago',     status: 'provisional', note: 'Sitting VP' },
      { name: 'Leni Robredo',    party: 'LIBERAL', partyFull: 'Liberal Party',            status: 'provisional' },
      { name: 'Manny Pacquiao',  party: 'PROMDI',  partyFull: 'PROMDI / coalition',       status: 'provisional' },
      { name: 'Bongbong Marcos', party: 'PFP',     partyFull: 'Partido Federal ng Pilipinas', status: 'withdrawn', note: 'Term-limited' },
    ],
  },

  'drc-presidential-2028': {
    speculative: true,
    keyDates: [
      { label: 'Voter registration', date: 'Q2 2028', status: 'tbc' },
      { label: 'Nominations close',  date: 'Sep 2028', status: 'tbc' },
      { label: 'Campaign start',     date: 'Oct 2028', status: 'tbc' },
      { label: 'Campaign ends',      date: '14 Dec 2028', status: 'tbc' },
      { label: 'Election day',       date: '16 Dec 2028', status: 'upcoming' },
    ],
    candidates: [
      { name: 'Félix Tshisekedi', party: 'UDPS',     partyFull: 'Union for Democracy and Social Progress', status: 'provisional', note: 'Term-limit interpretation pending' },
      { name: 'Moïse Katumbi',    party: 'ENSEMBLE', partyFull: 'Ensemble pour la République',         status: 'provisional' },
      { name: 'Martin Fayulu',         party: 'ECiDÉ', partyFull: 'Engagement pour la Citoyenneté et le Développement', status: 'provisional' },
      { name: 'Denis Mukwege',         party: 'IND',      partyFull: 'Independent',                              status: 'provisional', note: 'Nobel laureate' },
    ],
  },

  'zm-general-2026': {
    speculative: true,
    keyDates: [
      { label: 'Nominations open',  date: '~May 2026',  status: 'tbc' },
      { label: 'Nominations close', date: '~Jun 2026',  status: 'tbc' },
      { label: 'Campaign start',    date: '~Jun 2026',  status: 'tbc' },
      { label: 'Campaign ends',     date: '11 Aug 2026', status: 'tbc' },
      { label: 'Election day',      date: '13 Aug 2026', status: 'upcoming' },
    ],
    candidates: [
      { name: 'Hakainde Hichilema', party: 'UPND', partyFull: 'United Party for National Development', status: 'confirmed',  note: 'Incumbent, seeking 2nd term' },
      { name: 'Edgar Lungu',        party: 'PF',   partyFull: 'Patriotic Front',                       status: 'provisional', note: 'Eligibility under legal review' },
      { name: 'Fred M’membe',  party: 'SP',   partyFull: 'Socialist Party',                       status: 'provisional' },
    ],
  },

  'et-parliament-2026': {
    speculative: true,
    keyDates: [
      { label: 'Voter registration', date: 'Q1 2026', status: 'tbc' },
      { label: 'Nominations close',  date: 'Apr 2026', status: 'tbc' },
      { label: 'Campaign period',    date: 'May 2026', status: 'tbc' },
      { label: 'Election day',       date: 'Jun 2026', status: 'upcoming' },
    ],
    candidates: [
      { name: 'Prosperity Party slate', party: 'PP',  partyFull: 'Prosperity Party (Abiy Ahmed)', status: 'provisional', note: 'Dominant — opposition severely constrained' },
      { name: 'Ethiopian Citizens for Social Justice', party: 'EZEMA', partyFull: 'Ezema', status: 'provisional' },
      { name: 'Opposition coalition', party: 'TBC', partyFull: 'To be confirmed',          status: 'provisional', note: 'Restricted operating environment' },
    ],
  },

  'ng-state-2027': {
    speculative: true,
    keyDates: [
      { label: 'Nominations close', date: '~Dec 2026', status: 'tbc' },
      { label: 'Campaign period',   date: 'Jan–Mar 2027', status: 'tbc' },
      { label: 'Election day',      date: '6 Mar 2027', status: 'upcoming' },
    ],
    candidates: [
      { name: 'APC state slates', party: 'APC', partyFull: 'All Progressives Congress', status: 'provisional', note: 'Varies by state' },
      { name: 'PDP state slates', party: 'PDP', partyFull: 'Peoples Democratic Party',  status: 'provisional', note: 'Varies by state' },
      { name: 'LP state slates',  party: 'LP',  partyFull: 'Labour Party',              status: 'provisional' },
    ],
  },

  'zw-general-2028': {
    speculative: true,
    keyDates: [
      { label: 'Voter registration', date: 'Q1 2028', status: 'tbc' },
      { label: 'Nominations close',  date: 'May 2028', status: 'tbc' },
      { label: 'Campaign start',     date: 'Jun 2028', status: 'tbc' },
      { label: 'Election day',       date: '~Jul 2028', status: 'upcoming' },
    ],
    candidates: [
      { name: 'ZANU-PF nominee',    party: 'ZANU-PF', partyFull: 'Zimbabwe African National Union – Patriotic Front', status: 'provisional', note: 'Mnangagwa term-limit contest ongoing' },
      { name: 'Nelson Chamisa',     party: 'CCC',     partyFull: 'Citizens Coalition for Change',                       status: 'provisional' },
      { name: 'Saviour Kasukuwere', party: 'IND',     partyFull: 'Independent',                                          status: 'provisional' },
    ],
  },

  'id-presidential-2029': {
    speculative: true,
    keyDates: [
      { label: 'Coalition registration', date: 'Q2 2028', status: 'tbc' },
      { label: 'Nominations close',      date: 'Oct 2028', status: 'tbc' },
      { label: 'Campaign period',        date: 'Nov 2028 – Feb 2029', status: 'tbc' },
      { label: 'Election day',           date: '~Feb 2029', status: 'upcoming' },
    ],
    candidates: [
      { name: 'Prabowo Subianto', party: 'GERINDRA', partyFull: 'Gerindra',           status: 'provisional', note: 'Incumbent — 2nd-term eligible' },
      { name: 'Anies Baswedan',   party: 'NASDEM',   partyFull: 'NasDem coalition',   status: 'provisional' },
      { name: 'Ganjar Pranowo',   party: 'PDI-P',    partyFull: 'PDI-P',              status: 'provisional' },
    ],
  },
};

export const ELECTIONS: Election[] = [
  // ── National & state elections ──────────────────────────────────────────────
  {
    id: 'ke-general-2027',
    flag: '🇰🇪',
    country: 'Kenya',
    type: 'General — Presidential + Parliamentary + County',
    date: '10 Aug 2027',
    sortDate: '2027-08-10',
    category: 'general',
    lead: '15 months',
    notes:
      'Legal review complete. ELOG, ICJ Kenya, AFRICOG as seeding partners. Android >80%, WhatsApp dominant, high international press interest.',
    action: 'Seeding begins Oct 2026',
  },
  {
    id: 'ng-general-2027',
    flag: '🇳🇬',
    country: 'Nigeria',
    type: 'Presidential + National Assembly',
    date: '20 Feb 2027',
    sortDate: '2027-02-20',
    category: 'general',
    lead: '9 months',
    notes:
      'Largest African democracy. YIAGA Africa PVT programme is a direct analogue. 80M+ registered voters. Short lead — decide immediately.',
    action: 'Go/no-go by Jul 2026',
  },
  {
    id: 'ph-presidential-2028',
    flag: '🇵🇭',
    country: 'Philippines',
    type: 'Presidential + Congress',
    date: '8 May 2028',
    sortDate: '2028-05-08',
    category: 'presidential',
    lead: '24 months',
    notes:
      'High Android penetration. Strong civil society PVT tradition (PPCRV). English-language. Large diaspora following.',
    action: 'Legal review 2027',
  },
  {
    id: 'drc-presidential-2028',
    flag: '🇨🇩',
    country: 'DRC',
    type: 'Presidential + National Assembly',
    date: '16 Dec 2028',
    sortDate: '2028-12-16',
    category: 'presidential',
    lead: '31 months',
    notes:
      "CENCO one of Africa's most credible domestic observer orgs. Conditional on eastern conflict resolution. French-language app copy required.",
    action: 'Scope late 2026',
  },
  {
    id: 'zm-general-2026',
    flag: '🇿🇲',
    country: 'Zambia',
    type: 'General',
    date: '13 Aug 2026',
    sortDate: '2026-08-13',
    category: 'general',
    lead: '3 months',
    notes:
      'Below 4-month seeding minimum. Pilot run candidate only — no full deployment. Strong civil society, peaceful tradition.',
    action: 'Monitor only',
  },
  {
    id: 'et-parliament-2026',
    flag: '🇪🇹',
    country: 'Ethiopia',
    type: 'Parliamentary',
    date: 'Jun 2026',
    sortDate: '2026-06-01',
    category: 'parliamentary',
    lead: '—',
    notes:
      'Hostile civil society environment. Journalists and observers arrested. Internet shutdowns. Not a target market.',
    action: '—',
  },
  {
    id: 'ng-state-2027',
    flag: '🇳🇬',
    country: 'Nigeria',
    type: 'State elections',
    date: '6 Mar 2027',
    sortDate: '2027-03-06',
    category: 'state',
    lead: '~10 months',
    notes:
      'Follows federal election. YIAGA Africa coverage. High complexity, variable security by state.',
    action: 'Follows federal',
  },
  {
    id: 'zw-general-2028',
    flag: '🇿🇼',
    country: 'Zimbabwe',
    type: 'General',
    date: '~Jul 2028',
    sortDate: '2028-07-01',
    category: 'general',
    lead: '~26 months',
    notes:
      'ZANU-PF dominance. Legal risk for parallel tallying higher than Kenya. Needs jurisdiction-specific legal review.',
    action: 'Legal review needed',
  },
  {
    id: 'id-presidential-2029',
    flag: '🇮🇩',
    country: 'Indonesia',
    type: 'Presidential + DPR',
    date: '~Feb 2029',
    sortDate: '2029-02-15',
    category: 'presidential',
    lead: '~33 months',
    notes:
      '280M people. Android dominant. Strong civil society (KIPP, Perludem). High complexity.',
    action: 'Scope 2027',
  },
];

/** Returns elections sorted chronologically by `sortDate`. */
export function sortByDate(items: Election[]): Election[] {
  return [...items].sort((a, b) => a.sortDate.localeCompare(b.sortDate));
}
