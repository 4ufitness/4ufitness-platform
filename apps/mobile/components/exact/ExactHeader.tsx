import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { exactColors, exactRadius, exactType } from '@/theme/exact-match';

type ExactHeaderProps = {
  title: string;
  showBack?: boolean;
  progress?: number;
};

export function ExactHeader({ title, showBack = true, progress }: ExactHeaderProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View style={styles.side}>
          {showBack ? (
            <Pressable style={styles.back} onPress={() => router.back()}>
              <Text style={styles.backText}>‹</Text>
            </Pressable>
          ) : null}
        </View>

        <Text style={styles.title} numberOfLines={2}>{title}</Text>

        <View style={styles.side} />
      </View>

      {typeof progress === 'number' ? (
        <View style={styles.progressTrack}>
          {[0, 1, 2, 3].map((item) => {
            const active = progress >= (item + 1) / 4 || progress > item / 4;
            return <View key={item} style={[styles.progressSegment, active && styles.progressActive]} />;
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 12,
    marginBottom: 18,
  },
  row: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
  },
  side: {
    width: 42,
  },
  back: {
    width: 36,
    height: 36,
    borderRadius: exactRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: exactColors.goldLight,
    fontSize: 32,
    lineHeight: 32,
    fontWeight: '300',
  },
  title: {
    flex: 1,
    ...exactType.screenTitle,
    color: exactColors.goldLight,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  progressTrack: {
    alignSelf: 'center',
    marginTop: 12,
    width: 196,
    height: 6,
    flexDirection: 'row',
    gap: 4,
  },
  progressSegment: {
    flex: 1,
    borderRadius: 999,
    backgroundColor: 'rgba(246,217,143,0.16)',
  },
  progressActive: {
    backgroundColor: exactColors.goldLight,
  },
});
