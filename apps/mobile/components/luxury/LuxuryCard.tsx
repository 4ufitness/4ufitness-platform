import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { luxuryColors, luxuryGradient, luxuryRadius, luxuryShadow } from '@/theme/luxury';

type LuxuryCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  innerStyle?: StyleProp<ViewStyle>;
  selected?: boolean;
  soft?: boolean;
};

export function LuxuryCard({
  children,
  style,
  innerStyle,
  selected = false,
  soft = false,
}: LuxuryCardProps) {
  return (
    <LinearGradient
      colors={soft ? luxuryGradient.cardSoft : luxuryGradient.card}
      style={[styles.card, selected && styles.cardSelected, style]}
    >
      <View style={[styles.innerLine, innerStyle]}>{children}</View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: luxuryRadius.xl,
    borderWidth: 1,
    borderColor: luxuryColors.border,
    overflow: 'hidden',
    ...luxuryShadow.dark,
  },
  cardSelected: {
    borderColor: luxuryColors.borderStrong,
  },
  innerLine: {
    padding: 18,
    borderRadius: luxuryRadius.xl,
    backgroundColor: 'rgba(255,255,255,0.015)',
  },
});
