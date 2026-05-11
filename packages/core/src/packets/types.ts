export type HexString = string;
export type Base64String = string;

// ── Trust tiers ──────────────────────────────────────────────────────────────

// Trust tier for TallyPacket / VotePacket only.
// Platform (Silver) is not a tally trust tier — see spec Section 13.
export type TrustTier =
  | 'grey'       // WitnessBundle with N ≥ 3 witnesses (BLE or QR)
  | 'grey-weak'; // No witnesses

// ── Presence attestation ─────────────────────────────────────────────────────

export interface WitnessAttestation {
  presence_pub_key: HexString;   // Ed25519 public key of the witness
  attestation_sig:  HexString;   // Ed25519 signature over subject's presence_pub_key
  session_window:   number;      // Unix timestamp seconds of pairing session start
  pairing_method:   'qr' | 'ble';
}

export interface WitnessBundle {
  attestations:   WitnessAttestation[];
  subject_pub_key: HexString;
}

// ── Election registry ─────────────────────────────────────────────────────────

export interface Station {
  station_id: string;
  name:       string;
  address?:   string;
}

export interface ElectionDefinition {
  type:                  'election_definition';
  election_id:           string;
  name:                  string;
  jurisdiction:          string;
  election_date:         number;   // Unix ms
  polls_close_time:      number;   // Unix ms — when polls close
  registration_deadline: number;   // Unix ms
  stations:              Station[];
  dispute_threshold:     number;
  platform_pub_key:      HexString;
  sig:                   HexString;
}

// ── Station status signals ────────────────────────────────────────────────────

export interface IntentPacket {
  type:             'intent';
  packet_id:        HexString;
  timestamp:        number;
  election_id:      string;
  station_id:       string;
  reporter_pub_key: HexString;
  sig:              HexString;
}

export interface WitnessStartPacket {
  type:             'witness_start';
  packet_id:        HexString;
  witnessed_at:     number;       // Unix ms
  station_id:       string;
  election_id:      string;
  reporter_pub_key: HexString;
  sig:              HexString;
}

export interface ObserveHeartbeat {
  type:             'observe_heartbeat';
  packet_id:        HexString;
  timestamp:        number;             // TTL: 60 s
  station_id:       string;
  reporter_pub_key: HexString;
  sig:              HexString;
}

// ── Tally submission ──────────────────────────────────────────────────────────

export interface CandidateResult {
  candidate_id:   string;
  candidate_name: string;
  votes:          number;
}

export interface TallyPacket {
  type:             'tally';
  packet_id:        HexString;
  timestamp:        number;
  station_id:       string;
  election_id:      string;
  results:          CandidateResult[];
  reporter_pub_key: HexString;
  trust_tier:       TrustTier;
  witness_bundle:   WitnessBundle | null;
  cert_chain:       Base64String[] | null;  // DER certs for gold/blue
  sig:              HexString;
}

// ── Online surveys ──────────────────────────────────────────────────────────────

export type EligibilityMode = 'open' | 'witnessed' | 'credentialed';

export interface SurveyOption {
  option_id:    string;
  option_label: string;
}

export interface SurveyDefinition {
  type:             'poll_definition';
  packet_id:        HexString;
  timestamp:        number;
  survey_id:          string;
  question:         string;
  options:          SurveyOption[];
  closes_at:        number;
  eligibility:      EligibilityMode;
  creator_pub_key:  HexString;
  sig:              HexString;
}

export interface VotePacket {
  type:             'vote';
  packet_id:        HexString;
  timestamp:        number;
  survey_id:          string;
  option_id:        string;
  voter_pub_key:    HexString;   // pseudonymous — unique per survey
  witness_bundle:   WitnessBundle | null;
  sig:              HexString;
}

// ── Dispute state ─────────────────────────────────────────────────────────────

export type DisputeState =
  | 'confirmed'   // ≥ 3 witnesses, no challenger at threshold
  | 'leading'     // no challenger at DISPUTE_THRESHOLD yet
  | 'contested'   // challenger has ≥ DISPUTE_THRESHOLD witnesses
  | 'deadlocked'; // leading and challenger within ±1 witness

// ── Union of all packet types ─────────────────────────────────────────────────

export type AnyPacket =
  | ElectionDefinition
  | IntentPacket
  | WitnessStartPacket
  | ObserveHeartbeat
  | TallyPacket
  | SurveyDefinition
  | VotePacket;
