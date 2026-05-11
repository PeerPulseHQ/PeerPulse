import { useMemo } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/home/HomeScreen';
import ElectionsScreen from '../screens/elections/ElectionsScreen';
import JournalScreen from '../screens/journal/JournalScreen';
// TODO: V2 — restore Surveys tab when the Surveys pillar ships
// import SurveysScreen from '../screens/surveys/SurveysScreen';
// TODO: V4 — restore Learn tab when the Learn pillar ships
// import LearnScreen from '../screens/learn/LearnScreen';
import PlaygroundScreen from '../screens/playground/PlaygroundScreen';
import TestRunScreen from '../screens/test-run/TestRunScreen';
import ElectionDetailScreen from '../screens/elections/ElectionDetailScreen';
import JournalDetailScreen from '../screens/journal/JournalDetailScreen';
import { useThemeColors } from '../theme/colors';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function tabIcon(filled: IoniconsName, outline: IoniconsName) {
  return ({ focused, color, size }: { focused: boolean; color: string; size: number }) => (
    <Ionicons name={focused ? filled : outline} size={size} color={color} />
  );
}

function TabsNavigator() {
  const colors = useThemeColors();
  const screenOptions = useMemo(
    () => ({
      headerShown: false,
      tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
      tabBarActiveTintColor: colors.yellow,
      tabBarInactiveTintColor: colors.text3,
    }),
    [colors],
  );
  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Home', tabBarIcon: tabIcon('home', 'home-outline') }}
      />
      <Tab.Screen
        name="Elections"
        component={ElectionsScreen}
        options={{ tabBarLabel: 'Elections', tabBarIcon: tabIcon('checkbox', 'checkbox-outline') }}
      />
      <Tab.Screen
        name="Journal"
        component={JournalScreen}
        options={{ tabBarLabel: 'Journal', tabBarIcon: tabIcon('newspaper', 'newspaper-outline') }}
      />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const colors = useThemeColors();
  const screenOptions = useMemo(
    () => ({
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.text,
      headerTitleStyle: { fontFamily: 'monospace', fontSize: 14, fontWeight: '700' as const },
      contentStyle: { backgroundColor: colors.bg },
    }),
    [colors],
  );
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Tabs" component={TabsNavigator} options={{ headerShown: false }} />
      <Stack.Screen
        name="Playground"
        component={TestRunScreen}
        options={{ title: 'Test run', headerBackTitle: 'Home' }}
      />
      <Stack.Screen
        name="DeveloperPlayground"
        component={PlaygroundScreen}
        options={{ title: 'Developer Playground', headerBackTitle: 'Back' }}
      />
      <Stack.Screen
        name="ElectionDetail"
        component={ElectionDetailScreen}
        options={{ title: 'Election', headerBackTitle: 'Back' }}
      />
      <Stack.Screen
        name="JournalDetail"
        component={JournalDetailScreen}
        options={{ title: 'Article', headerBackTitle: 'Back' }}
      />
    </Stack.Navigator>
  );
}
