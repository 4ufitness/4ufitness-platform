import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';

import { exactColors, exactGradient, exactRadius, exactShadow } from '@/theme/exact-match';

type ExactGoldButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  buttonStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  lightText?: boolean;
};

export function ExactGoldButton({
  title,
  onPress,
  disabled = false,
  style,
  buttonStyle,
  textStyle,
  lightText = false,
}: ExactGoldButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.pressable,
        style,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <LinearGradient colors={exactGradient.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.button, buttonStyle]}>
        <View style={styles.innerGlow} />
        <Text style={[styles.text, lightText && styles.lightText, textStyle]}>{title}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    borderRadius: exactRadius.full,
    overflow: 'hidden',
    ...exactShadow.gold,
  },
  pressed: {
    transform: [{ scale: 0.986 }],
    opacity: 0.93,
  },
  disabled: {
    opacity: 0.55,
  },
  button: {
    height: 54,
    borderRadius: exactRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
    overflow: 'hidden',
  },
  innerGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '46%',
    backgroundColor: 'rgba(255,255,255,0.13)',
  },
  text: {
    color: exactColors.backgroundDeep,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.05,
  },
  lightText: {
    color: exactColors.text,
    fontWeight: '600',
  },
});
