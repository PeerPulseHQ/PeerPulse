import { View, Text, StyleSheet } from 'react-native';

export default function SurveysScreen() {
  return (
    <View style={s.root}>
      <Text style={s.label}>Surveys</Text>
      <Text style={s.sub}>Coming in Week 5</Text>
    </View>
  );
}

const s = StyleSheet.create({
  root:  { flex: 1, backgroundColor: '#050810', alignItems: 'center', justifyContent: 'center' },
  label: { color: '#dce8f8', fontSize: 20, fontWeight: '700' },
  sub:   { color: '#364f6e', fontSize: 13, marginTop: 6, fontFamily: 'monospace' },
});
