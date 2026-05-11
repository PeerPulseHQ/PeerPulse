// All hardcoded values for the Home mockup live here.
// When wiring real data, delete this file — TypeScript errors will surface every call site.

export const STATUS_STRIP: {
  connected: boolean;
  relayCount: number;
  lastSync: string;
} = {
  connected: true,
  relayCount: 1,
  lastSync: '2s ago',
};

export const HERO_ELECTION = {
  flag: '⚡', // ⚡ placeholder accent
  jurisdiction: 'KENYA',
  title: 'KENYA GENERAL ELECTION',
  dateLabel: 'Mon · 10 Aug 2027',
  date: new Date('2027-08-10T00:00:00Z'),
} as const;

export const TEST_RUN_COPY = {
  heading: 'SEE IT WORK',
  body:
    'Get two or three friends to install the app. Stand in the same room. ' +
    'Watch the protocol verify your presence and sign a test count — ' +
    'exactly what happens on election day, minus the real vote.',
  scaleHint: '3 friends? 30? It scales the same.',
  cta: 'Start a test run →',
} as const;

export type UpcomingElection = {
  id: string;
  flag: string;
  country: string;
  dateLabel: string;
  date: Date;
};

export const UPCOMING_ELECTIONS: UpcomingElection[] = [
  {
    id: 'zm-2026',
    flag: '🇿🇲',
    country: 'ZAMBIA',
    dateLabel: '13 Aug 2026',
    date: new Date('2026-08-13T00:00:00Z'),
  },
  {
    id: 'ng-2027',
    flag: '🇳🇬',
    country: 'NIGERIA',
    dateLabel: '20 Feb 2027',
    date: new Date('2027-02-20T00:00:00Z'),
  },
  {
    id: 'cd-2028',
    flag: '🇨🇩',
    country: 'DRC',
    dateLabel: '16 Dec 2028',
    date: new Date('2028-12-16T00:00:00Z'),
  },
];
