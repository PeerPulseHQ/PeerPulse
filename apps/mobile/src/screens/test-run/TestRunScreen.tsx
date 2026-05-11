import { useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, Linking, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../../theme/colors';
import type { RootStackParamList } from '../../types/navigation';
import {
  DEFAULT_CANDIDATES,
  INITIAL_PEERS,
  MAX_PEERS,
  PEER_DISCOVERY_MS,
  SIM_SIGN_MS,
  STATION,
  type Candidate,
  type Peer,
} from './mockData';
import TechnicalDetails from './components/TechnicalDetails';

type Phase = 'editing' | 'signing' | 'submitted';

type CandidateEntry = Candidate & { count: string };

function seedPeers(n: number): Peer[] {
  const now = Date.now();
  return Array.from({ length: n }, (_, i) => ({
    id: `p-${i}`,
    label: `Phone #${i + 1}`,
    // Stagger initial peers across the last ~30s so the screen feels live on first paint.
    discoveredAt: now - (n - i) * 6000,
  }));
}

export default function TestRunScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [candidates, setCandidates] = useState<CandidateEntry[]>(
    DEFAULT_CANDIDATES.map(c => ({ ...c, count: '' })),
  );
  const [phase, setPhase] = useState<Phase>('editing');
  const [peers, setPeers] = useState<Peer[]>(() => seedPeers(INITIAL_PEERS));
  const [, forceTick]     = useState(0);
  const peerCursor        = useRef(INITIAL_PEERS);

  const totalVotes = useMemo(
    () => candidates.reduce((sum, c) => sum + (Number.parseInt(c.count, 10) || 0), 0),
    [candidates],
  );

  const hasAnyEntry = useMemo(
    () => candidates.some(c => Number.parseInt(c.count, 10) > 0),
    [candidates],
  );

  // ── Continuous peer discovery: peers keep arriving regardless of phase ──────
  useEffect(() => {
    // INTEGRATION POINT: replace with react-native-ble-plx BleManager.startDeviceScan()
    const id = setInterval(() => {
      setPeers(prev => {
        if (peerCursor.current >= MAX_PEERS) return prev;
        const next: Peer = {
          id: `p-${peerCursor.current}`,
          label: `Phone #${peerCursor.current + 1}`,
          discoveredAt: Date.now(),
        };
        peerCursor.current += 1;
        return [...prev, next];
      });
    }, PEER_DISCOVERY_MS);
    return () => clearInterval(id);
  }, []);

  // ── Re-render every 1s so "Xs ago" labels stay fresh ───────────────────────
  useEffect(() => {
    const id = setInterval(() => forceTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  function updateCount(id: string, raw: string) {
    const cleaned = raw.replace(/[^\d]/g, '').slice(0, 6);
    setCandidates(prev => prev.map(c => (c.id === id ? { ...c, count: cleaned } : c)));
  }

  function addCandidate() {
    const n = candidates.length + 1;
    setCandidates(prev => [
      ...prev,
      { id: `c-extra-${Date.now()}`, name: `Candidate ${n}`, party: '—', count: '' },
    ]);
  }

  function removeCandidate(id: string) {
    setCandidates(prev => prev.filter(c => c.id !== id));
  }

  function submit() {
    if (!hasAnyEntry || phase !== 'editing') return;
    setPhase('signing');
    // INTEGRATION POINT: Ed25519 sign of TallyPacket{ counts, station_session_key,
    // witness_bundle } and persist locally. Network share is opportunistic — handled
    // later by a background sync when the relay becomes reachable.
    setTimeout(() => setPhase('submitted'), SIM_SIGN_MS);
  }

  function reset() {
    setCandidates(DEFAULT_CANDIDATES.map(c => ({ ...c, count: '' })));
    setPhase('editing');
    peerCursor.current = INITIAL_PEERS;
    setPeers(seedPeers(INITIAL_PEERS));
  }

  const locked = phase !== 'editing';

  return (
    <ScrollView
      style={s.root}
      contentContainerStyle={s.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <StationCard />

      <View style={s.section}>
        <View style={s.sectionHeader}>
          <Text style={s.sectionLabel}>COUNTS POSTED AT STATION</Text>
          <Text style={s.sectionHint}>Enter the numbers as they appear on the wall.</Text>
        </View>

        {candidates.map(c => (
          <CandidateRow
            key={c.id}
            candidate={c}
            locked={locked}
            onChange={value => updateCount(c.id, value)}
            onRemove={candidates.length > 2 ? () => removeCandidate(c.id) : undefined}
          />
        ))}

        {!locked && (
          <Pressable
            onPress={addCandidate}
            style={({ pressed }) => [s.addBtn, pressed && s.pressed]}
          >
            <Ionicons name="add-circle-outline" size={16} color={colors.text2} />
            <Text style={s.addBtnText}>Add candidate</Text>
          </Pressable>
        )}

        <View style={s.totalRow}>
          <Text style={s.totalLabel}>TOTAL</Text>
          <Text style={s.totalValue}>{totalVotes.toLocaleString()}</Text>
        </View>
      </View>

      {phase === 'editing' && (
        <Pressable
          onPress={submit}
          disabled={!hasAnyEntry}
          style={({ pressed }) => [
            s.submitBtn,
            !hasAnyEntry && s.submitBtnDisabled,
            pressed && s.submitBtnPressed,
          ]}
        >
          <Ionicons name="lock-closed" size={16} color="#0a0700" />
          <Text style={s.submitText}>Sign &amp; save the count</Text>
        </Pressable>
      )}

      {phase === 'signing' && (
        <View style={s.signingCard}>
          <ActivityIndicator color={colors.yellow} />
          <Text style={s.signingText}>Signing your count…</Text>
        </View>
      )}

      {phase === 'submitted' && <SignedCard />}
      {phase === 'submitted' && <BackgroundNudge />}

      <PeersSection peers={peers} phase={phase} />

      {phase === 'submitted' && (
        <Pressable
          onPress={reset}
          style={({ pressed }) => [s.resetBtn, pressed && s.pressed]}
        >
          <Text style={s.resetText}>Run another test</Text>
        </Pressable>
      )}

      <TechnicalDetails>
        <Text style={s.devText}>
          On submit, the device signs <Text style={s.code}>TallyPacket {'{'} counts, station_session_key, witness_bundle {'}'}</Text> with Ed25519 (
          <Text style={s.code}>@noble/curves</Text>) and persists it locally. The witness bundle
          records peers seen via BLE at signing time — proof the device was physically present.
          Sharing to <Text style={s.code}>peerpulse/tally/1.0.0</Text> is opportunistic and runs
          whenever the relay is reachable; agreement only becomes observable then, and is shown
          on the relay&apos;s view rather than here.
        </Text>
        <Pressable
          onPress={() => navigation.navigate('DeveloperPlayground')}
          style={({ pressed }) => [s.devLink, pressed && s.pressed]}
        >
          <Ionicons name="terminal-outline" size={14} color={colors.yellow} />
          <Text style={s.devLinkText}>Open developer playground</Text>
        </Pressable>
      </TechnicalDetails>
    </ScrollView>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function StationCard() {
  return (
    <View style={s.station}>
      <View style={s.stationTop}>
        <Text style={s.stationFlag}>{STATION.countryFlag}</Text>
        <View style={s.stationCode}><Text style={s.stationCodeText}>{STATION.id}</Text></View>
      </View>
      <Text style={s.stationName}>{STATION.name}</Text>
      <Text style={s.stationLoc}>{STATION.constituency}</Text>
    </View>
  );
}

function CandidateRow({
  candidate,
  locked,
  onChange,
  onRemove,
}: {
  candidate: CandidateEntry;
  locked: boolean;
  onChange: (v: string) => void;
  onRemove: (() => void) | undefined;
}) {
  return (
    <View style={s.candRow}>
      <View style={s.candText}>
        <Text style={s.candName}>{candidate.name}</Text>
        <Text style={s.candParty}>{candidate.party}</Text>
      </View>
      {locked ? (
        <View style={s.candLockedBox}>
          <Text style={s.candLockedValue}>{(Number.parseInt(candidate.count, 10) || 0).toLocaleString()}</Text>
        </View>
      ) : (
        <TextInput
          value={candidate.count}
          onChangeText={onChange}
          placeholder="0"
          placeholderTextColor={colors.text3}
          keyboardType="number-pad"
          maxLength={6}
          style={s.candInput}
          editable={!locked}
        />
      )}
      {!locked && onRemove && (
        <Pressable onPress={onRemove} hitSlop={8} style={({ pressed }) => [s.removeBtn, pressed && s.pressed]}>
          <Ionicons name="close" size={14} color={colors.text3} />
        </Pressable>
      )}
    </View>
  );
}

function SignedCard() {
  return (
    <View style={s.signed}>
      <Ionicons name="checkmark-circle" size={28} color={colors.liveGreen} />
      <View style={s.signedBody}>
        <Text style={s.signedTitle}>COUNT SIGNED</Text>
        <Text style={s.signedSub}>
          Saved on this phone with your station signature. Sharing with the wider network happens
          automatically in the background.
        </Text>
      </View>
    </View>
  );
}

function BackgroundNudge() {
  function openBatterySettings() {
    // INTEGRATION POINT: replace with IntentLauncher.startActivityAsync(
    //   IntentLauncher.ActivityAction.IGNORE_BATTERY_OPTIMIZATION_SETTINGS,
    // ) once the next dev client is rebuilt with the staged `expo-intent-launcher`
    // native module. For now we fall back to app-level settings so the JS bundle stays
    // runnable on the current dev client without a native rebuild.
    Linking.openSettings().catch(() => {});
  }
  return (
    <View style={s.nudge}>
      <View style={s.nudgeIconWrap}>
        <Ionicons name="battery-charging" size={18} color={colors.yellow} />
      </View>
      <View style={s.nudgeBody}>
        <Text style={s.nudgeTitle}>One-time setup</Text>
        <Text style={s.nudgeText}>
          Allow this app to run in the background. Some phones pause apps to save battery —
          that can stop your saved counts from sharing later.
        </Text>
        <Pressable
          onPress={openBatterySettings}
          style={({ pressed }) => [s.nudgeBtn, pressed && s.pressed]}
          accessibilityRole="button"
        >
          <Text style={s.nudgeBtnText}>Open battery settings →</Text>
        </Pressable>
      </View>
    </View>
  );
}

function PeersSection({ peers, phase }: { peers: Peer[]; phase: Phase }) {
  const visible = peers.slice(-8).reverse();
  return (
    <View style={s.section}>
      <View style={s.sectionHeader}>
        <Text style={s.sectionLabel}>
          PHONES NEARBY · {peers.length}
        </Text>
        <Text style={s.sectionHint}>
          {phase === 'submitted'
            ? 'These phones saw you here when the count was signed.'
            : 'These phones are at the same station as you.'}
        </Text>
      </View>
      {visible.map(p => (
        <View key={p.id} style={s.peerRow}>
          <View style={s.peerDot} />
          <Text style={s.peerKey}>{p.label}</Text>
          <Text style={s.peerAgo}>{secondsAgo(p.discoveredAt)}s ago</Text>
        </View>
      ))}
      {peers.length > visible.length && (
        <Text style={s.peerMore}>+ {peers.length - visible.length} more</Text>
      )}
    </View>
  );
}

function secondsAgo(ts: number): number {
  return Math.max(1, Math.floor((Date.now() - ts) / 1000));
}

// ── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 32, gap: 14 },

  // Station card
  station: {
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderHi,
    backgroundColor: colors.card,
  },
  stationTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stationFlag: { fontSize: 26 },
  stationCode: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.yellow,
    backgroundColor: 'rgba(234,179,8,0.06)',
  },
  stationCodeText: {
    color: colors.yellow,
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 1,
  },
  stationName: { color: colors.text, fontSize: 18, fontWeight: '700' },
  stationLoc:  { color: colors.text2, fontSize: 13, marginTop: 2 },

  // Sections
  section: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  sectionHeader: { marginBottom: 10 },
  sectionLabel: {
    color: colors.text2,
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  sectionHint: { color: colors.text3, fontSize: 11, fontFamily: 'monospace', marginTop: 2 },

  // Candidate row
  candRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 10,
  },
  candText: { flex: 1 },
  candName: { color: colors.text, fontSize: 14, fontWeight: '600' },
  candParty: {
    color: colors.yellow,
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 0.6,
    marginTop: 2,
  },
  candInput: {
    minWidth: 80,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: colors.text,
    fontFamily: 'monospace',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'right',
    borderWidth: 1,
    borderColor: colors.borderHi,
    borderRadius: 6,
    backgroundColor: colors.surface,
  },
  candLockedBox: {
    minWidth: 80,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: colors.surface,
    alignItems: 'flex-end',
  },
  candLockedValue: {
    color: colors.text,
    fontFamily: 'monospace',
    fontSize: 16,
    fontWeight: '700',
  },
  removeBtn: { padding: 4 },
  pressed:   { opacity: 0.6 },

  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingVertical: 6,
  },
  addBtnText: { color: colors.text2, fontSize: 12, fontFamily: 'monospace' },

  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    color: colors.text3,
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  totalValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'monospace',
  },

  // Submit
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: colors.yellow,
  },
  submitBtnDisabled: { opacity: 0.35 },
  submitBtnPressed:  { opacity: 0.85 },
  submitText: {
    color: '#0a0700',
    fontWeight: '700',
    fontSize: 14,
    fontFamily: 'monospace',
  },

  signingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderHi,
    backgroundColor: 'rgba(234,179,8,0.05)',
  },
  signingText: { color: colors.text2, fontSize: 13, fontFamily: 'monospace' },

  // Signed card
  signed: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.4)',
    backgroundColor: 'rgba(34,197,94,0.06)',
  },
  signedBody: { flex: 1 },
  signedTitle: {
    color: colors.liveGreen,
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  signedSub: { color: colors.text2, fontSize: 12, lineHeight: 18 },

  // Background-activity nudge
  nudge: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(234,179,8,0.35)',
    backgroundColor: 'rgba(234,179,8,0.05)',
  },
  nudgeIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(234,179,8,0.12)',
  },
  nudgeBody: { flex: 1 },
  nudgeTitle: {
    color: colors.yellow,
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  nudgeText: { color: colors.text2, fontSize: 12, lineHeight: 18, marginBottom: 10 },
  nudgeBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.yellow,
    backgroundColor: 'rgba(234,179,8,0.1)',
  },
  nudgeBtnText: {
    color: colors.yellow,
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '700',
  },

  // Peers
  peerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 10,
  },
  peerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.blue,
  },
  peerKey: { flex: 1, color: colors.text, fontSize: 12, fontFamily: 'monospace' },
  peerAgo: { color: colors.text3, fontSize: 11, fontFamily: 'monospace' },
  peerMore: {
    paddingTop: 8,
    color: colors.text3,
    fontSize: 11,
    fontFamily: 'monospace',
    textAlign: 'center',
  },

  // Reset
  resetBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  resetText: { color: colors.text2, fontFamily: 'monospace', fontSize: 13 },

  // Dev expander body
  devText: { color: colors.text2, fontSize: 12, lineHeight: 18 },
  code:    { color: colors.yellow, fontFamily: 'monospace', fontSize: 11 },
  devLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  devLinkText: {
    color: colors.yellow,
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
});
