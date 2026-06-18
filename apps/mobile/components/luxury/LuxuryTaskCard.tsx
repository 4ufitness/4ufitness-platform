import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { luxuryColors, luxuryRadius } from '@/theme/luxury';
import { LuxuryCard } from './LuxuryCard';

type LuxuryTaskCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  meta?: string;
  completed?: boolean;
  onPress?: () => void;
};

export function LuxuryTaskCard({
  icon,
  title,
  subtitle,
  meta,
  completed = false,
  onPress,
}: LuxuryTaskCardProps) {
  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      <LuxuryCard style={[styles.card, completed && styles.completed]} innerStyle={styles.inner}>
        <View style={styles.iconBox}>
          <Ionicons name={icon} size={24} color={luxuryColors.goldLight} />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        </View>

        <View style={styles.right}>
          {meta ? <Text style={styles.meta}>{meta}</Text> : null}
          <View style={[styles.checkCircle, completed && styles.checkCircleDone]}>
            {completed ? (
              <Ionicons name="checkmark" size={17} color={luxuryColors.backgroundDeep} />
            ) : null}
          </View>
        </View>
      </LuxuryCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  inner: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    padding: 13,
  },
  completed: {
    opacity: 0.72,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: luxuryRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(246,217,143,0.08)',
    borderWidth: 1,
    borderColor: luxuryColors.border,
  },
  content: {
    flex: 1,
  },
  title: {
    color: luxuryColors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  subtitle: {
    color: luxuryColors.textSoft,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
  right: {
    alignItems: 'flex-end',
    gap: 7,
  },
  meta: {
    color: luxuryColors.goldLight,
    fontSize: 10,
    fontWeight: '900',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: luxuryRadius.full,
    borderWidth: 1,
    borderColor: luxuryColors.borderStrong,
    backgroundColor: 'rgba(246,217,143,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleDone: {
    backgroundColor: luxuryColors.goldLight,
  },
});
