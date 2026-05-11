import type {
  AnyPacket, TallyPacket, VotePacket, SurveyDefinition,
  IntentPacket, WitnessStartPacket, ObserveHeartbeat,
} from '../packets/types.js';
import { verifyPacket } from '../crypto/sign-packet.js';
import { verifyBundle } from '../crypto/presence.js';

export interface ValidationResult {
  valid:  boolean;
  errors: string[];
}

function ok(): ValidationResult {
  return { valid: true, errors: [] };
}

function fail(...errors: string[]): ValidationResult {
  return { valid: false, errors };
}

const HEARTBEAT_TTL_MS = 60_000;

export function validateTally(packet: TallyPacket): ValidationResult {
  const errors: string[] = [];

  if (!packet.station_id)  errors.push('missing station_id');
  if (!packet.election_id) errors.push('missing election_id');
  if (packet.results.length === 0) errors.push('empty results');

  if (packet.trust_tier === 'grey') {
    if (!packet.witness_bundle) {
      errors.push('grey requires witness_bundle');
    } else if (!verifyBundle(packet.witness_bundle)) {
      errors.push('witness_bundle has invalid attestations');
    }
  }

  if (!verifyPacket(packet, packet.reporter_pub_key)) {
    errors.push('invalid signature');
  }

  return errors.length ? fail(...errors) : ok();
}

export function validateVote(packet: VotePacket, survey: SurveyDefinition): ValidationResult {
  const errors: string[] = [];

  if (packet.survey_id !== survey.survey_id) errors.push('survey_id mismatch');

  const optionIds = survey.options.map(o => o.option_id);
  if (!optionIds.includes(packet.option_id)) errors.push('unknown option_id');

  if (Date.now() / 1000 > survey.closes_at) errors.push('survey closed');

  if (survey.eligibility === 'witnessed') {
    if (!packet.witness_bundle) {
      errors.push('witnessed survey requires witness_bundle');
    } else if (!verifyBundle(packet.witness_bundle)) {
      errors.push('witness_bundle has invalid attestations');
    }
  }

  if (!verifyPacket(packet, packet.voter_pub_key)) {
    errors.push('invalid signature');
  }

  return errors.length ? fail(...errors) : ok();
}

export function validateHeartbeat(packet: ObserveHeartbeat): ValidationResult {
  const age = Date.now() - packet.timestamp * 1000;
  if (age > HEARTBEAT_TTL_MS) return fail('heartbeat expired');
  if (!verifyPacket(packet, packet.reporter_pub_key)) return fail('invalid signature');
  return ok();
}

export function validatePacket(packet: AnyPacket): ValidationResult {
  if (!verifyPacket(packet, (packet as TallyPacket).reporter_pub_key ?? (packet as VotePacket).voter_pub_key)) {
    return fail('invalid signature');
  }
  return ok();
}
