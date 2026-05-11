import { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useThemeColors, type ThemeColors } from '../../../theme/colors';
import { UPCOMING_ELECTIONS, type UpcomingElection } from '../data';

function monthsUntil(target: Date, from: Date = new Date()): number {
  const ms = target.getTime() - from.getTime();
  const days = Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
  return Math.round(days / 30.44);
}

function relativeLabel(months: number): string {
  if (months <= 0) return 'past';
  if (months === 1) return '1 month';
  if (months < 12) return `${months} months`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (rem === 0) return years === 1 ? '1 year' : `${years} years`;
  return `${months} months`;
}

export default function UpcomingElections() {
  const colors = useThemeColors();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const navigation = useNavigation<any>();
  return (
    <View style={s.section}>
      <Text style={s.header}>MORE ELECTIONS COMING</Text>

      {UPCOMING_ELECTIONS.map(e => (
        <Row key={e.id} election={e} styles={s} />
      ))}

      <Pressable
        onPress={() => navigation.navigate('Elections')}
        style={({ pressed }) => [s.viewAll, pressed && s.pressed]}
      >
        <Text style={s.viewAllText}>Browse all elections →</Text>
      </Pressable>
    </View>
  );
}

function Row({
  election,
  styles: s,
}: {
  election: UpcomingElection;
  styles: ReturnType<typeof makeStyles>;
}) {
  const months = monthsUntil(election.date);
  return (
    <View style={s.row}>
      <Text style={s.flag}>{election.flag}</Text>
      <View style={s.rowText}>
        <Text style={s.country}>{election.country}</Text>
        <Text style={s.dateLine}>
          {election.dateLabel}
          <Text style={s.sep}>{'  ·  '}</Text>
          {relativeLabel(months)}
        </Text>
      </View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    section: {
      marginHorizontal: 16,
      marginTop: 20,
      marginBottom: 32,
      padding: 20,
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    header: {
      color: colors.text2,
      fontSize: 11,
      fontWeight: '700',
      fontFamily: 'monospace',
      letterSpacing: 1.5,
      marginBottom: 14,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    flag: { fontSize: 22, marginRight: 14 },
    rowText: { flex: 1 },
    country: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '700',
      fontFamily: 'monospace',
      letterSpacing: 1,
      marginBottom: 3,
    },
    dateLine: { color: colors.text2, fontSize: 12, fontFamily: 'monospace' },
    sep: { color: colors.text3 },
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
