import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, radius } from '@/theme';

type PremiumButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: 'gold' | 'dark';
  style?: ViewStyle;
};

export function PremiumButton({ title, onPress, variant = 'gold', style }: PremiumButtonProps) {
  const isGold = variant === 'gold';
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.pressable, pressed && styles.pressed, style]}>
      <LinearGradient
        colors={isGold ? [colors.goldSoft, colors.gold, colors.goldDark] : [colors.surfaceSoft, colors.surface]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.button, !isGold && styles.darkButton]}
      >
        <Text style={[styles.text, !isGold && styles.darkText]}>{title}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: { width: '100%' },
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  button: {
    height: 58,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  darkButton: { borderWidth: 1, borderColor: colors.border },
  text: { color: '#11170F', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
  darkText: { color: colors.text },
});
