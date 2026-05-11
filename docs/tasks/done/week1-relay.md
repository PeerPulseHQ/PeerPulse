# Task: Sovereign Relay — Verification + Topic Fix

**Phase:** Week 1
**Depends on:** `week1-core.md` (needs updated TOPICS before relay can reference them)
**Spec refs:** `tabulate/spec-protocol.md §5`, `spec-operations.md §3.1`

---

## What already exists

`apps/node/` is a fully functional relay. Do not restructure:

```
apps/node/src/
  index.ts         ← libp2p node + HTTP API (largely complete)
  db.ts            ← SQLite persistence for elections + intents
  platform-key.ts  ← Ed25519 platform key load/create
```

**What's already working:**
- libp2p node with WS (`:9090`) + TCP transports
- Circuit Relay v2 server
- GossipSub (subscribed to `TOPICS.ELECTION` and `TOPICS.INTENT`)
- HTTP info endpoint at `:9876` returning `{ peerId, wsAddr, addrs, platform_pub_key }`
- SSE endpoint at `:9876/events` for real-time broadcast to web clients
- `POST /elections` — create + sign + gossip an `ElectionDefinition`
- `GET /elections` — list stored elections
- `POST/GET /elections/:id/intents`
- SQLite persistence via `better-sqlite3`

---

## What this task fixes

### 1. Update `TOPICS.CHECKIN` reference → `TOPICS.WITNESS`

After `week1-core.md` renames the topic constant, `apps/node/src/index.ts` must be updated if it references `TOPICS.CHECKIN`. Search and replace — the relay currently subscribes to `TOPICS.ELECTION` and `TOPICS.INTENT` only, so this may be a no-op if CHECKIN was never subscribed.

Confirm `apps/node/src/index.ts` does not reference `TOPICS.CHECKIN` after the core fix. If it does, update to `TOPICS.WITNESS`.

### 2. Add `polls_close_time` to `ElectionDefinition` input handling

`POST /elections` accepts a body that omits `type`, `election_id`, `platform_pub_key`, `sig`. After `week1-core.md` adds `polls_close_time` to `ElectionDefinition`, include it in the accepted input:

```typescript
const input = JSON.parse(body) as Omit<ElectionDefinition, 'type' | 'election_id' | 'platform_pub_key' | 'sig'>;
// input.polls_close_time is now expected — pass through to unsigned packet
const unsigned: Omit<ElectionDefinition, 'sig'> = {
  ...
  polls_close_time: input.polls_close_time,
  ...
};
```

Update `db.ts` if it stores `ElectionDefinition` fields — add `polls_close_time` to the SQLite schema and insert/select.

### 3. Subscribe relay to all Week 1 topics

The relay currently only subscribes to `ELECTION` and `INTENT`. Add `WITNESS` and `HEARTBEAT` subscriptions so the relay can relay these packets to connected clients:

```typescript
pubsub.subscribe(TOPICS.ELECTION);
pubsub.subscribe(TOPICS.INTENT);
pubsub.subscribe(TOPICS.WITNESS);    // add
pubsub.subscribe(TOPICS.HEARTBEAT);  // add
```

No need to persist witness or heartbeat packets in SQLite for Week 1 — just relay them. Add a log line for each received message type.

### 4. Verify the info endpoint response

`GET http://localhost:9876/` must return:
```json
{
  "peerId": "12D3Koo...",
  "wsAddr": "/ip4/0.0.0.0/tcp/9090/ws/p2p/12D3Koo...",
  "addrs": ["/ip4/...", ...],
  "platform_pub_key": "..."
}
```

This is the response that `apps/mobile/src/services/libp2p.ts` and `apps/web/lib/relay-node.ts` fetch on startup.

---

## Public relay requirement (for physical device testing)

The mobile app cannot connect to `localhost:9090` from a physical Android device. The relay must be publicly reachable.

**Option A — local dev with tunnel (simplest for Week 1):**
Use `cloudflared tunnel` or `ngrok` to expose `:9090` and `:9876` publicly. Set the tunnel URL as `RELAY_WS_URL` in the mobile app's env.

**Option B — deploy to 1984 Hosting / Mullvad (per spec):**
The production path. `spec-operations.md §3.1` requires Iceland or Mullvad hosting, anonymous registration, Monero payment.

For Week 1 testing, Option A is acceptable. Option B should be in place before Kenya seeding begins.

Document the public relay URL in a local `.env` file (not committed):
```
RELAY_WS_ADDR=/ip4/<public-ip>/tcp/9090/ws/p2p/<peerId>
RELAY_INFO_URL=http://<public-ip>:9876
```

---

## Acceptance criteria

- [ ] `pnpm --filter @peerpulse/node dev` starts without TypeScript errors
- [ ] `curl http://localhost:9876/` returns `{ peerId, wsAddr, addrs, platform_pub_key }` with correct fields
- [ ] `curl http://localhost:9876/elections` returns `[]` (empty on first run)
- [ ] Relay logs show it is subscribed to `ELECTION`, `INTENT`, `WITNESS`, `HEARTBEAT` topics
- [ ] `polls_close_time` is accepted in `POST /elections` body and persisted
- [ ] No reference to `TOPICS.CHECKIN` anywhere in `apps/node/`
- [ ] `pnpm typecheck` passes for `apps/node`
- [ ] Relay is reachable from a physical Android device (via tunnel or public deployment) — required for Build Gate 0
