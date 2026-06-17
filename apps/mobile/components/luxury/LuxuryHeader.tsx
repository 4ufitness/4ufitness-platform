import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { luxuryColors, luxuryRadius } from '@/theme/luxury';

type LuxuryHeaderProps = {
  title?: string;
  showBack?: boolean;
  centered?: boolean;
};

export function LuxuryHeader({ title = '4UFITNESS', showBack = false, centered = true }: LuxuryHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.side}>
        {showBack ? (
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color={luxuryColors.goldLight} />
          </Pressable>
        ) : null}
      </View>

      <Text style={[styles.title, centered && styles.centered]}>{title}</Text>

      <View style={styles.side} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  side: {
    width: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: luxuryRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    color: luxuryColors.goldLight,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.8,
  },
  centered: {
    textAlign: 'center',
  },
});
