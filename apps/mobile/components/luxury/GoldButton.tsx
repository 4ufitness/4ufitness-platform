import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text } from 'react-native';

import { luxuryColors, luxuryGradient, luxuryRadius, luxuryShadow } from '@/theme/luxury';

type GoldButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
};

export function GoldButton({ title, onPress, disabled = false }: GoldButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.pressable, pressed && !disabled && styles.pressed, disabled && styles.disabled]}
    >
      <LinearGradient colors={luxuryGradient.gold} style={styles.button}>
        <Text style={styles.text}>{title}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    borderRadius: luxuryRadius.full,
    overflow: 'hidden',
    ...luxuryShadow.goldGlow,
  },
  pressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.92,
  },
  disabled: {
    opacity: 0.55,
  },
  button: {
    height: 58,
    borderRadius: luxuryRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  text: {
    color: luxuryColors.backgroundDeep,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
});
