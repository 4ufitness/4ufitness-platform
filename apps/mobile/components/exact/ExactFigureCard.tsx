import { Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';

import { exactColors, exactRadius } from '@/theme/exact-match';
import { ExactCard } from './ExactCard';

type ExactFigureCardProps = {
  figure: ImageSourcePropType;
  title: string;
  selected?: boolean;
};

export function ExactFigureCard({ figure, title, selected }: ExactFigureCardProps) {
  return (
    <ExactCard style={styles.card} selected={selected}>
      <Image source={figure} style={styles.figure} resizeMode="contain" />
      <View style={styles.labelBox}>
        <Text style={styles.label}>{title}</Text>
      </View>
    </ExactCard>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    height: 172,
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderRadius: exactRadius.md,
  },
  figure: {
    width: '96%',
    height: 136,
    marginBottom: 0,
  },
  labelBox: {
    width: '100%',
    paddingVertical: 7,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.16)',
  },
  label: {
    color: exactColors.goldLight,
    fontSize: 14,
    fontWeight: '900',
  },
});
