import { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors, type ThemeColors } from '../../../theme/colors';
import { HERO_ELECTION } from '../data';

function monthsUntil(target: Date, from: Date = new Date()): number {
  const ms = target.getTime() - from.getTime();
  const days = Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
  return Math.round(days / 30.44);
}

export default function ElectionHero() {
  const colors = useThemeColors();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const [starred, setStarred] = useState(false);
  const months = monthsUntil(HERO_ELECTION.date);

  return (
    <View style={s.card}>
      <View style={s.accentBar} />
      <Text style={s.eyebrow}>⚡ ELECTION DAY</Text>
      <Text style={s.title}>{HERO_ELECTION.title}</Text>
      <Text style={s.date}>{HERO_ELECTION.dateLabel}</Text>
      <Text style={s.countdown}>{months} months away</Text>

      <Pressable
        onPress={() => setStarred(v => !v)}
        style={({ pressed }) => [s.starBtn, pressed && s.starBtnPressed, starred && s.starBtnActive]}
        accessibilityRole="button"
        accessibilityLabel={starred ? 'Following' : 'Star to follow'}
      >
        <Ionicons
          name={starred ? 'star' : 'star-outline'}
          size={14}
          color={starred ? colors.yellow : colors.text2}
        />
        <Text style={[s.starText, starred && s.starTextActive]}>
          {starred ? 'Following' : 'Star to follow'}
        </Text>
      </Pressable>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      marginHorizontal: 16,
      marginTop: 20,
      marginBottom: 8,
      padding: 24,
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.borderHi,
      overflow: 'hidden',
    },
    accentBar: {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      width: 3,
      backgroundColor: colors.yellow,
    },
    eyebrow: {
      color: colors.yellow,
      fontSize: 10,
      fontWeight: '700',
      fontFamily: 'monospace',
      letterSpacing: 1.5,
      marginBottom: 10,
    },
    title: {
      color: colors.text,
      fontSize: 20,
      fontWeight: '700',
      lineHeight: 26,
      marginBottom: 8,
    },
    date: {
      color: colors.text2,
      fontSize: 13,
      fontFamily: 'monospace',
    },
    countdown: {
      color: colors.text3,
      fontSize: 12,
      fontFamily: 'monospace',
      marginTop: 4,
      marginBottom: 18,
    },
    starBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      gap: 6,
    },
    starBtnPressed: { opacity: 0.7 },
    starBtnActive: { borderColor: colors.yellow },
    starText: {
      color: colors.text2,
      fontSize: 12,
      fontFamily: 'monospace',
    },
    starTextActive: { color: colors.yellow },
  });
