import { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../../theme/colors';
import type { RootStackParamList } from '../../types/navigation';
import {
  JOURNAL_PACKETS,
  WORKSTREAM_META,
  WORKSTREAM_TABS,
  COUNTRIES,
  type JournalPacket,
  type Workstream,
} from './data';
import JournalSettingsModal from './JournalSettingsModal';

const COUNTRY_BY_NAME: Record<string, string> = Object.fromEntries(
  COUNTRIES.map(c => [c.name.toLowerCase(), c.id]),
);

export default function JournalScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [active, setActive] = useState<'all' | Workstream>('all');
  const [followed, setFollowed] = useState<Set<string>>(new Set(['ug']));
  const [settingsOpen, setSettingsOpen] = useState(false);

  /** Countries with at least one selection — either whole-country or specific state(s). */
  const followedChips = useMemo(() => {
    return COUNTRIES.map(c => {
      const whole = followed.has(c.id);
      const stateCount = c.states.filter(st => followed.has(st.id)).length;
      return { country: c, whole, stateCount };
    }).filter(x => x.whole || x.stateCount > 0);
  }, [followed]);

  const filtered = useMemo<JournalPacket[]>(() => {
    const byCountry = JOURNAL_PACKETS.filter(p => {
      const cid = COUNTRY_BY_NAME[p.jurisdiction.toLowerCase()];
      if (!cid) return false;
      // Country-level follow includes everything from that country.
      if (followed.has(cid)) return true;
      // Otherwise — without state-level metadata on packets, only country-level follow filters in.
      return false;
    });
    return active === 'all' ? byCountry : byCountry.filter(p => p.workstream === active);
  }, [followed, active]);

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[2]}
      >
        <View style={s.header}>
          <View style={s.headerTopRow}>
            <View style={s.headerLeft}>
              <Text style={s.kicker}>JOURNAL</Text>
              <Text style={s.h1}>Today in government</Text>
            </View>
            <Pressable
              onPress={() => setSettingsOpen(true)}
              style={({ pressed }) => [s.gearBtn, pressed && s.gearBtnPressed]}
              hitSlop={10}
              accessibilityLabel="Journal settings"
            >
              <Ionicons name="options-outline" size={20} color={colors.text2} />
            </Pressable>
          </View>
          <Text style={s.sub}>
            Official proceedings, cited to primary sources. No editorial opinion — every claim
            links back to the original document.
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.chipRow}
        >
          {followedChips.length === 0 ? (
            <Text style={s.followingEmpty}>No countries followed yet.</Text>
          ) : (
            <>
              <Text style={s.followingLabel}>Following:</Text>
              {followedChips.map(({ country, whole, stateCount }) => (
                <View key={country.id} style={s.followChip}>
                  <Text style={s.followFlag}>{country.flag}</Text>
                  <Text style={s.followName}>
                    {country.name}
                    {!whole && stateCount > 0 && (
                      <Text style={s.followSub}>
                        {' · '}{stateCount} {stateCount === 1
                          ? country.regionLabel.replace(/s$/, '')
                          : country.regionLabel}
                      </Text>
                    )}
                  </Text>
                </View>
              ))}
            </>
          )}
          <Pressable
            onPress={() => setSettingsOpen(true)}
            style={({ pressed }) => [s.manageChip, pressed && s.manageChipPressed]}
          >
            <Ionicons name="add" size={14} color={colors.yellow} />
            <Text style={s.manageText}>
              {followedChips.length === 0 ? 'Add countries' : 'Manage'}
            </Text>
          </Pressable>
        </ScrollView>

        <View style={s.tabRowWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.tabRow}
          >
            {WORKSTREAM_TABS.map(t => {
              const isActive = active === t.id;
              return (
                <Pressable
                  key={t.id}
                  onPress={() => setActive(t.id)}
                  style={({ pressed }) => [s.tab, isActive && s.tabActive, pressed && s.tabPressed]}
                >
                  <Text style={[s.tabText, isActive && s.tabTextActive]}>{t.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {filtered.length === 0 ? (
          <View style={s.empty}>
            {followedChips.length === 0 ? (
              <>
                <Ionicons name="globe-outline" size={28} color={colors.text3} />
                <Text style={s.emptyText}>Choose countries to follow to populate your journal.</Text>
                <Pressable
                  onPress={() => setSettingsOpen(true)}
                  style={({ pressed }) => [s.emptyCta, pressed && s.emptyCtaPressed]}
                >
                  <Text style={s.emptyCtaText}>Choose countries</Text>
                </Pressable>
              </>
            ) : (
              <Text style={s.emptyText}>No articles in this workstream yet.</Text>
            )}
          </View>
        ) : (
          filtered.map(p => (
            <PacketCard
              key={p.id}
              packet={p}
              onOpen={() => navigation.navigate('JournalDetail', { packetId: p.id })}
            />
          ))
        )}
      </ScrollView>

      <JournalSettingsModal
        visible={settingsOpen}
        followed={followed}
        onClose={() => setSettingsOpen(false)}
        onSave={setFollowed}
      />
    </SafeAreaView>
  );
}

function PacketCard({ packet, onOpen }: { packet: JournalPacket; onOpen: () => void }) {
  const meta = WORKSTREAM_META[packet.workstream];
  return (
    <Pressable
      onPress={onOpen}
      style={({ pressed }) => [s.card, pressed && s.cardPressed]}
      accessibilityRole="button"
      accessibilityLabel={`Open: ${packet.title}`}
    >
      <View style={s.cardHeader}>
        <View style={[s.wsBadge, { borderColor: meta.color }]}>
          <View style={[s.wsDot, { backgroundColor: meta.color }]} />
          <Text style={[s.wsLabel, { color: meta.color }]}>{meta.label}</Text>
        </View>
        <Text style={s.flag}>{packet.jurisdictionFlag}</Text>
      </View>

      <Text style={s.title}>{packet.title}</Text>
      <Text style={s.summary} numberOfLines={4}>
        {packet.summary}
      </Text>

      <View style={s.footer}>
        <Text style={s.source}>{packet.sourceLabel}</Text>
        <Text style={s.sep}>·</Text>
        <Text style={s.date}>{packet.dateLabel}</Text>
        <View style={s.spacer} />
        <View style={s.tag}>
          <Ionicons name="shield-checkmark" size={10} color={colors.liveGreen} />
          <Text style={s.tagText} numberOfLines={1}>{packet.verifiedBy}</Text>
        </View>
        <Ionicons name="chevron-forward" size={14} color={colors.text3} style={{ marginLeft: 6 }} />
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: colors.bg },
  scroll:  { flex: 1 },
  content: { paddingBottom: 32 },

  header:  { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 16 },
  headerTopRow: { flexDirection: 'row', alignItems: 'flex-start' },
  headerLeft:   { flex: 1 },
  kicker:  {
    color: colors.purple,
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  h1:      { color: colors.text, fontSize: 22, fontWeight: '700', marginBottom: 6 },
  sub:     { color: colors.text2, fontSize: 13, lineHeight: 20 },
  gearBtn: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  gearBtnPressed: { opacity: 0.6 },

  chipRow: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  followingLabel: {
    color: colors.text3,
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 1.2,
    marginRight: 4,
  },
  followingEmpty: {
    color: colors.text3,
    fontSize: 12,
    fontFamily: 'monospace',
    marginRight: 4,
  },
  followChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.yellow,
    backgroundColor: 'rgba(234,179,8,0.08)',
  },
  followFlag: { fontSize: 14, marginRight: 5 },
  followName: { color: colors.text, fontSize: 12, fontFamily: 'monospace', fontWeight: '600' },
  followSub:  { color: colors.text3, fontWeight: '400' },
  manageChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderHi,
    backgroundColor: colors.surface,
    gap: 4,
  },
  manageChipPressed: { opacity: 0.7 },
  manageText: { color: colors.yellow, fontSize: 12, fontFamily: 'monospace', fontWeight: '600' },

  tabRowWrap: {
    backgroundColor: colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 8,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginRight: 4,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginBottom: -1,
  },
  tabActive:    { borderBottomColor: colors.yellow },
  tabPressed:   { opacity: 0.6 },
  tabText:      { color: colors.text2, fontSize: 12, fontFamily: 'monospace', fontWeight: '600', letterSpacing: 0.5 },
  tabTextActive: { color: colors.text },

  card: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardPressed: { opacity: 0.75 },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  wsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
  },
  wsDot:    { width: 5, height: 5, borderRadius: 3, marginRight: 6 },
  wsLabel:  { fontSize: 10, fontFamily: 'monospace', fontWeight: '700', letterSpacing: 1 },
  flag:     { fontSize: 16 },

  title:    { color: colors.text, fontSize: 15, fontWeight: '700', lineHeight: 21, marginBottom: 8 },
  summary:  { color: colors.text2, fontSize: 13, lineHeight: 20, marginBottom: 12 },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexWrap: 'wrap',
  },
  source:   { color: colors.text2, fontSize: 11, fontFamily: 'monospace' },
  sep:      { color: colors.text3, marginHorizontal: 6 },
  date:     { color: colors.text3, fontSize: 11, fontFamily: 'monospace' },
  spacer:   { flex: 1 },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.4)',
    backgroundColor: 'rgba(34,197,94,0.08)',
    maxWidth: 140,
  },
  tagText: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 0.5,
    color: colors.liveGreen,
  },

  empty: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 32,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: { color: colors.text3, fontSize: 13, textAlign: 'center' },
  emptyCta: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.yellow,
    backgroundColor: 'rgba(234,179,8,0.06)',
  },
  emptyCtaPressed: { opacity: 0.7 },
  emptyCtaText: {
    color: colors.yellow,
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
});
