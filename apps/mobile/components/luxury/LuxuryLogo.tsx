import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { luxuryColors, luxuryGradient } from '@/theme/luxury';

type LuxuryLogoProps = {
  size?: 'sm' | 'lg';
};

export function LuxuryLogo({ size = 'lg' }: LuxuryLogoProps) {
  const isLarge = size === 'lg';

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={luxuryGradient.gold}
        style={[
          styles.mark,
          {
            width: isLarge ? 92 : 46,
            height: isLarge ? 64 : 34,
          },
        ]}
      >
        <Text style={[styles.markText, { fontSize: isLarge ? 40 : 21 }]}>4U</Text>
      </LinearGradient>

      <Text style={[styles.name, { fontSize: isLarge ? 17 : 12 }]}>4UFITNESS</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  mark: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: luxuryColors.gold,
  },
  markText: {
    color: luxuryColors.backgroundDeep,
    fontWeight: '900',
    letterSpacing: -2,
  },
  name: {
    marginTop: 8,
    color: luxuryColors.goldLight,
    fontWeight: '900',
    letterSpacing: 2.2,
  },
});
