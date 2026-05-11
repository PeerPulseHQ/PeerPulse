import { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useThemeColors, type ThemeColors } from '../../theme/colors';
import type { RootStackParamList } from '../../types/navigation';
import { ELECTIONS, CATEGORY_META, sortByDate, type Election } from './data';

export default function ElectionsScreen() {
  const colors = useThemeColors();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [starred, setStarred] = useState<Set<string>>(new Set(['ke-general-2027']));

  const ordered = useMemo<Election[]>(
    () => {
      const byDate = sortByDate(ELECTIONS);
      return [
        ...byDate.filter(e => starred.has(e.id)),
        ...byDate.filter(e => !starred.has(e.id)),
      ];
    },
    [starred],
  );

  function toggle(id: string) {
    setStarred(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.header}>
          <Text style={s.kicker}>ELECTIONS</Text>
          <Text style={s.h1}>Upcoming &amp; recent</Text>
          <Text style={s.sub}>Star elections to follow them.</Text>
        </View>

        {ordered.map(e => (
          <ElectionCard
            key={e.id}
            election={e}
            starred={starred.has(e.id)}
            onStar={() => toggle(e.id)}
            onOpen={() => navigation.navigate('ElectionDetail', { electionId: e.id })}
            styles={s}
            colors={colors}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function ElectionCard({
  election,
  starred,
  onStar,
  onOpen,
  styles: s,
  colors,
}: {
  election: Election;
  starred: boolean;
  onStar: () => void;
  onOpen: () => void;
  styles: ReturnType<typeof makeStyles>;
  colors: ThemeColors;
}) {
  const cat = CATEGORY_META[election.category];
  return (
    <Pressable
      onPress={onOpen}
      style={({ pressed }) => [s.card, pressed && s.cardPressed]}
      accessibilityRole="button"
      accessibilityLabel={`Open ${election.country} ${election.type}`}
    >
      <View style={s.cardTop}>
        <Text style={s.flag}>{election.flag}</Text>
        <View style={s.titleBlock}>
          <Text style={s.country}>{election.country}</Text>
          <Text style={s.type}>{election.type}</Text>
        </View>
        <Pressable
          onPress={onStar}
          style={({ pressed }) => [s.starBtn, pressed && s.starBtnPressed]}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={starred ? 'Following' : 'Star to follow'}
        >
          <Ionicons
            name={starred ? 'star' : 'star-outline'}
            size={20}
            color={starred ? colors.yellow : colors.text3}
          />
        </Pressable>
      </View>

      <View style={s.metaRow}>
        <Text style={s.catTag}>{cat.label}</Text>
        <Text style={s.sep}>·</Text>
        <Text style={s.date}>{election.date}</Text>
        <Text style={s.sep}>·</Text>
        <Text style={s.lead}>{election.lead}</Text>
        <View style={s.spacer} />
        <Ionicons name="chevron-forward" size={16} color={colors.text3} />
      </View>
    </Pressable>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.bg },
    scroll: { flex: 1 },
    content: { paddingBottom: 32 },

    header: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 12 },
    kicker: {
      color: colors.yellow,
      fontSize: 10,
      fontFamily: 'monospace',
      fontWeight: '700',
      letterSpacing: 1.5,
      marginBottom: 8,
    },
    h1: { color: colors.text, fontSize: 22, fontWeight: '700', marginBottom: 6 },
    sub: { color: colors.text2, fontSize: 13, lineHeight: 20 },

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
    cardTop: { flexDirection: 'row', alignItems: 'flex-start' },
    flag: { fontSize: 28, marginRight: 12 },
    titleBlock: { flex: 1 },
    country: { color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: 2 },
    type: { color: colors.text2, fontSize: 12, lineHeight: 18 },
    starBtn: { padding: 4, marginLeft: 8, marginTop: -2 },
    starBtnPressed: { opacity: 0.5 },

    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      marginTop: 12,
    },
    spacer: { flex: 1 },
    catTag: {
      color: colors.text2,
      fontSize: 10,
      fontFamily: 'monospace',
      fontWeight: '700',
      letterSpacing: 1,
    },
    date: { color: colors.text, fontSize: 12, fontFamily: 'monospace' },
    sep: { color: colors.text3, marginHorizontal: 6 },
    lead: { color: colors.text2, fontSize: 12, fontFamily: 'monospace' },
  });
