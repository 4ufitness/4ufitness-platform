import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { Platform, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { luxuryGradient, luxurySpacing } from '@/theme/luxury';

type LuxuryScreenProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function LuxuryScreen({ children, style }: LuxuryScreenProps) {
  return (
    <LinearGradient colors={luxuryGradient.screen} style={styles.gradient}>
      <SafeAreaView style={[styles.safe, style]}>{children}</SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safe: {
    flex: 1,
    paddingHorizontal: luxurySpacing.pageX,
    paddingTop: Platform.OS === 'android' ? 12 : 4,
  },
});
