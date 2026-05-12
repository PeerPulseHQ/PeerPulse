/**
 * PeerPulse Simulation Engine
 * 
 * Implements the Whitepaper v7.0 Aggregation Logic (Section 6)
 * to test Sybil attacks and proposed fixes.
 */

export class PeerPulseSimulator {
  constructor(options = {}) {
    this.useStrangerEntropy = options.useStrangerEntropy || false;
    this.useReputation      = options.useReputation      || false;
    this.stationCap         = options.stationCap         || Infinity;
  }

  /**
   * Section 6.3: Build the Witness Intersection Graph
   * and identify clusters.
   */
  groupIntoClusters(tallies) {
    const clusters = [];
    const processed = new Set();

    for (const tally of tallies) {
      if (processed.has(tally.packet_id)) continue;

      // Simplification: In a real simulation, we'd check if A witnessed B.
      // For this script, we assume tallies with the same 'votes' and 
      // overlapping witness lists are in the same cluster.
      const cluster = tallies.filter(t => 
        t.results[0].votes === tally.results[0].votes &&
        this.sharesWitnesses(t, tally)
      );

      cluster.forEach(t => processed.add(t.packet_id));
      clusters.push({
        votes: tally.results[0].votes,
        members: cluster
      });
    }

    return clusters;
  }

  sharesWitnesses(a, b) {
    if (a.packet_id === b.packet_id) return true;
    const setA = new Set(a.witness_bundle.attestations.map(att => att.presence_pub_key));
    const setB = new Set(b.witness_bundle.attestations.map(att => att.presence_pub_key));
    
    // In a suitcase, every phone sees every other phone.
    // In an honest station, there's overlap.
    for (const id of setA) {
      if (setB.has(id)) return true;
    }
    // Also check if they saw each other
    if (setA.has(b.reporter_pub_key) || setB.has(a.reporter_pub_key)) return true;
    
    return false;
  }

  /**
   * Section 6.4: Connectivity Boost
   */
  computeWeight(tally, cluster) {
    const n = tally.witness_bundle.attestations.length;
    let baseWeight = 100; // Green Tier

    if (this.useReputation) {
      // Mock: older devices have more weight
      const age = tally.device_age_days || 0;
      baseWeight = age >= 90 ? 100 : 1;
    }

    // Whitepaper Formula: base * (1 + log2(n + 1))
    const multiplier = 1 + Math.log2(n + 1);
    let weight = baseWeight * multiplier;

    if (this.useStrangerEntropy) {
      // FIX: Check if witnesses are "strangers" or just the same clique
      // A "stranger" is a witness who is NOT submitting a tally in this same cluster.
      const clusterMemberKeys = new Set(cluster.members.map(m => m.reporter_pub_key));
      const externalWitnesses = tally.witness_bundle.attestations.filter(att => 
        !clusterMemberKeys.has(att.presence_pub_key)
      );
      
      if (externalWitnesses.length === 0 && cluster.members.length > 1) {
        // Pure clique penalty: They only saw each other.
        weight *= 0.1;
      }
    }

    return weight;
  }

  evaluate(tallies) {
    const clusters = this.groupIntoClusters(tallies);
    
    const weightedClusters = clusters.map(c => {
      let totalWeight = c.members.reduce((sum, t) => sum + this.computeWeight(t, c), 0);
      
      if (totalWeight > this.stationCap) {
        totalWeight = this.stationCap;
      }

      return { ...c, totalWeight };
    });

    weightedClusters.sort((a, b) => b.totalWeight - a.totalWeight);

    const winning = weightedClusters[0];
    const runner  = weightedClusters[1];

    let state = 'leading';
    if (winning && (!runner || winning.totalWeight >= 3 * runner.totalWeight)) {
      state = 'confirmed';
    } else if (winning && runner) {
      state = 'contested';
    }

    return {
      state,
      winningVotes: winning?.votes,
      clusters: weightedClusters
    };
  }
}
