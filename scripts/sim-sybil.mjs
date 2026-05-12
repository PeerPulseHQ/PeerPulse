/**
 * PeerPulse Sybil Attack Simulator v2
 * 
 * Compares the vulnerable v7.0 protocol against proposed fixes.
 */

import { PeerPulseSimulator } from './simulation-engine.mjs';

function createMockTally({ id, votes, witnesses, age = 0 }) {
  const reporterKey = `pub-${id}`;
  return {
    packet_id: `pkt-${id}`,
    results: [{ candidate_id: 'A', votes }],
    reporter_pub_key: reporterKey,
    device_age_days: age,
    witness_bundle: {
      attestations: Array.from({ length: witnesses }, (_, i) => ({
        presence_pub_key: witnesses === 2 ? `honest-peer-${i}` : `sybil-peer-${i}`
      }))
    }
  };
}

// 1. Setup Actors
const honestTallies = [
  createMockTally({ id: 'h1', votes: 100, witnesses: 2, age: 100 }),
  createMockTally({ id: 'h2', votes: 100, witnesses: 2, age: 100 }),
  createMockTally({ id: 'h3', votes: 100, witnesses: 2, age: 100 }),
];

// Suitcase Sybil (30 brand new phones)
const sybilKeys = Array.from({ length: 30 }, (_, i) => `sybil-pub-${i}`);
const sybilTallies = sybilKeys.map((pub, i) => {
  const others = sybilKeys.filter(k => k !== pub);
  return {
    packet_id: `pkt-s${i}`,
    results: [{ candidate_id: 'A', votes: 500 }],
    reporter_pub_key: pub,
    device_age_days: 0,
    witness_bundle: {
      attestations: others.map(k => ({ presence_pub_key: k }))
    }
  };
});

const allTallies = [...honestTallies, ...sybilTallies];

function runSim(name, options) {
  const sim = new PeerPulseSimulator(options);
  const result = sim.evaluate(allTallies);
  
  console.log(`--- ${name} ---`);
  console.log(`Winner: Candidate A = ${result.winningVotes}`);
  console.log(`State:  ${result.state}`);
  result.clusters.forEach(c => {
    console.log(`  Cluster (${c.votes} votes): Weight ${c.totalWeight.toFixed(2)} (${c.members.length} devices)`);
  });
  console.log('');
}

console.log('PEERPULSE SECURITY SIMULATION\n');

// SCENARIO 1: Current Vulnerable Protocol
runSim('VULNERABLE (Current)', {
  useStrangerEntropy: false,
  useReputation: false,
  stationCap: Infinity
});

// SCENARIO 2: Fix 1 - Stranger Entropy (Clique Penalty)
runSim('FIX 1: STRANGER ENTROPY', {
  useStrangerEntropy: true,
  useReputation: false,
  stationCap: Infinity
});

// SCENARIO 3: Fix 2 - Reputation Aging
runSim('FIX 2: REPUTATION AGING', {
  useStrangerEntropy: false,
  useReputation: true,
  stationCap: Infinity
});

// SCENARIO 4: Fix 3 - Station Saturation Cap
runSim('FIX 3: STATION CAP (Max 1000)', {
  useStrangerEntropy: false,
  useReputation: false,
  stationCap: 1000
});

// SCENARIO 5: All Fixes Enabled
runSim('COMBINED DEFENCE (Uganda Spec)', {
  useStrangerEntropy: true,
  useReputation: true,
  stationCap: 1000
});
