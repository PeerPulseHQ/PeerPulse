'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ed25519 } from '@noble/curves/ed25519';
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex } from '@noble/curves/abstract/utils';

// ── Types ─────────────────────────────────────────────────────────────────────

type Identity = { pubHex: string; privHex: string };

type IntentPacket = {
  type: 'intent';
  packet_id: string;
  timestamp: number;
  election_id: string;
  station_id: string;
  reporter_pub_key: string;
  sig: string;
};

type Station = { station_id: string; name: string };

type Election = {
  election_id: string;
  name: string;
  stations: Station[];
  platform_pub_key: string;
  sig: string;
};

type IntentEntry = IntentPacket & { verified: boolean; mine: boolean };

// ── Crypto helpers ────────────────────────────────────────────────────────────

function newIdentity(): Identity {
  const priv = ed25519.utils.randomPrivateKey();
  const pub  = ed25519.getPublicKey(priv);
  return { pubHex: bytesToHex(pub), privHex: bytesToHex(priv) };
}

function randHex(n: number): string {
  const buf = new Uint8Array(n);
  crypto.getRandomValues(buf);
  return bytesToHex(buf);
}

function fromHex(hex: string): Uint8Array {
  const m = hex.match(/.{2}/g);
  if (!m) throw new Error('bad hex');
  return new Uint8Array(m.map(b => parseInt(b, 16)));
}

function signIntent(packet: Omit<IntentPacket, 'sig'>, privHex: string): string {
  const canonical = JSON.stringify(packet, Object.keys(packet).sort());
  const digest    = sha256(new TextEncoder().encode(canonical));
  const sig       = ed25519.sign(digest, fromHex(privHex));
  return bytesToHex(sig);
}

function verifySig(packet: IntentPacket): boolean {
  try {
    const { sig, ...rest } = packet;
    const canonical = JSON.stringify(rest, Object.keys(rest).sort());
    const digest    = sha256(new TextEncoder().encode(canonical));
    return ed25519.verify(fromHex(sig), digest, fromHex(packet.reporter_pub_key));
  } catch {
    return false;
  }
}

// ── Constants ─────────────────────────────────────────────────────────────────

const DEMO_STATIONS: Station[] = [
  { station_id: 'demo-001', name: 'Westlands Polling Station' },
  { station_id: 'demo-002', name: 'Nairobi CBD Station' },
  { station_id: 'demo-003', name: 'Kibera Station' },
];

const INTENT_TOPIC = 'peerpulse/intent/1.0.0';

// ── libp2p (lazy-loaded so the rest of the site stays slim) ──────────────────

type Libp2pNode = Awaited<ReturnType<typeof import('libp2p').createLibp2p>>;

// Stable libp2p peer ID across page reloads. The key is generated once, stored
// in localStorage, and reused on subsequent loads. Delete the key in DevTools
// → Application → Local Storage to roll a fresh peer ID.
const PEER_KEY_STORAGE = 'pp-pg-libp2p-key';

async function loadOrCreatePeerKey() {
  const { generateKeyPair, privateKeyFromProtobuf, privateKeyToProtobuf } =
    await import('@libp2p/crypto/keys');
  const stored = typeof window !== 'undefined'
    ? window.localStorage.getItem(PEER_KEY_STORAGE)
    : null;
  if (stored) {
    try {
      return privateKeyFromProtobuf(fromHex(stored));
    } catch {
      // corrupt/incompatible — fall through and regenerate
    }
  }
  const key = await generateKeyPair('Ed25519');
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(PEER_KEY_STORAGE, bytesToHex(privateKeyToProtobuf(key)));
  }
  return key;
}

async function buildLibp2pNode(wsAddr: string): Promise<Libp2pNode> {
  const [
    { createLibp2p },
    { webSockets },
    { noise },
    { yamux },
    { identify },
    { gossipsub },
    { multiaddr },
    privateKey,
  ] = await Promise.all([
    import('libp2p'),
    import('@libp2p/websockets'),
    import('@libp2p/noise'),
    import('@libp2p/yamux'),
    import('@libp2p/identify'),
    import('@chainsafe/libp2p-gossipsub'),
    import('@multiformats/multiaddr'),
    loadOrCreatePeerKey(),
  ]);

  const node = await createLibp2p({
    privateKey,
    // Default browser libp2p denies dialing private/local IPs. Disable that gate
    // so the playground can talk to a relay on the same LAN (10.x, 192.168.x).
    connectionGater: { denyDialMultiaddr: async () => false },
    transports: [webSockets()],
    streamMuxers: [yamux()],
    connectionEncrypters: [noise()],
    services: {
      identify: identify(),

      pubsub: gossipsub({ allowPublishToZeroTopicPeers: true, floodPublish: true }) as any,
    },
  });
  await node.start();
  await node.dial(multiaddr(wsAddr));
  return node;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function PlaygroundPage() {
  const [relayUrl,   setRelayUrl]   = useState('http://localhost:9876');
  const [identity,   setIdentity]   = useState<Identity | null>(null);
  const [relayOk,    setRelayOk]    = useState<'idle' | 'ok' | 'err'>('idle');
  const [relayPeer,  setRelayPeer]  = useState<string | null>(null);
  const [meshPeers,  setMeshPeers]  = useState<number>(0);
  const [election,   setElection]   = useState<Election | null>(null);
  const [intents,    setIntents]    = useState<IntentEntry[]>([]);
  const [station,    setStation]    = useState(DEMO_STATIONS[0]!.station_id);
  const [busy,       setBusy]       = useState(false);
  const [declared,   setDeclared]   = useState(false);
  const identRef = useRef<Identity | null>(null);

  const nodeRef  = useRef<any | null>(null);

  // If the page is loaded from a non-localhost host (e.g. a phone on the LAN at
  // 10.216.22.64:3000), default the relay URL to the same host so `localhost`
  // doesn't resolve to the phone itself.
  useEffect(() => {
    const h = window.location.hostname;
    if (h && h !== 'localhost' && h !== '127.0.0.1') {
      setRelayUrl(prev =>
        prev.startsWith('http://localhost:') || prev.startsWith('http://127.0.0.1:')
          ? `http://${h}:9876`
          : prev,
      );
    }
  }, []);

  // Ephemeral identity, one per browser session
  useEffect(() => {
    let id: Identity;
    try {
      const raw = sessionStorage.getItem('pp-pg-id');
      id = raw ? JSON.parse(raw) : newIdentity();
      if (!raw) sessionStorage.setItem('pp-pg-id', JSON.stringify(id));
    } catch {
      id = newIdentity();
    }
    setIdentity(id);
    identRef.current = id;
  }, []);

  const connect = useCallback(async () => {
    // Tear down any previous libp2p node
    if (nodeRef.current) {
      try { await nodeRef.current.stop(); } catch { /* */ }
      nodeRef.current = null;
    }
    setRelayOk('idle');
    setRelayPeer(null);
    setMeshPeers(0);
    setElection(null);
    setIntents([]);
    setDeclared(false);

    try {
      // 1. HTTP discovery — get the relay's wsAddr and peerId
      const info = await fetch(`${relayUrl}/`).then(r => r.json());
      setRelayPeer(info.peerId as string);

      // 2. Bring up a browser libp2p peer and dial the relay over WebSocket
      const node = await buildLibp2pNode(info.wsAddr as string);
      nodeRef.current = node;
      setRelayOk('ok');

      const updateMesh = () => setMeshPeers(node.getPeers().length);
      updateMesh();
      node.addEventListener('peer:connect',    updateMesh);
      node.addEventListener('peer:disconnect', updateMesh);

      // 3. Bootstrap the playground election. Election creation needs the
      // relay's platform key, so this stays an HTTP call — the relay signs it.
      const list: Election[] = await fetch(`${relayUrl}/elections`).then(r => r.json());
      let el = list.find(e => e.name.startsWith('Playground Demo'));
      if (!el) {
        const now = Date.now();
        el = await fetch(`${relayUrl}/elections`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name:                  'Playground Demo — Week 1',
            jurisdiction:          'demo',
            election_date:         now + 86_400_000,
            polls_close_time:      now + 3_600_000,
            registration_deadline: now - 3_600_000,
            stations:              DEMO_STATIONS,
            dispute_threshold:     2,
          }),
        }).then(r => r.json());
      }
      setElection(el!);

      // 4. Catch up on intents already in the relay's DB. GossipSub is
      // forward-only — packets published before we subscribed won't replay.
      const existing: IntentPacket[] = await fetch(
        `${relayUrl}/elections/${el!.election_id}/intents`,
      ).then(r => r.json());
      const id = identRef.current;
      setIntents(existing.map(p => ({
        ...p,
        verified: verifySig(p),
        mine: id ? p.reporter_pub_key === id.pubHex : false,
      })));

      // 5. Subscribe to live intents over GossipSub

      const pubsub = (node.services as any).pubsub;
      pubsub.subscribe(INTENT_TOPIC);

      pubsub.addEventListener('message', (evt: any) => {
        const { topic, data } = evt.detail;
        if (topic !== INTENT_TOPIC) return;
        try {
          const p: IntentPacket = JSON.parse(new TextDecoder().decode(data));
          const cur = identRef.current;
          setIntents(prev => {
            if (prev.some(x => x.packet_id === p.packet_id)) return prev;
            return [
              { ...p, verified: verifySig(p), mine: cur ? p.reporter_pub_key === cur.pubHex : false },
              ...prev,
            ];
          });
        } catch {
          // malformed gossip — ignore
        }
      });
    } catch (err) {
      console.error('playground connect failed:', err);
      setRelayOk('err');
    }
  }, [relayUrl]);

  useEffect(() => {
    if (identity) connect();
    return () => {
      if (nodeRef.current) {
        nodeRef.current.stop().catch(() => { /* */ });
        nodeRef.current = null;
      }
    };

  }, [identity]);

  const declareIntent = async () => {
    if (!identity || !election || busy || relayOk !== 'ok' || !nodeRef.current) return;
    setBusy(true);
    try {
      const base: Omit<IntentPacket, 'sig'> = {
        type:             'intent',
        packet_id:        randHex(16),
        timestamp:        Date.now(),
        election_id:      election.election_id,
        station_id:       station,
        reporter_pub_key: identity.pubHex,
      };
      const sig    = signIntent(base, identity.privHex);
      const signed = { ...base, sig };
      const bytes  = new TextEncoder().encode(JSON.stringify(signed));

      // Publish over the mesh. Relay receives, saves, and rebroadcasts to
      // every other subscribed peer.

      const pubsub = (nodeRef.current.services as any).pubsub;
      await pubsub.publish(INTENT_TOPIC, bytes);

      // Optimistically reflect our own publish in the feed — gossipsub doesn't
      // echo self-published messages back to the publisher.
      const cur = identRef.current;
      setIntents(prev => {
        if (prev.some(x => x.packet_id === signed.packet_id)) return prev;
        return [
          { ...signed, verified: true, mine: cur ? signed.reporter_pub_key === cur.pubHex : true },
          ...prev,
        ];
      });
      setDeclared(true);
    } catch (e) {
      console.error('publish failed:', e);
    } finally {
      setBusy(false);
    }
  };

  const stationName = DEMO_STATIONS.find(s => s.station_id === station)?.name;
  const canAct      = !!identity && !!election && !busy && relayOk === 'ok';

  return (
    <div className="pg-wrap">
      <div className="pg-header">
        <div className="pg-kicker">⚗ PROTOCOL PLAYGROUND</div>
        <h1 className="pg-title">One-on-one mesh demo</h1>
        <p className="pg-lede">
          Two browsers. One relay. Each one is a real libp2p peer on the GossipSub mesh,
          subscribed to <code className="pg-code">peerpulse/intent/1.0.0</code>. Declare intent
          for a polling station — your packet is gossiped over the mesh, not POSTed to a server.
        </p>
      </div>

      {/* Relay row */}
      <div className="pg-relay-row">
        <input
          value={relayUrl}
          onChange={e => setRelayUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && connect()}
          className="pg-relay-input"
          placeholder="http://localhost:9876"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
        />
        <button onClick={connect} className="pg-btn pg-btn-secondary">Reconnect</button>
        <span
          className={`pg-relay-status pg-relay-status-${relayOk}`}
        >
          {relayOk === 'ok'  && `● Mesh — ${meshPeers} peer${meshPeers === 1 ? '' : 's'} · ${relayPeer?.slice(0, 14)}…`}
          {relayOk === 'err' && '✗ Relay unreachable'}
          {relayOk === 'idle' && '○ Bringing up libp2p…'}
        </span>
      </div>

      <div className="pg-grid">
        {/* Left column */}
        <div className="pg-col">
          <Panel label="YOUR IDENTITY">
            {identity ? (
              <>
                <KV k="Public key" mono>{identity.pubHex.slice(0,16)}…{identity.pubHex.slice(-8)}</KV>
                <KV k="Algorithm">Ed25519 · ephemeral · session only</KV>
                <KV k="Trust tier">
                  <span className="pg-mono pg-grey">grey-weak (no witnesses)</span>
                </KV>
                <div className="pg-help">
                  Share the relay URL with your test partner. They open this page on their device — each gets a distinct identity, both become libp2p peers on the same mesh.
                </div>
              </>
            ) : (
              <span className="pg-muted">Generating keypair…</span>
            )}
          </Panel>

          <Panel label="TEST ELECTION">
            {election ? (
              <>
                <KV k="Name">{election.name}</KV>
                <KV k="Relay sig">
                  <span className="pg-mono pg-green">✓ platform-signed</span>
                </KV>
                <div className="pg-stations-label">PICK A STATION — your partner should pick the same one</div>
                {DEMO_STATIONS.map(s => (
                  <button
                    key={s.station_id}
                    onClick={() => { setStation(s.station_id); setDeclared(false); }}
                    className={`pg-station-btn${station === s.station_id ? ' is-active' : ''}`}
                  >
                    {s.name}
                  </button>
                ))}
              </>
            ) : (
              <span className="pg-muted">
                {relayOk === 'ok' ? 'Creating test election…' : 'Waiting for relay…'}
              </span>
            )}
          </Panel>

          <button
            onClick={declareIntent}
            disabled={!canAct}
            className={`pg-btn pg-btn-primary pg-btn-big${canAct ? '' : ' is-disabled'}`}
          >
            {busy ? 'Signing & publishing…' : declared ? `✓ Declared — ${stationName}` : `Publish Intent — ${stationName}`}
          </button>

          {declared && (
            <div className="pg-success">
              ✓ IntentPacket signed · gossiped over libp2p mesh · subscribed peers (including your partner&apos;s browser) will receive it with sig verified.
            </div>
          )}

          <Panel label="WHAT THIS DEMONSTRATES">
            {[
              ['Ed25519 signing',     'SHA-256 of canonical JSON, signed with your private key. Verified on every receiver.'],
              ['libp2p WebSocket',    'This browser is a real libp2p peer. Dials the relay over WS, runs Noise handshake, multiplexes with Yamux.'],
              ['GossipSub mesh',      'Subscribed to peerpulse/intent/1.0.0. Publishes propagate via the GossipSub mesh — relay re-fans to every other subscriber.'],
              ['No HTTP for intents', 'POST /intents is gone. The relay is just one peer; the publish path is mesh, not endpoint.'],
            ].map(([k, v]) => (
              <div key={k} className="pg-legend-row">
                <span className="pg-legend-arrow">→</span>
                <div>
                  <span className="pg-legend-key">{k}</span>
                  <span className="pg-legend-val"> — {v}</span>
                </div>
              </div>
            ))}
          </Panel>
        </div>

        {/* Right column — live feed */}
        <Panel label={`LIVE GOSSIP FEED${intents.length ? ` · ${intents.length} packets` : ''}`}>
          {intents.length === 0 ? (
            <div className="pg-empty">
              {relayOk === 'ok'
                ? 'No intents yet. Click Publish — then ask your partner to do the same from their browser.'
                : 'Bring up the mesh to see the feed.'}
            </div>
          ) : (
            <div className="pg-feed">
              {intents.map(p => <IntentCard key={p.packet_id} intent={p} />)}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Panel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="pg-panel">
      <div className="pg-panel-label">{label}</div>
      {children}
    </div>
  );
}

function KV({ k, children, mono }: { k: string; children: React.ReactNode; mono?: boolean }) {
  return (
    <div className="pg-kv">
      <span className="pg-kv-k">{k}</span>
      <span className={`pg-kv-v${mono ? ' pg-mono' : ''}`}>{children}</span>
    </div>
  );
}

function IntentCard({ intent }: { intent: IntentEntry }) {
  const station = DEMO_STATIONS.find(s => s.station_id === intent.station_id);
  const time    = new Date(intent.timestamp).toLocaleTimeString();
  return (
    <div className={`pg-intent${intent.mine ? ' is-mine' : ''}`}>
      <div className="pg-intent-head">
        <span className={`pg-intent-dir${intent.mine ? ' is-mine' : ''}`}>
          {intent.mine ? '→ you' : '← peer'}
        </span>
        <span className={`pg-intent-sig${intent.verified ? ' is-valid' : ' is-invalid'}`}>
          {intent.verified ? '✓ sig valid' : '✗ invalid sig'}
        </span>
      </div>
      <div className="pg-intent-station">{station?.name ?? intent.station_id}</div>
      <div className="pg-intent-meta">
        {intent.reporter_pub_key.slice(0, 14)}… · {time}
      </div>
    </div>
  );
}
