// All hardcoded fixtures for the Test Run tally mockup. Real wiring will replace these.
// When integrating real BLE + relay + signing, delete the corresponding constants
// here and the type errors will point at every wiring site.

export type Candidate = {
  id: string;
  name: string;
  party: string;
};

/** Default candidates for the test run — fully synthetic, no real political figures. */
export const DEFAULT_CANDIDATES: Candidate[] = [
  { id: 'c-a', name: 'Candidate A', party: 'Party A' },
  { id: 'c-b', name: 'Candidate B', party: 'Party B' },
  { id: 'c-c', name: 'Candidate C', party: 'Party C' },
];

export const STATION = {
  id:           'TEST-042',
  name:         'Test station',
  constituency: 'Practice mode · Demo ward',
  countryFlag:  '🧪',
} as const;

/** Tick interval for new BLE peer discoveries. */
export const PEER_DISCOVERY_MS = 1300;

/** Simulated server-side signing latency. */
export const SIM_SIGN_MS = 900;

/** Number of peers visible immediately when the screen opens (already nearby). */
export const INITIAL_PEERS = 3;

export type Peer = {
  id: string;
  /** Friendly numeric label shown in the UI ("Phone #3"). */
  label: string;
  /** Wall-clock at moment of discovery — used to render "Xs ago". */
  discoveredAt: number;
};

/** Soft cap on simulated peer growth — keeps the list manageable. */
export const MAX_PEERS = 30;
