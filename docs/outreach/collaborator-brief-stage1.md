# PeerPulse: Brief for Potential Collaborators

**May 2026**

## What this is

PeerPulse is a decentralised election verification platform for Android. Citizens use their phones to independently count, sign, and publish polling station results without trusting any government, corporation, or central server.

On election day, citizens arrive at their assigned station near survey-close time. The app automatically discovers other citizens at the same entrance via Bluetooth and cryptographically records their co-presence with no coordination, no registration. When the official results sheet is posted outside the station, citizens photograph it, enter the counts, and submit a signed tally. The network aggregates thousands of these across an election in real time.

When the parallel count matches the official result, the win is unimpeachable. When it doesn't, the world knows with cryptographic evidence produced by citizens, not organisations.

This is parallel vote tabulation. PeerPulse makes it decentralised and available to any citizen with an Android phone.

## Why now

**Kenya General Election, August 10, 2027.** That is the hard deployment target. Everything before it is a build problem. Everything after it is compounding.

The app needs to be in civil society hands by October 2026 for the seeding period. The build window is fixed by the election calendar.

## The technical work

The core stack is React Native (Expo) on Android, libp2p for peer-to-peer packet relay, and a Node.js sovereign relay. The app is designed to operate without any internet connection. Bluetooth and local Wi-Fi gossip work during the network shutdowns that governments use to buy time on election night.

Key unsolved problems include BLE GATT presence attestation, Android TEE hardware key attestation, and offline-first gossip across heterogeneous devices in the field.

There is a secondary product, **Journal**, which extracts and summarises official government proceedings (parliament debates, court rulings, budget sessions) in plain language and local languages. This is the between-elections engagement layer and the AI pipeline work.

## What kind of collaborator

The build is happening. We are not evaluating whether to do this; we are doing it, with a deadline we do not control.

Useful backgrounds:

- Android / React Native / Expo: native modules, BLE GATT, Android Keystore
- Distributed systems / p2p networking: libp2p, relay architecture
- AI/ML pipeline: extraction, summarisation, local language models (Swahili, Luganda)
- Civil society and electoral monitoring: existing relationships with observer organisations in East or Central Africa

Part-time technical contribution, domain ownership, or introductions to relevant civil society organisations are all valuable.

## What this is not

Not partisan. Not surveillance. No real identity leaves any device. The platform does not choose sides; it produces cryptographic evidence of what happened.

Not a startup in the conventional sense. There is no VC round, no growth metrics, no exit. The platform is structured to be structurally independent of any government's goodwill, including friendly ones.
