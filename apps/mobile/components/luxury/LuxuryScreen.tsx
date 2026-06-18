import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { luxuryColors, luxuryGradient, luxurySpacing } from '@/theme/luxury';

type LuxuryScreenProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

export function LuxuryScreen({ children, style, contentStyle }: LuxuryScreenProps) {
  return (
    <LinearGradient colors={luxuryGradient.screen} style={styles.gradient}>
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />
      <SafeAreaView style={[styles.safe, style]}>
        <View style={[styles.content, contentStyle]}>{children}</View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    backgroundColor: luxuryColors.backgroundDeep,
  },
  safe: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 10 : 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: luxurySpacing.pageX,
  },
  glowTop: {
    position: 'absolute',
    top: -150,
    right: -120,
    width: 300,
    height: 300,
    borderRadius: 999,
    backgroundColor: 'rgba(246,217,143,0.08)',
  },
  glowBottom: {
    position: 'absolute',
    bottom: -180,
    left: -140,
    width: 340,
    height: 340,
    borderRadius: 999,
    backgroundColor: 'rgba(9,81,51,0.26)',
  },
});
