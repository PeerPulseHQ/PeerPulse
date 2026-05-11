import { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useThemeColors, type ThemeColors } from '../../../theme/colors';
import type { RootStackParamList } from '../../../types/navigation';
import {
  JOURNAL_PACKETS,
  WORKSTREAM_META,
  type JournalPacket,
} from '../../journal/data';

const PREVIEW_COUNT = 3;

const recentPackets: JournalPacket[] = [...JOURNAL_PACKETS]
  .sort((a, b) => b.date.localeCompare(a.date))
  .slice(0, PREVIEW_COUNT);

export default function JournalPreview() {
  const colors = useThemeColors();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <View style={s.section}>
      <View style={s.headerRow}>
        <Text style={s.header}>RECENT FROM GOVERNMENT</Text>
        <Text style={s.count}>({JOURNAL_PACKETS.length})</Text>
      </View>

      {recentPackets.map(packet => (
        <Item
          key={packet.id}
          packet={packet}
          onOpen={() => navigation.navigate('JournalDetail', { packetId: packet.id })}
          styles={s}
        />
      ))}

      <Pressable
        onPress={() => navigation.navigate('Tabs', { screen: 'Journal' } as never)}
        style={({ pressed }) => [s.viewAll, pressed && s.pressed]}
      >
        <Text style={s.viewAllText}>View all in Journal →</Text>
      </Pressable>
    </View>
  );
}

function Item({
  packet,
  onOpen,
  styles: s,
}: {
  packet: JournalPacket;
  onOpen: () => void;
  styles: ReturnType<typeof makeStyles>;
}) {
  const ws = WORKSTREAM_META[packet.workstream];
  return (
    <Pressable
      onPress={onOpen}
      style={({ pressed }) => [s.item, pressed && s.itemPressed]}
      accessibilityRole="button"
      accessibilityLabel={`Open: ${packet.title}`}
    >
      <View style={s.bulletRow}>
        <View style={[s.bullet, { backgroundColor: ws.color }]} />
        <Text style={s.tag}>
          {packet.jurisdiction.toUpperCase()}
          <Text style={s.tagSep}>{'  ·  '}</Text>
          <Text style={[s.workstream, { color: ws.color }]}>{ws.label}</Text>
        </Text>
      </View>
      <Text style={s.headline} numberOfLines={2}>{packet.title}</Text>
      <Text style={s.meta}>
        {packet.sourceLabel} · {packet.dateLabel}
      </Text>
    </Pressable>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    section: {
      marginHorizontal: 16,
      marginTop: 20,
      padding: 20,
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    header: {
      color: colors.text2,
      fontSize: 11,
      fontWeight: '700',
      fontFamily: 'monospace',
      letterSpacing: 1.5,
    },
    count: {
      color: colors.text3,
      fontSize: 11,
      fontFamily: 'monospace',
    },
    item: {
      paddingVertical: 10,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    itemPressed: { opacity: 0.6 },
    bulletRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    bullet: { width: 6, height: 6, borderRadius: 3, marginRight: 8 },
    tag: {
      color: colors.text2,
      fontSize: 10,
      fontFamily: 'monospace',
      letterSpacing: 1,
      fontWeight: '600',
    },
    tagSep: { color: colors.text3 },
    workstream: { fontWeight: '700' },
    headline: { color: colors.text, fontSize: 14, lineHeight: 20, marginBottom: 4 },
    meta: { color: colors.text3, fontSize: 11, fontFamily: 'monospace' },
    viewAll: {
      marginTop: 14,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    viewAllText: {
      color: colors.yellow,
      fontSize: 12,
      fontFamily: 'monospace',
      fontWeight: '600',
    },
    pressed: { opacity: 0.6 },
  });
