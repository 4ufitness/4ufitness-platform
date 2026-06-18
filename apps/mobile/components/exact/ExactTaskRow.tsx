import { Image, ImageSourcePropType, Pressable, StyleSheet, Text, View } from 'react-native';

import { exactColors, exactRadius } from '@/theme/exact-match';

type ExactTaskRowProps = {
  icon: ImageSourcePropType;
  title: string;
  subtitle: string;
  meta?: string;
  completed?: boolean;
  onPress?: () => void;
  selected?: boolean;
  compact?: boolean;
};

export function ExactTaskRow({
  icon,
  title,
  subtitle,
  meta,
  completed = false,
  onPress,
  selected = false,
  compact = false,
}: ExactTaskRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        compact && styles.compactRow,
        selected && styles.selected,
        completed && styles.completed,
        pressed && onPress && styles.pressed,
      ]}
    >
      <View style={[styles.iconShell, compact && styles.compactIconShell]}>
        <Image source={icon} style={[styles.icon, compact && styles.compactIcon]} resizeMode="contain" />
      </View>

      <View style={styles.textBox}>
        <Text style={[styles.title, compact && styles.compactTitle]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={[styles.subtitle, compact && styles.compactSubtitle]} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>

      <View style={styles.rightBox}>
        {meta ? (
          <View style={[styles.badge, selected && styles.selectedBadge]}>
            <Text style={[styles.badgeText, selected && styles.selectedBadgeText]}>{meta}</Text>
          </View>
        ) : null}

        {completed ? (
          <View style={styles.doneDot}>
            <Text style={styles.doneText}>✓</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 62,
    borderRadius: exactRadius.md,
    borderWidth: 1,
    borderColor: exactColors.borderSoft,
    backgroundColor: 'rgba(6, 30, 20, 0.80)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    overflow: 'hidden',
  },
  compactRow: {
    minHeight: 55,
    paddingHorizontal: 11,
  },
  selected: {
    borderColor: exactColors.border,
    backgroundColor: 'rgba(13, 43, 28, 0.88)',
  },
  pressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.94,
  },
  completed: {
    opacity: 0.72,
  },
  iconShell: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  compactIconShell: {
    width: 39,
    height: 39,
    marginRight: 10,
  },
  icon: {
    width: 40,
    height: 40,
  },
  compactIcon: {
    width: 36,
    height: 36,
  },
  textBox: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    color: exactColors.text,
    fontSize: 14.4,
    lineHeight: 18,
    fontWeight: '900',
  },
  compactTitle: {
    fontSize: 13.6,
    lineHeight: 17,
  },
  subtitle: {
    color: exactColors.textSoft,
    fontSize: 11.8,
    lineHeight: 16,
    marginTop: 1,
    fontWeight: '600',
  },
  compactSubtitle: {
    fontSize: 11.2,
    lineHeight: 15,
  },
  rightBox: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 6,
  },
  badge: {
    minWidth: 54,
    height: 27,
    borderRadius: exactRadius.full,
    borderWidth: 1,
    borderColor: exactColors.borderSoft,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  selectedBadge: {
    borderColor: exactColors.border,
    backgroundColor: 'rgba(247,217,148,0.07)',
  },
  badgeText: {
    color: exactColors.goldLight,
    fontSize: 10.4,
    fontWeight: '900',
  },
  selectedBadgeText: {
    color: exactColors.champagne,
  },
  doneDot: {
    width: 22,
    height: 22,
    borderRadius: exactRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: exactColors.goldLight,
  },
  doneText: {
    color: exactColors.backgroundDeep,
    fontSize: 14,
    fontWeight: '900',
  },
});
