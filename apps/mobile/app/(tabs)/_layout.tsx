import { Image, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { exactAssets } from '@/assets/exact/assets';
import { exactColors, exactGradient } from '@/theme/exact-match';

const tabs = {
  home: exactAssets.icons.home,
  plan: exactAssets.icons.plan,
  progress: exactAssets.icons.progress,
  profile: exactAssets.icons.profile,
};

function TabIcon({ focused, icon }: { focused: boolean; icon: any }) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Image source={icon} style={[styles.icon, !focused && styles.iconInactive]} resizeMode="contain" />
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const bottomSafePadding = Platform.OS === 'android' ? Math.max(insets.bottom, 34) : Math.max(insets.bottom, 14);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: exactColors.goldLight,
        tabBarInactiveTintColor: exactColors.muted,
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,
        tabBarBackground: () => <LinearGradient colors={exactGradient.tab} style={StyleSheet.absoluteFill} />,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '900', marginTop: 0 },
        tabBarItemStyle: { paddingTop: 7 },
        tabBarStyle: {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 64 + bottomSafePadding,
          paddingTop: 3,
          paddingBottom: bottomSafePadding,
          borderTopWidth: 1,
          borderTopColor: exactColors.border,
          backgroundColor: exactColors.background,
          elevation: 0,
          shadowOpacity: 0,
        },
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Home', tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={tabs.home} /> }} />
      <Tabs.Screen name="plan" options={{ title: 'Plan', tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={tabs.plan} /> }} />
      <Tabs.Screen name="ai-coach" options={{ href: null }} />
      <Tabs.Screen name="progress" options={{ title: 'Progress', tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={tabs.progress} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={tabs.profile} /> }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: { width: 34, height: 28, alignItems: 'center', justifyContent: 'center' },
  iconWrapActive: { borderRadius: 999, backgroundColor: 'rgba(246,217,143,0.08)' },
  icon: { width: 25, height: 25 },
  iconInactive: { opacity: 0.54 },
});
