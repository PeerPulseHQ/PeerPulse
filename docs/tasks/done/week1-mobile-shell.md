# Task: Mobile App Shell — Tab Navigation + Placeholder Screens

**Phase:** Week 1
**Depends on:** `week1-monorepo.md`, `week1-core.md`
**Spec refs:** `tabulate/spec-protocol.md §4`, `product-overview.md §Tab Order`

---

## What already exists

`apps/mobile/` has all dependencies, shims, and native module configuration in place. Do not modify:

- `package.json` — all dependencies correct; no navigation library yet (add below)
- `shims/globals.js` — all 9 global patches; loaded first in `index.js`
- `babel.config.js` — `module-resolver` aliases for all node: imports
- `metro.config.js` — `unstable_enablePackageExports`, `extraNodeModules`, monorepo watchFolders
- `index.js` — `import './shims/globals.js'` is the first line; keep it first

`apps/mobile/src/` is empty. `App.js` is a placeholder showing "PeerPulse" text.

---

## What this task builds

The four-tab navigation shell. Every tab shows a placeholder screen. No real content yet — that comes in later weeks. The goal is a working navigation structure that the emulator can display and that the physical device can run.

---

## Install navigation

Add to `apps/mobile/package.json` dependencies:

```json
"@react-navigation/native":       "^7.0.0",
"@react-navigation/bottom-tabs":  "^7.0.0",
"react-native-screens":           "^4.0.0",
"react-native-safe-area-context": "^4.0.0"
```

Run `pnpm install` from the repo root after adding.

`react-native-screens` and `react-native-safe-area-context` are peer dependencies of React Navigation and require native linking. Both are compatible with Expo bare workflow.

---

## File structure to create

```
apps/mobile/
  App.js               ← replace placeholder with NavigationContainer
  src/
    navigation/
      RootNavigator.tsx ← bottom tab navigator
    screens/
      elections/
        ElectionsScreen.tsx   ← placeholder
      journal/
        PulseScreen.tsx       ← placeholder
      surveys/
        PollsScreen.tsx       ← placeholder
      learn/
        LearnScreen.tsx       ← placeholder
      debug/
        DebugScreen.tsx       ← connection debug (see week1-mobile-libp2p.md)
    theme/
      colors.ts         ← design tokens matching website (dark theme)
```

---

## Implementation

### `App.js` — replace placeholder

```javascript
import './shims/globals.js';  // MUST remain first import
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}
```

### `src/navigation/RootNavigator.tsx`

```typescript
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ElectionsScreen from '../screens/elections/ElectionsScreen';
import PulseScreen from '../screens/journal/PulseScreen';
import PollsScreen from '../screens/surveys/PollsScreen';
import LearnScreen from '../screens/learn/LearnScreen';

const Tab = createBottomTabNavigator();

export default function RootNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#080c18', borderTopColor: '#14213a' },
        tabBarActiveTintColor: '#eab308',
        tabBarInactiveTintColor: '#364f6e',
      }}
    >
      <Tab.Screen name="Journal"     component={PulseScreen}     options={{ tabBarLabel: 'Journal' }} />
      <Tab.Screen name="Surveys"     component={PollsScreen}     options={{ tabBarLabel: 'Surveys' }} />
      <Tab.Screen name="Elections" component={ElectionsScreen} options={{ tabBarLabel: 'Elections' }} />
      <Tab.Screen name="Learn"     component={LearnScreen}     options={{ tabBarLabel: 'Learn' }} />
    </Tab.Navigator>
  );
}
```

Tab order matches `product-overview.md`: Journal (1), Surveys (2), Elections (3), Learn (4).

### Placeholder screens

Each screen follows the same pattern:

```typescript
// src/screens/elections/ElectionsScreen.tsx
import { View, Text, StyleSheet } from 'react-native';

export default function ElectionsScreen() {
  return (
    <View style={s.root}>
      <Text style={s.label}>Elections</Text>
      <Text style={s.sub}>Coming in Week 2</Text>
    </View>
  );
}

const s = StyleSheet.create({
  root:  { flex: 1, backgroundColor: '#050810', alignItems: 'center', justifyContent: 'center' },
  label: { color: '#dce8f8', fontSize: 20, fontWeight: '700' },
  sub:   { color: '#364f6e', fontSize: 13, marginTop: 6, fontFamily: 'monospace' },
});
```

Apply the same pattern for Journal, Surveys, and Learn — different label text per screen.

### `src/theme/colors.ts`

```typescript
export const colors = {
  bg:       '#050810',
  surface:  '#080c18',
  card:     '#0c1222',
  border:   '#14213a',
  borderHi: '#1e3357',
  text:     '#dce8f8',
  text2:    '#7a95b8',
  text3:    '#364f6e',
  yellow:   '#eab308',   // Elections / primary accent
  blue:     '#60a5fa',   // Surveys
  purple:   '#c084fc',   // Journal
  green:    '#4ade80',   // Learn
  liveGreen:'#22c55e',
} as const;
```

---

## Acceptance criteria

- [ ] `pnpm --filter @peerpulse/mobile android` opens the app in an Android emulator
- [ ] All four bottom tabs are visible: Journal, Surveys, Elections, Learn (in that order)
- [ ] Tapping each tab shows the correct placeholder screen
- [ ] Active tab label is amber (`#eab308`); inactive is dim
- [ ] `shims/globals.js` is still the first import in `App.js` / `index.js`
- [ ] No TypeScript errors (`pnpm typecheck`)
- [ ] App does not crash on launch
