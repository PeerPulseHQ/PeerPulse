import { View, Text, ScrollView, Pressable, Linking, StyleSheet } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import type { RootStackParamList } from '../../types/navigation';
import { JOURNAL_PACKETS, WORKSTREAM_META, type Citation, type JournalPacket } from './data';

export default function JournalDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'JournalDetail'>>();
  const { packetId } = route.params;
  const packet = JOURNAL_PACKETS.find(p => p.id === packetId);

  if (!packet) {
    return (
      <View style={s.notFound}>
        <Text style={s.notFoundText}>Article not found.</Text>
      </View>
    );
  }

  const meta = WORKSTREAM_META[packet.workstream];

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content}>
      <Header packet={packet} metaColor={meta.color} metaLabel={meta.label} />

      <View style={s.section}>
        <Text style={s.sectionLabel}>SUMMARY</Text>
        <Text style={s.summary}>{packet.fullSummary}</Text>
      </View>

      {packet.keyPoints.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionLabel}>KEY POINTS · {packet.keyPoints.length}</Text>
          {packet.keyPoints.map((kp, i) => (
            <View key={i} style={s.kpRow}>
              <Text style={s.kpBullet}>{i + 1}.</Text>
              <Text style={s.kpText}>{kp}</Text>
            </View>
          ))}
        </View>
      )}

      {packet.citations.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionLabel}>CITATIONS · {packet.citations.length}</Text>
          {packet.citations.map((c, i) => (
            <CitationRow key={i} citation={c} />
          ))}
        </View>
      )}

      <Pressable
        onPress={() => Linking.openURL(packet.sourceUrl).catch(() => {})}
        style={({ pressed }) => [s.sourceBtn, pressed && s.sourceBtnPressed]}
      >
        <Ionicons name="open-outline" size={14} color={colors.yellow} />
        <Text style={s.sourceBtnText}>Open primary source</Text>
      </Pressable>

      <View style={s.footer}>
        <View style={s.tag}>
          <Ionicons name="shield-checkmark" size={12} color={colors.liveGreen} />
          <Text style={s.tagText}>VERIFIED · {packet.verifiedBy}</Text>
        </View>
        <Text style={s.footerText}>
          Extracted from primary sources and human-verified by{' '}
          <Text style={s.footerOrg}>{packet.verifiedBy}</Text>, the hosting partner for this
          jurisdiction. Verify against the source before relying on specific figures. No editorial
          opinion.
        </Text>
      </View>
    </ScrollView>
  );
}

function Header({
  packet,
  metaColor,
  metaLabel,
}: {
  packet: JournalPacket;
  metaColor: string;
  metaLabel: string;
}) {
  return (
    <View style={s.header}>
      <View style={s.headerRow}>
        <View style={[s.wsBadge, { borderColor: metaColor }]}>
          <View style={[s.wsDot, { backgroundColor: metaColor }]} />
          <Text style={[s.wsLabel, { color: metaColor }]}>{metaLabel}</Text>
        </View>
        <Text style={s.flag}>{packet.jurisdictionFlag}</Text>
      </View>
      <Text style={s.title}>{packet.title}</Text>
      <View style={s.metaRow}>
        <Text style={s.metaText}>{packet.sourceLabel}</Text>
        <Text style={s.metaSep}>·</Text>
        <Text style={s.metaText}>{packet.dateLabel}</Text>
      </View>
    </View>
  );
}

function CitationRow({ citation }: { citation: Citation }) {
  return (
    <Pressable
      onPress={() => Linking.openURL(citation.url).catch(() => {})}
      style={({ pressed }) => [s.cite, pressed && s.citePressed]}
    >
      <Ionicons name="link-outline" size={13} color={colors.text2} style={{ marginTop: 2 }} />
      <View style={s.citeBody}>
        <Text style={s.citeRef}>{citation.ref}</Text>
        <Text style={s.citeUrl} numberOfLines={1}>{citation.url}</Text>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: 32 },

  header: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 18,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderHi,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  flag:     { fontSize: 22 },

  title: { color: colors.text, fontSize: 19, fontWeight: '700', lineHeight: 25 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  metaText: { color: colors.text2, fontSize: 12, fontFamily: 'monospace' },
  metaSep:  { color: colors.text3, marginHorizontal: 6 },

  section: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionLabel: {
    color: colors.text2,
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  summary: { color: colors.text, fontSize: 14, lineHeight: 22 },

  kpRow: { flexDirection: 'row', paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.border },
  kpBullet: {
    color: colors.yellow,
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '700',
    width: 24,
  },
  kpText: { color: colors.text, fontSize: 13, lineHeight: 20, flex: 1 },

  cite: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 10,
  },
  citePressed: { opacity: 0.6 },
  citeBody:    { flex: 1 },
  citeRef:     { color: colors.text, fontSize: 12, marginBottom: 2 },
  citeUrl:     { color: colors.text3, fontSize: 11, fontFamily: 'monospace' },

  sourceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 14,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.yellow,
    backgroundColor: 'rgba(234,179,8,0.06)',
  },
  sourceBtnPressed: { opacity: 0.6 },
  sourceBtnText: {
    color: colors.yellow,
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'monospace',
  },

  footer: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'flex-start',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    marginBottom: 10,
    borderColor: 'rgba(34,197,94,0.4)',
    backgroundColor: 'rgba(34,197,94,0.08)',
  },
  tagText: {
    color: colors.liveGreen,
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  footerText: { color: colors.text3, fontSize: 11, lineHeight: 17 },
  footerOrg:  { color: colors.text2, fontWeight: '700' },

  notFound: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { color: colors.text3, fontSize: 14 },
});
