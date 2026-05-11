# PeerPulse — MVP Execution Plan

**Duration:** 13 weeks (90 days)
**Pace:** 4 hours/week — you review, test, and direct. Claude builds between sessions.
**Hard deadline:** Signed APK in ELOG's hands by October 2026 for Kenya 2027 civil society seeding.
**Build model:** Each week Claude produces working code. Your 4 hours is: open it, test it on real hardware, decide what's next.

---

## Scope

Full MVP includes:
- Expo Android app — all citizen flows
- Hardware attestation (TEE/ECDSA) — in scope, not deferred
- Photo capture + IPFS pinning — in scope (Pinata for MVP, relay-based IPFS post-launch)
- Sovereign Relay (Node.js)
- Desktop war room (Electron) — operator monitoring
- Kenya 2027 configured and demo-ready

Deferred post-MVP:
- PKI Gold/Org cert hierarchy (citizen tier only for MVP)
- Surveys pillar
- Full Journal pillar (seeding pipeline only for MVP)
- Learn pillar
- `expo-updates` OTA — explicitly excluded from the app build; no Expo OTA dependency. App updates ship as new APKs via F-Droid + direct download. Gossip-based OTA (signed `UpdateManifest` packet + IPFS bundle) is the post-MVP replacement.

---

## Weekly Plan

### Week 1 — Monorepo + App Shell + Relay + Physical Connection
**Outcome:** `pnpm dev` starts the relay. Mobile app opens in emulator with all four tabs. Physical Android device connects to relay — "Connected — [relay peer ID]" visible in a debug screen. **Build Gate 0 ✓**

The libp2p Hermes shim stack is already fully installed and configured in `apps/mobile/` — all dependencies, Babel aliases, Metro `extraNodeModules`, and `shims/globals.js` are in place. This week validates it end-to-end and builds the app shell around it.

Claude builds:
- pnpm workspace + turbo config (confirm existing `apps/mobile/` wiring is correct)
- `packages/core` skeleton (types only, no logic yet)
- `apps/node` — Sovereign Relay, WS transport, info endpoint `:9876`
- `apps/mobile/src/` — Expo app, bottom tab navigation (Elections, Journal placeholder, Surveys placeholder, Learn placeholder)
- libp2p node service in `apps/mobile/src/services/libp2p.ts` — dials relay, returns peer ID
- Debug connection screen — shows relay peer ID and connection state
- `apps/web` — replace Vite with Next.js 15 App Router; port `docs/product/archive/website-mockup.html` as static pages (components, IBM Plex fonts via `next/font`, canvas animation preserved as a client component); update pillar names to current naming during port (`Tabulate` → `Elections`, `Learn` → `Learn`); migrate existing `src/lib/node.ts` browser libp2p to a Next.js client component; route structure from `spec-operations.md §6.2`; server-side libp2p node skeleton (`lib/relay-node.ts`) that starts at Next.js server boot, dials relay, subscribes to GossipSub topics — feeds static placeholder data for now
- `docker/android-build/Dockerfile` — reproducible Android build image based on `ubuntu:22.04` + Java 17 + Android SDK + NDK r27; pins all tool versions; no EAS account required
- Dev client APK built inside Docker (`cd apps/mobile/android && ./gradlew assembleDebug`) — output is `peerpulse-dev.apk`, sideloaded onto physical device

The existing `apps/web/src/lib/node.ts` (browser libp2p) and `App.tsx` (identity + intent signing) are already built — they get migrated, not rewritten.

The Docker build is a **prerequisite for physical device testing** — Expo Go cannot run PeerPulse (custom native modules not in Expo Go). The dev APK must be on the device before Build Gate 0 can be confirmed.

Your 4 hours: run the Docker build (first run ~20 min; cached after), sideload the dev APK onto the physical Android device, run `pnpm dev` to start Metro + relay, confirm the app connects to relay and shows peer ID. Open `http://localhost:3000` — confirm the website matches the mockup. **This requires a physical Android phone and a reachable relay.** Review file structure against `spec-protocol.md §5`.

---

### Week 2 — Elections Tab (Explore + Starred)
**Outcome:** Open the Elections tab, browse upcoming elections seeded from `elections-pipeline.md`. Star Kenya 2027 and see it move to Starred.

Claude builds:
- Static elections seed data (JSON) from `elections-pipeline.md`
- Elections tab — Starred view (empty state → Explore auto-shown) + Explore view
- Election card component — country flag, name, date, countdown, observer count (0)
- Star/follow action with local persistence

Your 4 hours: browse all elections, star/unstar, verify Kenya 2027 countdown is correct. Give feedback on layout.

---

### Week 3 — `@peerpulse/core` — Packets, Signing, Validation
**Outcome:** `pnpm test` passes the full cryptographic validation suite from `spec-protocol.md §18.2`.

Claude builds:
- Protobuf schema compilation
- Ed25519 keypair generation + sign/verify (`@noble/curves`)
- All packet types: `IntentPacket`, `WitnessStartPacket`, `TallyPacket`, `ObserveHeartbeat`
- Local packet validation pipeline (schema version, timestamp, seen cache, sequence number)
- Dispute resolution logic

Your 4 hours: review test output, read through the packet types, confirm they match the spec.

---

### Week 4 — LAN Gossip + Offline-First Storage (Build Gate 1)
**Outcome:** Two devices on the same Wi-Fi network gossip packets to each other without any internet connection. The relay is unreachable — packets still flow. SQLite stores all received packets locally. **Build Gate 1 ✓**

This is the election-day blackout scenario. Governments cut internet; PeerPulse keeps running on local network. This week makes that true.

Claude builds:
- mDNS peer discovery (`@libp2p/mdns`) — devices find each other on LAN without a relay
- GossipSub topic wiring for LAN-only mode
- SQLite schema (`expo-sqlite`) — `packets`, `elections`, `stations`, `witnesses` tables
- Packet store service — persists all received packets; deduplicates by packet ID
- Connection manager — relay preferred, LAN fallback, offline-only graceful state
- Network status indicator in UI — "Relay", "LAN only", "Offline"

Your 4 hours: disconnect both phones from the internet (Wi-Fi only, no cellular). Confirm packets gossip between devices. Confirm packets persist in SQLite after app restart. Test the "LAN only" indicator.

---

### Week 5 — BLE Foreground Service
**Outcome:** Tap "Start Witnessing" on the Elections screen. Android notification appears: *"Witnessing [Station Name] — tap to stop."* BLE advertising is visible to nearby devices.

Claude builds:
- Android foreground service (via `expo-task-manager` or native module)
- `react-native-ble-plx` integration — advertising `{ election_id, station_id, presence_pub_key }`
- BLE scanning for matching advertisements
- `WitnessStartPacket` signed and gossipped on tap
- Witnessing screen — live witness counter, Stop button

Your 4 hours: test on physical Android, confirm notification shows, confirm BLE advertising is visible (use a BLE scanner app on a second phone to verify). Review service lifecycle.

---

### Week 6 — Hardware Attestation (TEE)
**Outcome:** App generates a TEE-backed ECDSA P-256 device key. Attestation chain is logged and verifiable offline against the pinned Google Hardware Attestation Root CA.

Requires Android 8+ (API 26+) device. StrongBox requires API 28+.

Claude builds:
- Android Keystore integration via `react-native-keychain`
- ECDSA P-256 key generation with attestation challenge = `SHA-256(election_id + station_id + nonce)`
- Attestation certificate chain extraction
- Offline chain verifier in `@peerpulse/core` — roots to pinned Google HW Attestation Root CA
- `session_key_sig` — ECDSA signs Ed25519 session public key

Your 4 hours: run on physical Android 8+ device, confirm key is hardware-backed (`security_level = TEE` in logs), confirm chain verifies. Test on software fallback device too. **Build Gate 5 ✓**

---

### Week 7 — Two-Phone BLE WitnessAttestation
**Outcome:** Two phones at the same station auto-discover each other. Witness counter on each phone shows "2 witnesses". Both devices hold mutual signed attestations.

Requires two physical Android devices.

Claude builds:
- WitnessAttestation GATT server + client
- Mutual attestation exchange protocol over BLE GATT write
- Witness counter UI — live update as peers discovered
- `WitnessBundle` assembly
- Submission gate — Submit button locked until `min_witnesses` reached

Your 4 hours: run both phones in the same room, confirm auto-discovery within 30 seconds, confirm witness count updates on both, confirm attestation exchange. **Build Gate 2 ✓**

---

### Week 8 — Intent + Full Witnessing Flow (UX)
**Outcome:** Walk through the complete citizen journey end-to-end on a single phone: voter registration lookup → intent declaration → election day notification scheduled → arrive at station → start witnessing → witness counter fills → ready to submit.

Claude builds:
- Voter registration screen (QR scan + manual station search)
- `IntentPacket` sign + gossip
- Election day notifications scheduled locally against `polls_close_time`
- Witnessing screen polish — station name, countdown to polls close, witness count, BLE status
- All four notification triggers from `spec-protocol.md §7.5`

Your 4 hours: walk the full journey, test notification scheduling (set `polls_close_time` to 5 minutes from now to test), verify all screens feel right.

---

### Week 9 — Tally Capture + Photo + TallyPacket End-to-End
**Outcome:** After witnessing, enter vote counts from a Form 35A, take a photo with the camera, submit. TallyPacket with photo hash, GPS coordinates, and WitnessBundle appears on the relay and on a second connected device.

Claude builds:
- Tally entry form — candidate names + vote count fields (from ElectionDefinition)
- `expo-camera` integration (gallery upload blocked — live capture only)
- GPS embedding (`expo-location`) — lat/lng/timestamp in TallyPacket fields
- Photo hash (SHA-256) computation
- Full `TallyPacket` assembly — payload, WitnessBundle, HWAttestation, photo fields
- Ed25519 signature over header + payload
- Gossip via GossipSub topic `peerpulse/tally/1.0.0`

Your 4 hours: submit a real tally from your phone, confirm it gossips to relay (check relay logs at `:9876`). Test photo capture. Test GPS embed. **Build Gate 3 ✓**

---

### Week 10 — IPFS Photo Storage
**Outcome:** Submitted photo is uploaded to Pinata (IPFS pinning service), CID returned and stored in `TallyPacket.photo_cid`. Photo is retrievable from any IPFS gateway by CID.

Using Pinata for MVP. Relay-hosted IPFS nodes are post-launch.

Claude builds:
- Pinata API integration (upload photo, get CID)
- `photo_cid` written into `TallyPacket` before signing
- Photo encrypted before upload (AES-256, key derived from session keypair)
- CID stored in SQLite alongside packet
- Photo viewable in tally detail screen via IPFS gateway URL

Your 4 hours: create a Pinata account (free tier), set API key in local env, submit a tally, confirm photo appears on `ipfs.io/ipfs/[CID]`.

---

### Week 11 — Results Feed + Dispute Display + Website Goes Live
**Outcome:** The Elections tab shows live tally status for each station. The website at `peerpulse.app` surfaces the same data publicly — `/elections` and `/elections/[electionId]` show real tally state, observer counts, and dispute status pulled from the relay. The website is now a live PeerPulse node.

Claude builds:
- Per-station tally aggregation from SQLite (mobile)
- Dispute resolution display — confirmation state badge, challenger count (mobile)
- Station list with live status indicators (mobile)
- Tally detail screen — full packet info, photo, witness list, HW attestation status (mobile)
- `ObserveHeartbeat` 60s TTL live observer count (mobile)
- `apps/web/lib/relay-node.ts` fully wired — server-side libp2p node subscribes to `peerpulse/tally/1.0.0`, `peerpulse/witness/1.0.0`, `peerpulse/heartbeat/1.0.0`; aggregates into an in-memory store; exposes via Next.js Route Handler
- `/elections` ISR page (revalidate 60s) — pulls aggregated station tally states from server-side node
- `/elections/[electionId]` ISR page — per-election station map, confirmation states, dispute feed, witness counts, photo thumbnails
- Client-side browser libp2p node (from `lib/node.ts`) wired into hero stats — live observer count, active elections, live packet count animates in the hero
- Open Graph image generation for election pages — dynamic OG cards with observer count and dispute status

Your 4 hours: submit tallies from phone, open `peerpulse.app/elections` in a browser, confirm station data appears within 60 seconds. Submit competing tallies — verify CONTESTED state shows on both mobile and web. Check that the hero stats update live in the browser.

---

### Week 12 — Desktop War Room (Electron)
**Outcome:** Open the Electron desktop app. See a live list of stations with tally status. Disputed stations are highlighted. Click a station to see all submitted tallies, witness counts, photo evidence.

Claude builds:
- `apps/desktop` — Electron shell + React renderer
- libp2p browser node (WS transport only) connecting to relay
- War room screen — station list, confirmation state, dispute flags
- Tally detail panel — all packets for a station, side-by-side comparison for disputes
- Auto-flag display: high orphan ratio, burst timing, split-witness
- Relay health panel

Your 4 hours: run Electron app, submit tallies from phone, confirm they appear in real time on desktop. Trigger a DEADLOCKED state and confirm the War Room highlights it.

---

### Week 13 — Kenya ElectionDefinition + Hardening + Signed APK
**Outcome:** A production-signed APK with Kenya General 2027 configured. Walk the full end-to-end flow. Share the APK with one trusted test contact outside your network.

Claude builds:
- Kenya 2027 ElectionDefinition (election_id: `ke-general-2027`, station seed list, `polls_close_time`)
- Release APK built via Docker (same image from Week 1): `./gradlew assembleRelease` — produces unsigned APK; no EAS account, no code uploaded to any cloud service
- APK signed offline on air-gapped machine using `apksigner` with YubiKey-stored keystore — keystore never touches any networked machine
- `/download` page updated with real APK URL + SHA-256 checksum (page already exists from Week 1; this just wires in the real build artifact)
- End-to-end smoke test script — covers all Build Gates 0–5

Your 4 hours: sign the APK (requires the air-gapped signing key), upload to download page, share with one test contact, confirm they can install and connect to the relay. **MVP complete.**

---

## Timeline

```
May 2026   Week 1–2    Foundation + relay connected on physical device (Gate 0)
Jun 2026   Week 3–5    Core protocol + LAN gossip + BLE running (Gate 1)
Jul 2026   Week 6–8    Hardware attestation + full UX flow (Gates 2, 5)
Aug 2026   Week 9–11   Tally submission + results feed (Gate 3)
Sep 2026   Week 12–13  Desktop war room + signed APK
Oct 2026              → ELOG outreach begins with working APK
Aug 2027              → Kenya General Election
```

---

## Dependencies You Own

| Item | When needed | Notes |
|---|---|---|
| Docker (20 GB disk, 8 GB RAM for build) | Week 1 | Android build environment — NDK r27, Java 17, Android SDK; first build ~20 min, cached after |
| 2× physical Android devices (API 26+) | Week 7 | BLE testing requires two real phones — emulator cannot do BLE |
| 1× Android device API 28+ for StrongBox | Week 6 | TEE/StrongBox testing; most modern Android phones qualify |
| Pinata account (free tier) | Week 10 | IPFS pinning; free tier sufficient for MVP |
| `apksigner` + `keytool` on air-gapped machine | Week 13 | For signing release APK; part of standard Android SDK, no separate install |
| Air-gapped machine + YubiKey | Week 13 | APK signing key generation and storage |
| Relay server (1984 Hosting or Mullvad) | Week 1 | Mobile + website both need a publicly reachable relay; server-side Next.js node dials it at boot |

---

## Risk Register

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| libp2p Hermes shim fails (Week 1) | Low | High — blocks everything | Shim stack already installed and configured in `apps/mobile/` — dependencies, Babel aliases, Metro config, and `shims/globals.js` are in place. Risk is now validation, not construction. |
| BLE GATT exchange unreliable on Android | Low–Medium | Medium — can retry | `react-native-ble-plx` is well-maintained; BLE GATT is stable on Android 8+ |
| TEE not available on test device | Low | Low — graceful fallback | Software fallback already specced; buy an API 28+ device if needed |
| Docker arm64/amd64 cross-compile friction (M-series Mac) | Low | Low — one-time fix | Add `--platform linux/amd64` to Docker run, or build on a Linux host; NDK r27 supports both |
| Pinata API changes / outage | Low | Low for MVP | CID is in the signed packet regardless; photo is retrievable from any IPFS node |
