# Security Audit: The Suitcase Sybil Vulnerability

**Date:** May 12, 2026  
**Subject:** Vulnerability Analysis of the PeerPulse v7.0 Tally Aggregation Protocol  
**Focus:** Mechanical Sybil attacks via hardware-attested device clusters ("Suitcase Sybil").

---

## Executive Summary

The PeerPulse protocol currently relies on a fundamental fallacy: that **Hardware Attestation (TEE)** is a proxy for **Human Uniqueness**. In a state-level adversarial environment, TEE-enabled hardware is simply a commodity. 

A well-funded attacker can deploy "Suitcase Sybils"—clusters of 15–30 Android devices in a single bag—to manufacture "Citizen-Verified" results. Because the protocol rewards density and connectivity, these mechanical clusters carry more weight than honest individual citizens or even official government (Gold) submissions.

## 1. Critique: The Clique Multiplier Exploitation

### The Problem
Section 6.4 rewards "Connectivity Boost" based on the number of witnesses (`n`). A suitcase of 30 phones forms a **Perfect Clique**, where every device sees the other 29. 
*   **Result:** Every device in the bag receives the maximum possible multiplier (~6x). 
*   **Impact:** A single bag of 30 phones produces an effective weight of **~18,000**, easily overriding an honest official (Gold) submission which is capped at 2,000.

### The Solution: Stranger Entropy (The Clique Penalty)
Modify the weight algorithm to measure the "openness" of the witness graph.
*   **Mechanism:** Introduce an **Entropy Score ($E$)**. $E$ is the ratio of "Internal Witnesses" (peers who only saw members of this cluster) to "External Witnesses" (peers who have witnessed devices outside this specific cluster).
*   **Formula:** If a cluster has 0% interaction with the wider "Stranger" pool of devices, apply a **Mechanical Penalty (0.1x)**. 
*   **Outcome:** A suitcase of phones talking only to each other is mathematically treated as a single device, not 30.

## 2. Critique: Evidence-Free Overrides

### The Problem
Green Tiers (Citizens) are not required to submit photos to receive the connectivity boost. 
*   **Result:** An attacker can automate 30 "witnessed" tallies with zero photographic evidence.
*   **Impact:** These 30 "invisible" devices can trigger the `CITIZEN-CONFIRMED` state, which the protocol labels as "proof of institutional fraud," without providing a single pixel of human-verifiable evidence.

### The Solution: Evidence Gating
Tie high-confidence states to a minimum "Physical Evidence Quorum."
*   **Mechanism:** A station cannot transition to `CITIZEN-CONFIRMED` unless the winning cluster contains at least **3 unique photo hashes** (`photo_hash`).
*   **Outcome:** This forces the attacker to solve the "Computer Vision" problem (faking 3 unique, plausible photos of a tally sheet from different angles) rather than just a "Signature" problem.

## 3. Critique: The "Flash Mob" Identity Problem

### The Problem
The protocol allows "ephemeral session keypairs" with no history. A thousand "Citizen" devices can appear for the first time on election day, vote, and disappear.
*   **Result:** There is no "Cost of Entry" for a new device.
*   **Impact:** An attacker can procure 100,000 devices for a $13.5M budget (Uganda 35k station scale) and deploy them with no "warm-up" period or reputation risk.

### The Solution: Proof-of-Longevity (Reputation Aging)
Introduce a **Reputation Multiplier ($R$)** based on device age and non-election participation.
*   **Mechanism:** Devices gain base weight based on how long they have been active on the network.
    *   *Day 1 Device:* 1x Weight.
    *   *90-Day Device (with 5+ "Learn" modules completed):* 100x Weight.
*   **Outcome:** To hit the "Uganda Scale," an attacker would have to maintain and "interact" with 150,000 phones for 3 months prior to the election, creating a massive logistical and intelligence footprint that is likely to be detected.

## 4. Critique: Micro-Location Jitter (GPS Spoofing)

### The Problem
The 200m–1000m GPS radius allows a suitcase to be "present" from a van parked around the corner.
*   **Result:** The "Physical Presence" signal is too coarse. 
*   **Impact:** Combined with automated entry, the handler never has to show their face or the suitcase at the actual polling station door.

### The Solution: RSSI Variance Check
Utilize Bluetooth Signal Strength (RSSI) as a "Physical Proximity" validator.
*   **Mechanism:** Receiving nodes (Relays) analyze the `WitnessBundle`. If 30 phones report seeing each other with near-identical, static RSSI values (e.g., -10dB to -15dB) for 4 hours, they are flagged as **"Statistically Stationary" (In a bag)**.
*   **Outcome:** Real humans move. They shift their weight, they walk to the wall, they put their phone in their pocket. A mechanical cluster has a "flat" signal profile that is trivial to detect via anomaly filtering.

## 5. Critique: The Encryption "Dead Zone"

### The Problem
Fraudulent photos are encrypted on-device. The "War Room" cannot see that 30 photos are identical until they trigger a manual 3-of-5 decryption ceremony.
*   **Result:** The "Legitimacy Inversion" happens in real-time, while the evidence to debunk it stays locked for days.

### The Solution: Zero-Knowledge Perspective Proofs
Require devices to submit a **ZK-Proof of Perspective**.
*   **Mechanism:** The app uses the device's accelerometer/gyroscope during photo capture. It signs a "Perspective Vector" (Angle + Tilt).
*   **Verification:** The Relay checks that the 30 photos in a cluster have a **Perspective Variance > 15%**. 
*   **Outcome:** 30 phones in a suitcase will have near-identical tilt/angle sensors. A relay can reject the cluster automatically without ever needing to decrypt the actual photos.

---

## Implementation Priority
1.  **Stranger Entropy (High):** Prevents the Suitcase Sybil from scaling weight.
2.  **Evidence Gating (High):** Prevents "Ghost" confirmations.
3.  **Reputation Aging (Medium):** Raises the financial and logistical cost of entry.
4.  **Perspective/RSSI Checks (Medium):** Hardens physical presence verification.
