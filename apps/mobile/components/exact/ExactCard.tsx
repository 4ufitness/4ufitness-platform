import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { exactColors, exactGradient, exactRadius, exactShadow } from '@/theme/exact-match';

type ExactCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  selected?: boolean;
  glow?: boolean;
};

export function ExactCard({ children, style, selected = false, glow = true }: ExactCardProps) {
  return (
    <LinearGradient
      colors={selected ? exactGradient.cardSelected : exactGradient.card}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, selected && styles.selected, style]}
    >
      {glow ? <View style={styles.innerGlow} /> : null}
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: exactRadius.lg,
    borderWidth: 1,
    borderColor: exactColors.border,
    overflow: 'hidden',
    backgroundColor: 'rgba(7,31,20,0.75)',
    ...exactShadow.card,
  },
  selected: {
    borderColor: exactColors.borderStrong,
  },
  innerGlow: {
    position: 'absolute',
    left: -30,
    top: -30,
    width: 150,
    height: 150,
    borderRadius: 999,
    backgroundColor: 'rgba(39, 107, 72, 0.18)',
  },
});
