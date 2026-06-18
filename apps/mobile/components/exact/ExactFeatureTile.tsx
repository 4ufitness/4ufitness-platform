import { Image, ImageSourcePropType, Pressable, StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';

import { exactColors, exactRadius } from '@/theme/exact-match';
import { ExactCard } from './ExactCard';

type ExactFeatureTileProps = {
  icon: ImageSourcePropType;
  title: string;
  subtitle: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  cardStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
  iconSize?: number;
};

export function ExactFeatureTile({
  icon,
  title,
  subtitle,
  onPress,
  style,
  cardStyle,
  titleStyle,
  subtitleStyle,
  iconSize = 49,
}: ExactFeatureTileProps) {
  return (
    <Pressable style={({ pressed }) => [styles.pressable, style, pressed && styles.pressed]} onPress={onPress}>
      <ExactCard style={[styles.card, cardStyle]}>
        <View style={styles.iconHalo}>
          <Image source={icon} style={{ width: iconSize, height: iconSize }} resizeMode="contain" />
        </View>
        <Text style={[styles.title, titleStyle]}>{title}</Text>
        <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text>
      </ExactCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: '48.45%',
  },
  pressed: {
    transform: [{ scale: 0.986 }],
    opacity: 0.94,
  },
  card: {
    height: 132,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: exactRadius.md,
  },
  iconHalo: {
    width: 56,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    color: exactColors.text,
    fontSize: 13.3,
    lineHeight: 17,
    fontWeight: '900',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    color: exactColors.textSoft,
    fontSize: 10.7,
    lineHeight: 14.2,
    marginTop: 2,
    textAlign: 'center',
    fontWeight: '600',
  },
});
