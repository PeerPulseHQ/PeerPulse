import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme/colors';

type Props = {
  /** Body content shown when expanded. */
  children: React.ReactNode;
  defaultOpen?: boolean;
};

export default function TechnicalDetails({ children, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <View style={s.wrap}>
      <Pressable
        onPress={() => setOpen(o => !o)}
        style={({ pressed }) => [s.toggle, pressed && s.pressed]}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={open ? 'Hide technical details' : 'Show technical details'}
      >
        <Ionicons name={open ? 'chevron-down' : 'chevron-forward'} size={12} color={colors.text3} />
        <Text style={s.label}>{open ? 'Hide technical details' : 'Show technical details'}</Text>
      </Pressable>
      {open && <View style={s.body}>{children}</View>}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  pressed: { opacity: 0.6 },
  label: {
    color: colors.text3,
    fontSize: 11,
    fontFamily: 'monospace',
    letterSpacing: 0.8,
  },
  body: {
    marginTop: 8,
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
