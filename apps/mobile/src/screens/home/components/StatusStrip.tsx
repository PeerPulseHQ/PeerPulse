import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors, type ThemeColors } from '../../../theme/colors';
import { STATUS_STRIP } from '../data';

export default function StatusStrip() {
  const colors = useThemeColors();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const { connected, relayCount, lastSync } = STATUS_STRIP;
  return (
    <View style={s.card}>
      <View style={s.row}>
        <View style={[s.dot, { backgroundColor: connected ? colors.liveGreen : colors.text3 }]} />
        <Text style={s.statusText}>{connected ? 'Connected' : 'Offline'}</Text>
        <View style={s.sep} />
        <Text style={s.meta}>
          {relayCount} relay
        </Text>
        <View style={s.sep} />
        <Text style={s.meta}>last sync {lastSync}</Text>
      </View>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 10,
    },
    statusText: {
      color: colors.text,
      fontSize: 12,
      fontFamily: 'monospace',
      fontWeight: '700',
      letterSpacing: 0.3,
    },
    sep: {
      width: 1,
      height: 12,
      backgroundColor: colors.border,
      marginHorizontal: 10,
    },
    meta: {
      color: colors.text2,
      fontSize: 12,
      fontFamily: 'monospace',
    },
  });
