import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { luxuryColors, luxuryRadius } from '@/theme/luxury';
import { LuxuryCard } from './LuxuryCard';

type IconTileProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress?: () => void;
  selected?: boolean;
};

export function IconTile({ icon, title, subtitle, onPress, selected = false }: IconTileProps) {
  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      <LuxuryCard selected={selected} style={styles.card} innerStyle={styles.inner}>
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={30} color={luxuryColors.goldLight} />
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </LuxuryCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
  },
  inner: {
    minHeight: 132,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: luxuryRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(246,217,143,0.08)',
    borderWidth: 1,
    borderColor: luxuryColors.border,
    marginBottom: 10,
  },
  title: {
    color: luxuryColors.text,
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    color: luxuryColors.textSoft,
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
});
