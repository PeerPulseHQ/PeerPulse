# Task: @peerpulse/core — Fix Naming + Add Missing Fields

**Phase:** Week 1
**Depends on:** `week1-monorepo.md`
**Spec refs:** `tabulate/spec-protocol.md §7`, `spec-operations.md §1.2`

---

## What already exists

`packages/core/src/` has a solid structure. Do not restructure:

```
packages/core/src/
  index.ts          ← re-exports everything
  packets/
    index.ts
    topics.ts       ← GossipSub topic strings
    types.ts        ← all packet type definitions
  crypto/
    index.ts
    keys.ts
    presence.ts
    sign-packet.ts
  dispute/          ← dispute resolution logic
  validation/       ← packet validation pipeline
```

## What this task fixes

Three stale items that must be corrected before the relay and mobile tasks can proceed:

### 1. Rename `CheckInPacket` → `WitnessStartPacket`

In `packages/core/src/packets/types.ts`:

```typescript
// REMOVE:
export interface CheckInPacket {
  type:             'checkin';
  packet_id:        HexString;
  timestamp:        number;
  station_id:       string;
  reporter_pub_key: HexString;
  sig:              HexString;
}

// ADD:
export interface WitnessStartPacket {
  type:             'witness_start';
  packet_id:        HexString;
  witnessed_at:     number;      // Unix ms — renamed from timestamp
  station_id:       string;
  election_id:      string;      // added — links packet to election
  reporter_pub_key: HexString;
  sig:              HexString;
}
```

Update `AnyPacket` union — replace `CheckInPacket` with `WitnessStartPacket`.

### 2. Fix `TOPICS.CHECKIN` → `TOPICS.WITNESS`

In `packages/core/src/packets/topics.ts`:

```typescript
export const TOPICS = {
  ELECTION:  'peerpulse/election/1.0.0',
  TALLY:     'peerpulse/tally/1.0.0',
  INTENT:    'peerpulse/intent/1.0.0',
  WITNESS:   'peerpulse/witness/1.0.0',   // was CHECKIN: 'peerpulse/checkin/1.0.0'
  HEARTBEAT: 'peerpulse/heartbeat/1.0.0',
  POLL:      'peerpulse/survey/1.0.0',
  VOTE:      'peerpulse/vote/1.0.0',
} as const;
```

### 3. Add `polls_close_time` to `ElectionDefinition`

In `packages/core/src/packets/types.ts`:

```typescript
export interface ElectionDefinition {
  type:                  'election_definition';
  election_id:           string;
  name:                  string;
  jurisdiction:          string;
  election_date:         number;   // Unix ms — day of election
  polls_close_time:      number;   // Unix ms — when polls close; drives election day notifications
  registration_deadline: number;   // Unix ms
  stations:              Station[];
  dispute_threshold:     number;
  platform_pub_key:      HexString;
  sig:                   HexString;
}
```

---

## What does NOT change

- `TallyPacket` — correct as-is
- `IntentPacket` — correct as-is
- `ObserveHeartbeat` — correct as-is
- `WitnessBundle` / `WitnessAttestation` — correct as-is
- `SurveyDefinition` / `VotePacket` — correct as-is
- All crypto, dispute, validation logic — do not touch
- Trust tiers — do not touch

---

## Downstream: relay needs updating too

`apps/node/src/index.ts` references `TOPICS.CHECKIN` (if present after the rename). The relay task (`week1-relay.md`) handles the relay-side fix. Coordinate: do the core rename first, then the relay fix.

---

## Acceptance criteria

- [ ] `pnpm --filter @peerpulse/core build` passes with zero TypeScript errors
- [ ] `packages/core/dist/` re-generated with updated types
- [ ] `WitnessStartPacket` is exported from `@peerpulse/core`
- [ ] `CheckInPacket` no longer exists anywhere in `packages/core/`
- [ ] `TOPICS.WITNESS === 'peerpulse/witness/1.0.0'`
- [ ] `TOPICS.CHECKIN` no longer exists
- [ ] `ElectionDefinition.polls_close_time` is typed as `number` and exported
- [ ] `pnpm typecheck` across all workspaces passes (relay and web will need corresponding fixes)
