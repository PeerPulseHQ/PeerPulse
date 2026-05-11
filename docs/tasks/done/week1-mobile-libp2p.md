# Task: Mobile libp2p Service + Debug Connection Screen

**Phase:** Week 1
**Depends on:** `week1-mobile-shell.md`, `week1-relay.md`
**Spec refs:** `tabulate/spec-protocol.md §4.1`, `tabulate/spec-protocol.md §18.1 (Build Gate 0)`

---

## Outcome

Physical Android device connects to the Sovereign Relay. A debug screen in the app shows:
- Connection state (Connecting / Connected / Error)
- Relay peer ID once connected
- Local peer ID of the device

**Build Gate 0 ✓** — this is the highest-risk deliverable of Week 1.

---

## What already exists

The Hermes shim stack is fully installed and configured. Do not modify:

- `shims/globals.js` — all 9 patches: `react-native-get-random-values`, `@peculiar/webcrypto`, `Buffer`, `TextEncoder/TextDecoder`, `process`, `setImmediate`, `event-target-shim/auto`, `Promise.withResolvers`, `weakmap-polyfill`
- `babel.config.js` — all `node:*` module aliases
- `metro.config.js` — `unstable_enablePackageExports: true`, all `extraNodeModules` mapped
- All libp2p packages are installed: `libp2p ^3.0.0`, `@libp2p/websockets`, `@libp2p/circuit-relay-v2`, `@libp2p/noise`, `@libp2p/yamux`, `@libp2p/identify`, `@chainsafe/libp2p-gossipsub`

The risk is validation, not construction. The shim infrastructure is in place — this task confirms it works end-to-end on a physical device.

---

## Files to create

```
apps/mobile/src/
  services/
    libp2p.ts         ← libp2p node lifecycle
    relay-config.ts   ← relay address config (reads from env/constants)
  screens/
    debug/
      DebugScreen.tsx  ← connection status UI
```

---

## `src/services/relay-config.ts`

```typescript
// Relay address — set before physical device testing.
// For local dev with tunnel: use the tunnel URL.
// For production: use the deployed relay address.
// Format: /ip4/<ip>/tcp/<port>/ws/p2p/<peerId>
export const RELAY_WS_ADDR = process.env.RELAY_WS_ADDR ?? '';
export const RELAY_INFO_URL = process.env.RELAY_INFO_URL ?? 'http://localhost:9876';
```

`RELAY_WS_ADDR` is the full multiaddr of the relay WS endpoint. Obtain it from `GET <RELAY_INFO_URL>/` → `wsAddr` field.

For physical device testing, this must be a publicly reachable address (not `localhost`). Use a tunnel (cloudflared / ngrok) pointing at the dev machine's `:9090` port, or use the deployed relay.

---

## `src/services/libp2p.ts`

```typescript
import { createLibp2p, type Libp2p } from 'libp2p';
import { webSockets } from '@libp2p/websockets';
import { noise } from '@libp2p/noise';
import { yamux } from '@libp2p/yamux';
import { identify, type Identify } from '@libp2p/identify';
import { circuitRelayTransport } from '@libp2p/circuit-relay-v2';
import { gossipsub } from '@chainsafe/libp2p-gossipsub';
import type { GossipSub } from '@chainsafe/libp2p-gossipsub';
import { multiaddr } from '@multiformats/multiaddr';
import { RELAY_WS_ADDR } from './relay-config';

export type PeerPulseServices = { identify: Identify; pubsub: GossipSub };
export type PeerPulseNode     = Libp2p<PeerPulseServices>;

export async function createPeerPulseNode(): Promise<PeerPulseNode> {
  const node = await createLibp2p<PeerPulseServices>({
    connectionGater: { denyDialMultiaddr: async () => false },
    transports: [webSockets(), circuitRelayTransport()],
    streamMuxers: [yamux()],
    connectionEncrypters: [noise()],
    services: {
      identify: identify(),
      pubsub: gossipsub({
        allowPublishToZeroTopicPeers: true,
        floodPublish: true,
      }) as any,
    },
  });

  await node.start();

  if (RELAY_WS_ADDR) {
    await node.dial(multiaddr(RELAY_WS_ADDR));
  }

  return node;
}
```

This is a direct port of `apps/web/src/lib/node.ts` — same pattern, same libp2p version, adapted for the mobile environment.

---

## `src/screens/debug/DebugScreen.tsx`

```typescript
import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { createPeerPulseNode, type PeerPulseNode } from '../../services/libp2p';
import { colors } from '../../theme/colors';

type State = 'idle' | 'connecting' | 'connected' | 'error';

export default function DebugScreen() {
  const [state, setState]       = useState<State>('idle');
  const [node,  setNode]        = useState<PeerPulseNode | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [peerId, setPeerId]     = useState<string | null>(null);
  const [relayId, setRelayId]   = useState<string | null>(null);
  const [peers, setPeers]       = useState<string[]>([]);

  useEffect(() => {
    setState('connecting');
    createPeerPulseNode()
      .then(n => {
        setNode(n);
        setState('connected');
        setPeerId(n.peerId.toString());

        const updatePeers = () => setPeers(n.getPeers().map(p => p.toString()));
        updatePeers();
        n.addEventListener('peer:connect', updatePeers);
        n.addEventListener('peer:disconnect', updatePeers);

        const connectedPeers = n.getPeers();
        if (connectedPeers.length > 0) setRelayId(connectedPeers[0].toString());
      })
      .catch(e => {
        setState('error');
        setError(String(e));
      });

    return () => { node?.stop(); };
  }, []);

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content}>
      <Text style={s.title}>Debug — libp2p</Text>

      <Row label="Status">
        {state === 'connecting' && <ActivityIndicator color={colors.yellow} />}
        {state === 'connected'  && <Text style={[s.val, { color: colors.liveGreen }]}>● Connected</Text>}
        {state === 'error'      && <Text style={[s.val, { color: '#f87171' }]}>✗ Error</Text>}
        {state === 'idle'       && <Text style={s.val}>Idle</Text>}
      </Row>

      {peerId  && <Row label="Local peer ID"><Text style={s.mono}>{peerId.slice(0, 24)}…</Text></Row>}
      {relayId && <Row label="Relay peer ID"><Text style={s.mono}>{relayId.slice(0, 24)}…</Text></Row>}

      <Row label="Connected peers">
        <Text style={s.val}>{peers.length}</Text>
      </Row>

      {error && <Text style={s.error}>{error}</Text>}
    </ScrollView>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={s.row}>
      <Text style={s.label}>{label}</Text>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: colors.bg },
  content: { padding: 24, paddingTop: 60 },
  title:   { color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 28 },
  row:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
             paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  label:   { color: colors.text2, fontSize: 13 },
  val:     { color: colors.text, fontSize: 13 },
  mono:    { color: colors.yellow, fontSize: 11, fontFamily: 'monospace' },
  error:   { color: '#f87171', fontSize: 12, marginTop: 16, fontFamily: 'monospace' },
});
```

### Wiring the debug screen

Add a fifth tab to `RootNavigator.tsx` for development only:

```typescript
// In RootNavigator.tsx — add after Learn tab
{__DEV__ && (
  <Tab.Screen name="Debug" component={DebugScreen} options={{ tabBarLabel: '⚙' }} />
)}
```

The Debug tab is visible in dev builds only and is excluded from production APKs.

---

## Testing on a physical device

1. Ensure relay is publicly reachable (tunnel or deployed)
2. Set `RELAY_WS_ADDR` to the relay's public WS multiaddr
3. Obtain the dev APK via Docker build (`week1-docker.md`)
4. Sideload APK onto physical Android device (Enable "Install from unknown sources")
5. Start Metro: `pnpm --filter @peerpulse/mobile dev`
6. Open the app → tap the Debug tab → observe connection state
7. Confirm "Connected" state and relay peer ID visible

---

## Acceptance criteria

- [ ] `apps/mobile/src/services/libp2p.ts` exports `createPeerPulseNode()`
- [ ] On emulator: app starts, Debug tab shows "Connecting" then state (error acceptable if no relay reachable from emulator)
- [ ] On physical Android device with public relay: Debug tab shows "● Connected" and relay peer ID
- [ ] Local peer ID displayed matches the device's libp2p peer ID in relay logs
- [ ] No crash on `createPeerPulseNode()` call — shim stack validated
- [ ] Debug tab hidden in production (`__DEV__` guard)
- [ ] **Build Gate 0 ✓** — physical device connected to relay, peer ID visible
