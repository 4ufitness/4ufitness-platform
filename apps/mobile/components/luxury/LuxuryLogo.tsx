import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { luxuryColors, luxuryGradient } from '@/theme/luxury';

type LuxuryLogoProps = {
  size?: 'sm' | 'md' | 'lg';
};

export function LuxuryLogo({ size = 'lg' }: LuxuryLogoProps) {
  const dimensions = {
    sm: { markW: 48, markH: 34, markText: 21, name: 12 },
    md: { markW: 72, markH: 50, markText: 31, name: 14 },
    lg: { markW: 104, markH: 72, markText: 43, name: 17 },
  }[size];

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={luxuryGradient.gold}
        style={[styles.mark, { width: dimensions.markW, height: dimensions.markH }]}
      >
        <Text style={[styles.markText, { fontSize: dimensions.markText }]}>4U</Text>
      </LinearGradient>

      <Text style={[styles.name, { fontSize: dimensions.name }]}>4UFITNESS</Text>
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
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
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
    letterSpacing: 2.4,
  },
});
