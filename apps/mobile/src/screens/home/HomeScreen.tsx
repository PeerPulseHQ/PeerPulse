import { useMemo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors, type ThemeColors } from '../../theme/colors';
import StatusStrip from './components/StatusStrip';
import ElectionHero from './components/ElectionHero';
import JournalPreview from './components/JournalPreview';
import TestRunCallout from './components/TestRunCallout';
import UpcomingElections from './components/UpcomingElections';

export default function HomeScreen() {
  const colors = useThemeColors();
  const s = useMemo(() => makeStyles(colors), [colors]);

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      {/* Pinned: status strip stays at top while content below scrolls */}
      <StatusStrip />
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        <ElectionHero />
        <JournalPreview />
        <TestRunCallout />
        <UpcomingElections />
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    scroll: {
      flex: 1,
    },
    content: {
      paddingBottom: 24,
    },
  });
