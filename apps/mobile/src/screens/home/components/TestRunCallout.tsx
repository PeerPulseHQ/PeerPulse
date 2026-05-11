import { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useThemeColors, type ThemeColors } from '../../../theme/colors';
import { TEST_RUN_COPY } from '../data';

export default function TestRunCallout() {
  const colors = useThemeColors();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const navigation = useNavigation<any>();
  return (
    <View style={s.section}>
      <View style={s.headerRow}>
        <Ionicons name="radio-outline" size={14} color={colors.blue} />
        <Text style={s.header}>{TEST_RUN_COPY.heading}</Text>
      </View>

      <Text style={s.body}>{TEST_RUN_COPY.body}</Text>
      <Text style={s.scaleHint}>{TEST_RUN_COPY.scaleHint}</Text>

      <Pressable
        onPress={() => navigation.navigate('Playground')}
        style={({ pressed }) => [s.cta, pressed && s.ctaPressed]}
        accessibilityRole="button"
      >
        <Text style={s.ctaText}>{TEST_RUN_COPY.cta}</Text>
      </Pressable>
    </View>
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
      alignItems: 'center',
      gap: 8,
      marginBottom: 14,
    },
    header: {
      color: colors.blue,
      fontSize: 11,
      fontWeight: '700',
      fontFamily: 'monospace',
      letterSpacing: 1.5,
    },
    body: {
      color: colors.text,
      fontSize: 14,
      lineHeight: 22,
      marginBottom: 12,
    },
    scaleHint: {
      color: colors.text2,
      fontSize: 13,
      fontStyle: 'italic',
      marginBottom: 18,
    },
    cta: {
      alignSelf: 'flex-start',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: colors.blue,
      backgroundColor: 'rgba(96, 165, 250, 0.08)',
    },
    ctaPressed: { opacity: 0.6 },
    ctaText: {
      color: colors.blue,
      fontSize: 13,
      fontWeight: '700',
      fontFamily: 'monospace',
    },
  });
