import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { luxuryColors, luxuryRadius } from '@/theme/luxury';
import { LuxuryCard } from './LuxuryCard';

type LuxuryMetricCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
};

export function LuxuryMetricCard({ icon, value, label }: LuxuryMetricCardProps) {
  return (
    <LuxuryCard style={styles.card} innerStyle={styles.inner}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={21} color={luxuryColors.goldLight} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </LuxuryCard>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
  },
  inner: {
    minHeight: 104,
    justifyContent: 'center',
    padding: 15,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: luxuryRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(246,217,143,0.08)',
    borderWidth: 1,
    borderColor: luxuryColors.border,
    marginBottom: 9,
  },
  value: {
    color: luxuryColors.goldLight,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  label: {
    color: luxuryColors.textSoft,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
});
