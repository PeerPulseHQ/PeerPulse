# Background Tally Sync

How signed `TallyPacket`s reach the relay after the observer leaves the polling station —
including the offline-first design, the Android OEM problem, and the user-facing flow that
makes it reliable.

This is operations-critical: on election day, polling stations often have no internet (rural
areas, deliberate shutdowns, congested cellular). Observers sign tallies on-device and walk
away with them. The app's job is then to opportunistically share those packets whenever
network becomes available — sometimes hours later, in a bar with open WiFi, on the bus home,
or after they plug in to charge overnight.

## Threat model summary

- The relay is **eventually consistent**. A `TallyPacket` arriving 6 hours late is still
  useful; the public dashboard converges as packets arrive. No close-window rejection.
- The cost of slow sync is dashboard-staleness, not correctness.
- The cost of *never* syncing is observer data lost — must be avoided.

## The mechanism

1. **On submit** (`TestRunScreen.submit()` integration point):
   - Sign the `TallyPacket` with the station session key.
   - Write to `expo-sqlite` with `synced_at = NULL`.
   - If a libp2p connection is currently live, attempt immediate gossip on
     `peerpulse/tally/1.0.0`.

2. **WorkManager job**, registered when the queue becomes non-empty:
   - Constraint: `NetworkType.CONNECTED` (any network — WiFi or cellular, since tallies are
     ~1 KB and cellular is fine).
   - On fire: stand up libp2p, dial relay, publish each unsynced row, capture the relay's
     signed receipt, mark `synced_at`, tear down.
   - Survives app process death. Re-registered on every submit.

3. **ConnectivityManager.NetworkCallback**, registered while the app process is alive.
   - Fires immediately on network change. Belt-and-braces for the case where the app is in
     memory when the observer reaches WiFi.

4. **Periodic backup WorkManager job** — minimum 15 minutes. Catches the case where the
   constraint-triggered job was dropped.

## Where it bites — the OEM problem

On well-behaved Androids (Pixel stock, Nokia stock), the above is sufficient. On the phones
dominant in PeerPulse's target markets — Tecno, Infinix, Itel, Xiaomi, Samsung, Huawei —
the OEM ships an aggressive "battery optimizer" / "device care" layer that:

- Silently drops WorkManager jobs from apps backgrounded for more than a few hours.
- Force-stops apps from outside the OEM's allowlist after extended idle.
- Ignores Google's job-scheduling contracts. (Reference: dontkillmyapp.com.)

These brands dominate Kenya's budget tier (Tecno ~30 %+ market share, Infinix significant,
Itel widespread). Mitigation is **mandatory**, not optional.

## Mitigation, in order of reliability

### 1. Foreground sync on app open (always reliable)

The most dependable path. Whenever the observer launches the app, drain the unsynced queue
first thing. Cannot be killed by OEM behaviour — the user explicitly has the app open.

### 2. Persistent notification while queue non-empty

Show a low-priority notification: `"N signed counts waiting to share"`.

Two benefits:
- **Promotes the process to foreground in Android's view.** While the notification is
  showing, Android won't silently kill the app. WorkManager jobs fire reliably.
- **Eye-level reminder** — observer glances at their phone in the bar, sees the
  notification, taps it, app foregrounds, queue drains immediately.

Battery cost is modest — the notification itself doesn't drain; libp2p only spins up when
there's both work and network.

### 3. Battery-optimization whitelist (first-run requirement)

`Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`. Materially improves background
WorkManager reliability on most OEMs. Must be part of first-run.

User-facing copy (proposed): *"Allow this app to share signed counts in the background. Without this, your work may not reach the network until you next open the app."*

### 4. WorkManager constraint-triggered sync (the default mechanism)

Fires when network constraint becomes satisfied. Works reliably on Pixel-class phones,
intermittently on aggressive OEMs, and well on aggressive OEMs *if* the user has whitelisted
the app per (3) above.

### 5. Foreground service during the count window (election-day only)

For the ~30 minutes after polls close, while the observer is still at the station entering
counts, the app should run a foreground service. This:
- Keeps libp2p alive for immediate gossip.
- Allows continuous BLE scanning for the WitnessBundle (which itself needs a foreground
  service per current Android rules).
- Bulletproof against OEM kill.
- Visible "PeerPulse is observing this station" notification.

This is overkill outside the count window — only activate during election day operations.

## Captive portals

Most open WiFi (bars, cafes, airports) puts the device behind a captive sign-in. Android
reports the network as connected, WorkManager fires the job, libp2p tries to dial, gets
intercepted by the captive portal, fails.

The sync job must:
1. Probe a known endpoint (e.g. `http://relay.peerpulse.app/generate_204`) before attempting
   libp2p dial.
2. If the probe is intercepted, back off — re-schedule via WorkManager with a longer delay.
3. Don't burn through re-tries; the next constraint-triggered fire is probably good.

## First-run flow

The user is asked, in order:

1. **Notifications permission** (Android 13+). Required for the pending-sync notification
   and any later prompts. Required on Android <13 too (implicit).
2. **Battery-optimization whitelist.** Explain why before the system dialog:
   *"PeerPulse shares your signed counts in the background. Some phones aggressively pause
   apps to save battery. This setting allows the app to wake up briefly when it has work
   to do — never continuously."*
3. **BLE permissions** (`BLUETOOTH_SCAN`, `BLUETOOTH_ADVERTISE`, `BLUETOOTH_CONNECT`) — only
   needed before the first witness-gathering session, not at install time.

All three should be shown once during onboarding, before election day — not on election day
when stakes are high and the observer is busy.

## Observer training implications

The technical safeguards above carry over 95 % of cases. The remaining 5 %:

- *"My phone was force-stopped at some point during the day."*
- *"My OEM ignored battery whitelist."*
- *"My battery died before reaching WiFi."*

For these, observers should be trained: **At the end of election day, open the PeerPulse
app for 10 seconds.** The foreground drain catches anything that slipped through. This is
the single most reliable backstop and costs nothing to operate.

## Edge cases to handle in the wiring task

- Captive portals (above).
- Cellular operator port-blocking. Probe before assuming the relay is reachable.
- libp2p cold-start cost (~3-10s on budget phones). Background job needs > 30s allowed
  execution; WorkManager defaults to 10 minutes, plenty.
- Tally packet idempotency — a re-tried packet must not double-count on the relay.
- Receipt persistence — store the relay's signed receipt so the observer can later prove
  their tally was accepted.
- Clock skew — sign with monotonic local time, not wall-clock, so post-facto clock
  corrections don't invalidate the witness bundle.

## What this means for the mockup

The Test Run screen's "COUNT SIGNED" card is honest: the count is signed and saved
locally. The follow-up nudge — *"Allow this app to run in the background so saved counts
can sync when network returns"* — surfaces the battery-optimization whitelist requirement
at the right moment, immediately after the user understands what's queued.

Real wiring of background sync lives in Gate 3 (Week 9) per the project roadmap. The
mockup nudge is a placeholder for that flow; when wired, tapping it invokes
`Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`.
