import type { TallyPacket, DisputeState, WitnessBundle } from '../packets/types.js';

export const CONFIRM_THRESHOLD = 3;
export const DISPUTE_THRESHOLD = 3;

function witnessCount(bundle: WitnessBundle | null): number {
  return bundle?.attestations.length ?? 0;
}

export interface DisputeResult {
  state:  DisputeState;
  winner: TallyPacket | null;
}

export function evaluateDispute(tallies: TallyPacket[]): DisputeResult {
  if (tallies.length === 0) {
    return { state: 'leading', winner: null };
  }

  // Sort by witness count descending
  const sorted = [...tallies].sort(
    (a, b) => witnessCount(b.witness_bundle) - witnessCount(a.witness_bundle),
  );

  const [leader, challenger] = sorted as [TallyPacket, TallyPacket | undefined];
  const leaderWitnesses     = witnessCount(leader.witness_bundle);
  const challengerWitnesses = challenger ? witnessCount(challenger.witness_bundle) : 0;

  if (leaderWitnesses >= CONFIRM_THRESHOLD && challengerWitnesses < DISPUTE_THRESHOLD) {
    if (Math.abs(leaderWitnesses - challengerWitnesses) <= 1) {
      return { state: 'deadlocked', winner: null };
    }
    return { state: 'confirmed', winner: leader };
  }

  if (challengerWitnesses >= DISPUTE_THRESHOLD) {
    if (Math.abs(leaderWitnesses - challengerWitnesses) <= 1) {
      return { state: 'deadlocked', winner: null };
    }
    return { state: 'contested', winner: null };
  }

  return { state: 'leading', winner: leader };
}

export function tallyTrustScore(tally: TallyPacket): number {
  const tierScore: Record<string, number> = {
    grey:        witnessCount(tally.witness_bundle) * 10,
    'grey-weak': 1,
  };
  return tierScore[tally.trust_tier] ?? 0;
}
