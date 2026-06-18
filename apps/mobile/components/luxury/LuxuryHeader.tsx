import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { luxuryColors, luxuryRadius } from '@/theme/luxury';

type LuxuryHeaderProps = {
  title?: string;
  showBack?: boolean;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
};

export function LuxuryHeader({
  title = '4UFITNESS',
  showBack = false,
  rightIcon,
  onRightPress,
}: LuxuryHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.side}>
        {showBack ? (
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color={luxuryColors.goldLight} />
          </Pressable>
        ) : null}
      </View>

      <Text style={styles.title}>{title}</Text>

      <View style={[styles.side, styles.sideRight]}>
        {rightIcon ? (
          <Pressable style={styles.iconButton} onPress={onRightPress}>
            <Ionicons name={rightIcon} size={21} color={luxuryColors.goldLight} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  side: {
    width: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  sideRight: {
    alignItems: 'flex-end',
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: luxuryRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: luxuryColors.border,
    backgroundColor: 'rgba(246,217,143,0.05)',
  },
  title: {
    flex: 1,
    color: luxuryColors.goldLight,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2.4,
    textAlign: 'center',
  },
});
