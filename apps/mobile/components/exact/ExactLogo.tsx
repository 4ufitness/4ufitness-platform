import { Image, StyleSheet, Text, View } from 'react-native';

import { exactAssets } from '@/assets/exact/assets';
import { exactColors } from '@/theme/exact-match';

type ExactLogoProps = {
  size?: 'word' | 'sm' | 'md' | 'lg';
  wordmark?: boolean;
};

export function ExactLogo({ size = 'md' }: ExactLogoProps) {
  if (size === 'word') {
    return <Text style={styles.wordmark}>4UFITNESS</Text>;
  }

  const imageSize =
    size === 'lg'
      ? { width: 150, height: 104 }
      : size === 'md'
        ? { width: 112, height: 78 }
        : { width: 52, height: 38 };

  return (
    <View style={styles.wrap}>
      <Image source={exactAssets.logo.full} style={[styles.image, imageSize]} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    opacity: 0.99,
  },
  wordmark: {
    color: exactColors.goldLight,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '900',
    letterSpacing: 1.8,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
