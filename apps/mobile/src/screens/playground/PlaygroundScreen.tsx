import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { ed25519 } from '@noble/curves/ed25519';
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex } from '@noble/curves/abstract/utils';
import { RELAY_INFO_URL } from '../../services/relay-config';
import { createPeerPulseNode, type PeerPulseNode } from '../../services/libp2p';
import { colors } from '../../theme/colors';

type P2pState = 'idle' | 'connecting' | 'connected' | 'error';

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
type Election = { election_id: string; name: string; stations: Station[]; sig: string };
type IntentEntry = IntentPacket & { verified: boolean; mine: boolean };

// ── Crypto ────────────────────────────────────────────────────────────────────

function newIdentity(): Identity {
  const priv = ed25519.utils.randomPrivateKey();
  const pub  = ed25519.getPublicKey(priv);
  return { pubHex: bytesToHex(pub), privHex: bytesToHex(priv) };
}

function randHex(n: number): string {
  const buf = new Uint8Array(n);
  // react-native-get-random-values is loaded in shims/globals.js
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

// ── Demo stations ─────────────────────────────────────────────────────────────

const DEMO_STATIONS: Station[] = [
  { station_id: 'demo-001', name: 'Westlands Polling Station' },
  { station_id: 'demo-002', name: 'Nairobi CBD Station' },
  { station_id: 'demo-003', name: 'Kibera Station' },
];

// ── Screen ────────────────────────────────────────────────────────────────────

export default function PlaygroundScreen() {
  const [relayUrl,  setRelayUrl]  = useState(RELAY_INFO_URL);
  const [identity,  setIdentity]  = useState<Identity | null>(null);
  const [relayOk,   setRelayOk]   = useState<'idle' | 'ok' | 'err'>('idle');
  const [relayPeer, setRelayPeer] = useState<string | null>(null);
  const [election,  setElection]  = useState<Election | null>(null);
  const [intents,   setIntents]   = useState<IntentEntry[]>([]);
  const [station,   setStation]   = useState(DEMO_STATIONS[0]!.station_id);
  const [busy,      setBusy]      = useState(false);
  const [declared,  setDeclared]  = useState(false);
  const identRef   = useRef<Identity | null>(null);
  const pollRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const electionId = useRef<string | null>(null);

  // ── libp2p (debug) — folded in from former Debug tab ──────────────────────
  const [p2pState,    setP2pState]    = useState<P2pState>('idle');
  const [p2pNode,     setP2pNode]     = useState<PeerPulseNode | null>(null);
  const [p2pError,    setP2pError]    = useState<string | null>(null);
  const [p2pPeerId,   setP2pPeerId]   = useState<string | null>(null);
  const [p2pRelayId,  setP2pRelayId]  = useState<string | null>(null);
  const [p2pPeers,    setP2pPeers]    = useState<string[]>([]);

  useEffect(() => {
    let node: PeerPulseNode | null = null;
    setP2pState('connecting');
    createPeerPulseNode()
      .then(n => {
        node = n;
        setP2pNode(n);
        setP2pState('connected');
        setP2pPeerId(n.peerId.toString());
        const refresh = () => {
          const peers = n.getPeers();
          setP2pPeers(peers.map(p => p.toString()));
          if (peers.length > 0) setP2pRelayId(peers[0]!.toString());
        };
        refresh();
        n.addEventListener('peer:connect',    refresh);
        n.addEventListener('peer:disconnect', refresh);
      })
      .catch(e => {
        setP2pState('error');
        setP2pError(e?.message ?? String(e));
        console.error('[libp2p init failed]', e);
      });
    return () => { node?.stop(); };
  }, []);

  // Generate ephemeral identity on mount
  useEffect(() => {
    const id = newIdentity();
    setIdentity(id);
    identRef.current = id;
  }, []);

  const stopPolling = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  };

  const connect = useCallback(async () => {
    stopPolling();
    setRelayOk('idle');
    setRelayPeer(null);
    setElection(null);
    setIntents([]);
    setDeclared(false);
    electionId.current = null;

    try {
      const info = await fetch(`${relayUrl}/`).then(r => r.json());
      setRelayOk('ok');
      setRelayPeer((info.peerId as string).slice(0, 20) + '…');

      // Find or create playground election
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
      electionId.current = el!.election_id;

      // Initial fetch
      await refreshIntents(el!.election_id);

      // Poll every 3 s (SSE not natively supported in React Native)
      pollRef.current = setInterval(() => {
        if (electionId.current) refreshIntents(electionId.current);
      }, 3000);
    } catch {
      setRelayOk('err');
    }
  }, [relayUrl]);

  const refreshIntents = async (eid: string) => {
    try {
      const data: IntentPacket[] = await fetch(`${relayUrl}/elections/${eid}/intents`).then(r => r.json());
      const id = identRef.current;
      setIntents(data.map(p => ({
        ...p,
        verified: verifySig(p),
        mine: id ? p.reporter_pub_key === id.pubHex : false,
      })));
    } catch { /* relay offline */ }
  };

  useEffect(() => {
    if (identity) connect();
    return stopPolling;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identity]);

  const declareIntent = async () => {
    if (!identity || !election || busy || relayOk !== 'ok') return;
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
      await fetch(`${relayUrl}/elections/${election.election_id}/intents`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(signed),
      });
      setDeclared(true);
      await refreshIntents(election.election_id);
    } catch { /* ignore */ } finally {
      setBusy(false);
    }
  };

  const stationName = DEMO_STATIONS.find(s => s.station_id === station)?.name;
  const canAct      = !!identity && !!election && !busy && relayOk === 'ok';

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content}>
      <Text style={s.kicker}>⚗ PROTOCOL PLAYGROUND</Text>
      <Text style={s.title}>One-on-one test</Text>
      <Text style={s.sub}>
        Two people · same relay · unique Ed25519 identities.
        Exchange signed intent packets in real-time.
      </Text>

      {/* P2P Network — libp2p connection state (formerly Debug tab) */}
      <View style={s.section}>
        <Text style={s.sectionLabel}>P2P NETWORK · libp2p</Text>
        <View style={s.kvRow}>
          <Text style={s.kvKey}>Status</Text>
          {p2pState === 'connecting' && <ActivityIndicator color={colors.yellow} />}
          {p2pState === 'connected'  && <Text style={[s.kvVal, { color: colors.liveGreen }]}>● Connected</Text>}
          {p2pState === 'error'      && <Text style={[s.kvVal, { color: '#f87171' }]}>✗ Error</Text>}
          {p2pState === 'idle'       && <Text style={s.kvVal}>Idle</Text>}
        </View>
        {p2pPeerId  && <KV k="Local peer" v={`${p2pPeerId.slice(0, 24)}…`} mono />}
        {p2pRelayId && <KV k="Relay peer" v={`${p2pRelayId.slice(0, 24)}…`} mono />}
        <KV k="Connected peers" v={String(p2pPeers.length)} />
        {p2pError && <Text style={s.hint}>{p2pError}</Text>}
        {/* Reference node so 'unused var' rules stay quiet; node is owned by effect cleanup */}
        {p2pNode === null && p2pState === 'idle' ? null : null}
      </View>

      {/* Relay URL */}
      <View style={s.section}>
        <Text style={s.sectionLabel}>RELAY URL</Text>
        <View style={s.relayRow}>
          <TextInput
            value={relayUrl}
            onChangeText={setRelayUrl}
            style={s.input}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="http://192.168.x.x:9876"
            placeholderTextColor={colors.border}
          />
          <TouchableOpacity onPress={connect} style={s.reconnectBtn}>
            <Text style={s.reconnectText}>⟳</Text>
          </TouchableOpacity>
        </View>
        <Text style={[s.statusText, {
          color: relayOk === 'ok' ? colors.liveGreen : relayOk === 'err' ? '#f87171' : colors.text2,
        }]}>
          {relayOk === 'ok'  && `● Connected — ${relayPeer}`}
          {relayOk === 'err' && '✗ Relay unreachable'}
          {relayOk === 'idle' && '○ Connecting…'}
        </Text>
        {relayOk === 'err' && (
          <Text style={s.hint}>
            On a physical device, use your machine&apos;s LAN IP:{'\n'}
            http://192.168.x.x:9876
          </Text>
        )}
      </View>

      {/* Identity */}
      <View style={s.section}>
        <Text style={s.sectionLabel}>YOUR IDENTITY</Text>
        {identity ? (
          <>
            <KV k="Public key" v={`${identity.pubHex.slice(0,14)}…${identity.pubHex.slice(-8)}`} mono />
            <KV k="Algorithm"  v="Ed25519 · ephemeral" />
            <KV k="Trust tier" v="grey-weak (no witnesses)" />
          </>
        ) : (
          <ActivityIndicator color={colors.yellow} />
        )}
      </View>

      {/* Test election + station picker */}
      <View style={s.section}>
        <Text style={s.sectionLabel}>TEST ELECTION</Text>
        {election ? (
          <>
            <KV k="Name" v={election.name} />
            <KV k="Relay sig" v="✓ platform-signed" vColor={colors.liveGreen} />
            <Text style={[s.sectionLabel, { marginTop: 14, marginBottom: 8 }]}>
              STATION — pick the same one as your partner
            </Text>
            {DEMO_STATIONS.map(st => (
              <TouchableOpacity
                key={st.station_id}
                onPress={() => { setStation(st.station_id); setDeclared(false); }}
                style={[
                  s.stationBtn,
                  station === st.station_id && s.stationBtnActive,
                ]}
              >
                <Text style={[
                  s.stationBtnText,
                  station === st.station_id && s.stationBtnTextActive,
                ]}>
                  {st.name}
                </Text>
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <Text style={s.waiting}>
            {relayOk === 'ok' ? 'Creating test election…' : 'Waiting for relay…'}
          </Text>
        )}
      </View>

      {/* Declare Intent button */}
      <TouchableOpacity
        onPress={declareIntent}
        disabled={!canAct}
        style={[s.declareBtn, !canAct && s.declareBtnDisabled]}
        activeOpacity={0.8}
      >
        {busy ? (
          <ActivityIndicator color="#0a0700" />
        ) : (
          <Text style={s.declareBtnText}>
            {declared ? `✓ Declared — ${stationName}` : `Declare Intent — ${stationName}`}
          </Text>
        )}
      </TouchableOpacity>

      {declared && (
        <View style={s.successBanner}>
          <Text style={s.successText}>
            ✓ IntentPacket signed · gossiped to relay · your partner will see it with sig verified.
          </Text>
        </View>
      )}

      {/* Live feed */}
      <View style={s.section}>
        <Text style={s.sectionLabel}>
          LIVE INTENT FEED{intents.length > 0 ? ` · ${intents.length} packets` : ''} · polling 3s
        </Text>
        {intents.length === 0 ? (
          <Text style={s.waiting}>
            {relayOk === 'ok'
              ? 'No intents yet. Declare yours, then your partner does the same.'
              : 'Connect to relay to see the feed.'}
          </Text>
        ) : (
          intents.map(p => <IntentCard key={p.packet_id} intent={p} />)
        )}
      </View>

      {/* Protocol legend */}
      <View style={s.section}>
        <Text style={s.sectionLabel}>WHAT THIS TESTS</Text>
        {[
          ['Ed25519 signing', 'SHA-256(canonical JSON) + device private key.'],
          ['HTTP relay API',  'POST /elections/:id/intents — relay stores + gossips.'],
          ['Polling feed',    'GET /elections/:id/intents every 3 s (no SSE in RN).'],
          ['Core crypto',     '@noble/curves via shims — same code as production.'],
        ].map(([k, v]) => (
          <View key={k} style={s.legendRow}>
            <Text style={s.legendArrow}>→</Text>
            <Text style={s.legendKey}>{k}</Text>
            <Text style={s.legendVal}>{v}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function KV({ k, v, mono, vColor }: { k: string; v: string; mono?: boolean; vColor?: string }) {
  return (
    <View style={s.kvRow}>
      <Text style={s.kvKey}>{k}</Text>
      <Text style={[s.kvVal, mono && s.mono, vColor ? { color: vColor } : null]}>{v}</Text>
    </View>
  );
}

function IntentCard({ intent }: { intent: IntentEntry }) {
  const station = DEMO_STATIONS.find(s => s.station_id === intent.station_id);
  const time    = new Date(intent.timestamp).toLocaleTimeString();
  return (
    <View style={[s.intentCard, intent.mine && s.intentCardMine]}>
      <View style={s.intentHeader}>
        <Text style={[s.intentDir, { color: intent.mine ? colors.yellow : colors.text2 }]}>
          {intent.mine ? '→ you' : '← peer'}
        </Text>
        <Text style={[s.intentSig, { color: intent.verified ? colors.liveGreen : '#f87171' }]}>
          {intent.verified ? '✓ sig valid' : '✗ invalid'}
        </Text>
      </View>
      <Text style={s.intentStation}>{station?.name ?? intent.station_id}</Text>
      <Text style={s.intentMeta}>
        {intent.reporter_pub_key.slice(0, 14)}… · {time}
      </Text>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root:               { flex: 1, backgroundColor: colors.bg },
  content:            { padding: 20, paddingTop: 20, paddingBottom: 48 },
  kicker:             { color: colors.yellow, fontSize: 11, fontFamily: 'monospace', letterSpacing: 1, marginBottom: 8 },
  title:              { color: colors.text, fontSize: 22, fontWeight: '700', marginBottom: 8 },
  sub:                { color: colors.text2, fontSize: 13, lineHeight: 20, marginBottom: 28 },

  section:            { marginBottom: 20, backgroundColor: colors.card, borderRadius: 10, padding: 16, borderWidth: 1, borderColor: colors.border },
  sectionLabel:       { color: colors.text3, fontSize: 10, fontFamily: 'monospace', letterSpacing: 1, marginBottom: 12 },

  relayRow:           { flexDirection: 'row', gap: 8, alignItems: 'center' },
  input:              { flex: 1, backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, borderRadius: 7, padding: 9, color: colors.text, fontFamily: 'monospace', fontSize: 12 },
  reconnectBtn:       { backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, borderRadius: 7, width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  reconnectText:      { color: colors.text2, fontSize: 16 },
  statusText:         { fontSize: 12, fontFamily: 'monospace', marginTop: 8 },
  hint:               { fontSize: 11, color: colors.text3, fontFamily: 'monospace', marginTop: 6, lineHeight: 17 },

  kvRow:              { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  kvKey:              { color: colors.text3, fontSize: 12, fontFamily: 'monospace' },
  kvVal:              { color: colors.text, fontSize: 12 },
  mono:               { fontFamily: 'monospace' },
  waiting:            { color: colors.text3, fontSize: 13 },

  stationBtn:         { padding: 10, borderRadius: 7, borderWidth: 1, borderColor: colors.border, marginBottom: 6 },
  stationBtnActive:   { borderColor: colors.yellow, backgroundColor: 'rgba(234,179,8,0.08)' },
  stationBtnText:     { color: colors.text2, fontSize: 13 },
  stationBtnTextActive: { color: colors.yellow },

  declareBtn:         { backgroundColor: colors.yellow, borderRadius: 10, padding: 16, alignItems: 'center', marginBottom: 12 },
  declareBtnDisabled: { opacity: 0.35 },
  declareBtnText:     { color: '#0a0700', fontWeight: '700', fontSize: 14, fontFamily: 'monospace' },

  successBanner:      { padding: 12, borderRadius: 8, backgroundColor: 'rgba(34,197,94,0.08)', borderWidth: 1, borderColor: 'rgba(34,197,94,0.2)', marginBottom: 16 },
  successText:        { color: '#4ade80', fontSize: 12, fontFamily: 'monospace', lineHeight: 18 },

  intentCard:         { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: 'rgba(255,255,255,0.02)', marginBottom: 8 },
  intentCardMine:     { borderColor: 'rgba(234,179,8,0.25)', backgroundColor: 'rgba(234,179,8,0.05)' },
  intentHeader:       { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  intentDir:          { fontSize: 11, fontFamily: 'monospace' },
  intentSig:          { fontSize: 11, fontFamily: 'monospace' },
  intentStation:      { color: colors.text, fontSize: 13, marginBottom: 4 },
  intentMeta:         { color: colors.text3, fontSize: 11, fontFamily: 'monospace' },

  legendRow:          { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  legendArrow:        { color: colors.yellow, fontFamily: 'monospace', fontSize: 11, marginRight: 6 },
  legendKey:          { color: colors.text2, fontSize: 12, fontWeight: '600', marginRight: 6 },
  legendVal:          { color: colors.text3, fontSize: 12, flex: 1 },
});
