# Task: Mobile "Test Run" Screen — Static Mockup

**Phase:** Design mockup (post-Week 1)
**Depends on:** `mobile-home-mockup.md` (Test tab in nav, Home callout that links to this screen)
**Spec refs:** `tabulate/spec-protocol.md §5` (BLE Station Presence), `tabulate/spec-trust.md §4.4` (WitnessBundle), design discussion (non-dev framing, 4-step flow, hide technical details behind expander)

---

## Scope

**Mockup only.** No real BLE, no real libp2p publish, no real signature verification beyond what already exists in the current playground (Ed25519 signing of a JSON object client-side). Every "discovered peer" is a hardcoded fixture. The 4-step flow renders as a fully clickable demo — a user can tap through to the result screen without any actual networking happening. Real BLE + tally submission is a separate task.

The purpose of this mockup is to validate the **non-developer UX** with civil society partners and to give the team something to demo before committing engineering time to the BLE implementation.

---

## What exists today

- `apps/mobile/src/screens/playground/PlaygroundScreen.tsx` — current playground. Uses HTTP polling, demos Ed25519 signing of `IntentPacket`, surfaces hex pubkeys and topic names directly in the UI. Designed for developers.
- `apps/mobile/src/services/relay-config.ts` — `RELAY_INFO_URL` constant, used by the current playground.
- `@noble/curves/ed25519` already shimmed for Hermes — usable for client-side signing in the mockup.

The current playground is the *fallback* path (one phone, no other phones present). It stays in the codebase but is no longer the default Test Run experience.

---

## What this task builds

A new screen at `apps/mobile/src/screens/test-run/TestRunScreen.tsx` that replaces `PlaygroundScreen` as the Test tab's default. The screen renders a four-step flow with non-developer language, then a result screen.

### Branding and copy

- **Screen title:** "Test run"
- **Subtitle (welcome step only):** "See the protocol work — with a few friends, or alone"
- **Internal route name:** keep `Playground` to avoid renaming churn; only the UI label changes
- All hex strings, topic names, `peerpulse/intent/1.0.0`, and similar dev jargon are hidden behind a **"Show technical details"** expander at the bottom of each step. The expander defaults closed.

### Step 1 — Connect to a test relay

```
┌─────────────────────────────────────┐
│ Test run                  STEP 1/4  │
├─────────────────────────────────────┤
│                                     │
│   Where should the test connect?    │
│                                     │
│   ●  Your laptop on this Wi-Fi      │
│      10.216.22.64                   │
│      [ Auto-detected ]              │
│                                     │
│   ○  Scan a QR code                 │
│      Use this if a friend is        │
│      hosting the test from their    │
│      laptop                         │
│      [ Scan QR ]                    │
│                                     │
│   ○  Enter relay URL manually       │
│                                     │
│   [ Connect → ]                     │
│                                     │
├─────────────────────────────────────┤
│ ▾ Show technical details            │
└─────────────────────────────────────┘
```

Mockup behaviour: tapping `Connect →` advances to Step 2 after a 1.5s simulated "connecting…" state. No actual HTTP call.

### Step 2 — Stand in the same room

```
┌─────────────────────────────────────┐
│ ← Test run                STEP 2/4  │
├─────────────────────────────────────┤
│                                     │
│   STAND IN THE SAME ROOM            │
│                                     │
│   Other phones nearby: 2            │
│                                     │
│   ● Phone discovered (15s ago)      │
│   ● Phone discovered (8s ago)       │
│                                     │
│   When you're all gathered, tap     │
│   "I'm ready" together.             │
│                                     │
│   [ I'm ready → ]                   │
│   [ Skip — test solo ]              │
│                                     │
├─────────────────────────────────────┤
│   What this proves                  │
│   Your phones are detecting each    │
│   other via Bluetooth — no internet │
│   needed. On election day, this is  │
│   how the app proves you were       │
│   physically at a polling station.  │
└─────────────────────────────────────┘
```

Mockup behaviour:
- Starts with "0 phones nearby"
- After 2s, animates to "1 phone discovered"
- After 5s, animates to "2 phones discovered"
- Both `I'm ready` and `Skip` advance to Step 3
- `Skip` advances with a "Solo test — no witnesses" indicator on Step 3

No real BLE. Hardcoded timers + state.

### Step 3 — Pick a test tally

```
┌─────────────────────────────────────┐
│ ← Test run                STEP 3/4  │
├─────────────────────────────────────┤
│                                     │
│   PICK A NUMBER TOGETHER            │
│                                     │
│   Everyone should pick the same     │
│   number. On election day, this is  │
│   the count posted at your station. │
│                                     │
│   [ 100  ] [ 412  ] [ 500  ]        │
│   [ 1024 ] [ 2048 ] [ Custom ]      │
│                                     │
│   For: Candidate A                  │
│   Station: Test station             │
│                                     │
│   [ Sign and submit → ]             │
│                                     │
├─────────────────────────────────────┤
│ ▾ Show technical details            │
│   When you tap submit, your phone   │
│   signs a TallyPacket containing:   │
│   - the count above                 │
│   - your station session key        │
│   - the witness attestations from   │
│     the phones you just discovered  │
└─────────────────────────────────────┘
```

Mockup behaviour: button selection state, "Sign and submit" advances to Step 4 after a 1s simulated signing/publishing.

### Step 4 — Result

```
┌─────────────────────────────────────┐
│ ← Test run                  RESULT  │
├─────────────────────────────────────┤
│                                     │
│      ✓ ALL THREE PHONES AGREED      │
│                                     │
│      Candidate A · 412 votes        │
│                                     │
│      ──────────────────────         │
│                                     │
│   Verified by the relay you're      │
│   connected to. The relay does not  │
│   know who you are — only that 3    │
│   real phones in one room agreed    │
│   on this number.                   │
│                                     │
│   On election day, the same         │
│   mechanism aggregates thousands    │
│   of these from every polling       │
│   station — without trusting any    │
│   single server.                    │
│                                     │
│   ─────────────────────────         │
│                                     │
│   [ Open relay to see proof ]       │
│   [ Run another test ]              │
│                                     │
└─────────────────────────────────────┘
```

Mockup behaviour:
- Headline reads "ALL THREE PHONES AGREED" if Step 2 had 2 peers, "TWO PHONES AGREED" if 1 peer, "SOLO TEST — NO WITNESSES YET" if skipped
- `Open relay to see proof` opens an external link to the relay's HTTP endpoint (configured but inert in mockup — `Linking.openURL` to e.g. `http://10.216.22.64:9876/elections/playground/tallies`)
- `Run another test` resets state and returns to Step 1

---

## File structure

```
apps/mobile/
  src/
    screens/
      test-run/
        TestRunScreen.tsx       ← top-level screen, owns step state
        components/
          Step1Connect.tsx
          Step2DiscoverPeers.tsx
          Step3PickTally.tsx
          Step4Result.tsx
          TechnicalDetails.tsx  ← reusable expander
          StepHeader.tsx        ← "← Test run  STEP N/4" header
        mockData.ts             ← all hardcoded peer fixtures, timers, copy
      playground/
        PlaygroundScreen.tsx    ← LEFT IN PLACE as fallback, not removed
```

Keeping `PlaygroundScreen.tsx` ensures the dev-oriented HTTP-polling intent flow stays available for developers who need it — accessible via a "Show developer playground" link inside the technical-details expander on Step 1.

---

## Acceptance criteria

- [ ] Test tab opens to `TestRunScreen.tsx`, not the old playground
- [ ] All four steps render correctly on a 375×667 viewport
- [ ] User can tap through all steps without any network errors
- [ ] Each step shows "Show technical details" expander; expander defaults closed; opening reveals the dev-level explanation
- [ ] Step 2 animates the "phones nearby" count from 0 → 1 → 2 over ~7 seconds
- [ ] Step 4 result headline adapts to peer count from Step 2 (3-phone / 2-phone / solo variants)
- [ ] `Run another test` resets state cleanly (no stale peer count, no stale tally selection)
- [ ] `pnpm typecheck` passes
- [ ] No crashes, no console errors

---

## Out of scope (do NOT do in this task)

- Real BLE advertising or scanning
- Real `react-native-ble-plx` integration
- Real `TallyPacket` schema work in `@peerpulse/core` (use a local shape; full type lives in core later)
- Real `WitnessBundle` assembly (mockup pretends it happened)
- Real relay POST to `/elections/:id/tallies` (relay accept-and-verify endpoint is a separate task)
- Android BLE permission flow (no permissions need to be requested for a mockup)
- QR code scanning (the QR option button is a no-op in mockup)
- Real persistence across step transitions (in-memory state in `TestRunScreen.tsx` is sufficient)
- i18n / translations
- Telemetry / analytics on test-run completion

Each of those becomes its own task once the mockup is validated with users.
