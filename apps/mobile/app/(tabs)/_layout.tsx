import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { luxuryColors, luxuryGradient } from '@/theme/luxury';

type TabIconName =
  | 'home'
  | 'home-outline'
  | 'calendar'
  | 'calendar-outline'
  | 'chatbubble-ellipses'
  | 'chatbubble-ellipses-outline'
  | 'stats-chart'
  | 'stats-chart-outline'
  | 'person'
  | 'person-outline';

function TabIcon({
  focused,
  activeIcon,
  inactiveIcon,
}: {
  focused: boolean;
  activeIcon: TabIconName;
  inactiveIcon: TabIconName;
}) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Ionicons
        name={focused ? activeIcon : inactiveIcon}
        size={22}
        color={focused ? luxuryColors.goldLight : luxuryColors.muted}
      />
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  const bottomSafePadding = Platform.OS === 'android' ? Math.max(insets.bottom, 22) : Math.max(insets.bottom, 12);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: luxuryColors.goldLight,
        tabBarInactiveTintColor: luxuryColors.muted,
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,
        tabBarBackground: () => <LinearGradient colors={luxuryGradient.tab} style={StyleSheet.absoluteFill} />,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '800',
          marginTop: 1,
        },
        tabBarItemStyle: {
          paddingTop: 6,
        },
        tabBarStyle: {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 64 + bottomSafePadding,
          paddingTop: 4,
          paddingBottom: bottomSafePadding,
          borderTopWidth: 1,
          borderTopColor: luxuryColors.border,
          backgroundColor: luxuryColors.background,
          elevation: 0,
          shadowOpacity: 0,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} activeIcon="home" inactiveIcon="home-outline" />,
        }}
      />

      <Tabs.Screen
        name="plan"
        options={{
          title: 'Plan',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} activeIcon="calendar" inactiveIcon="calendar-outline" />,
        }}
      />

      <Tabs.Screen
        name="ai-coach"
        options={{
          title: 'AI Coach',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} activeIcon="chatbubble-ellipses" inactiveIcon="chatbubble-ellipses-outline" />
          ),
        }}
      />

      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} activeIcon="stats-chart" inactiveIcon="stats-chart-outline" />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} activeIcon="person" inactiveIcon="person-outline" />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 30,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    borderRadius: 999,
    backgroundColor: 'rgba(244, 213, 138, 0.08)',
  },
});
