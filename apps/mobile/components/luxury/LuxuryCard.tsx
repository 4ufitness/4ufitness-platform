import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';

import { luxuryColors, luxuryGradient, luxuryRadius, luxuryShadow } from '@/theme/luxury';

type LuxuryCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  selected?: boolean;
};

export function LuxuryCard({ children, style, selected = false }: LuxuryCardProps) {
  return (
    <LinearGradient colors={luxuryGradient.card} style={[styles.card, selected && styles.cardSelected, style]}>
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: luxuryRadius.xl,
    borderWidth: 1,
    borderColor: luxuryColors.border,
    padding: 18,
    overflow: 'hidden',
    ...luxuryShadow.dark,
  },
  cardSelected: {
    borderColor: luxuryColors.borderStrong,
    backgroundColor: 'rgba(244, 213, 138, 0.06)',
  },
});
