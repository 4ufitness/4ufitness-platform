import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  luxuryColors,
  luxuryGradient,
  luxuryRadius,
  luxuryShadow,
} from '@/theme/luxury';

type GoldButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'solid' | 'outline';
};

export function GoldButton({
  title,
  onPress,
  disabled = false,
  variant = 'solid',
}: GoldButtonProps) {
  const isOutline = variant === 'outline';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.pressable,
        isOutline && styles.outlinePressable,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      {isOutline ? (
        <View style={styles.outlineButton}>
          <Text style={styles.outlineText}>{title}</Text>
        </View>
      ) : (
        <LinearGradient colors={luxuryGradient.gold} style={styles.button}>
          <Text style={styles.text}>{title}</Text>
        </LinearGradient>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    borderRadius: luxuryRadius.full,
    overflow: 'hidden',
    ...luxuryShadow.goldGlow,
  },
  outlinePressable: {
    shadowOpacity: 0,
    elevation: 0,
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
  outlineButton: {
    height: 56,
    borderRadius: luxuryRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: luxuryColors.borderStrong,
    backgroundColor: 'rgba(246,217,143,0.045)',
  },
  text: {
    color: luxuryColors.backgroundDeep,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  outlineText: {
    color: luxuryColors.goldLight,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
});
