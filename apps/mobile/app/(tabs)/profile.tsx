import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { exactAssets } from '@/assets/exact/assets';
import { ExactGoldButton } from '@/components/exact/ExactGoldButton';
import { ExactHeader } from '@/components/exact/ExactHeader';
import { ExactScreen } from '@/components/exact/ExactScreen';
import { getOrCreateAnonymousUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { exactColors, exactRadius, exactShadow } from '@/theme/exact-match';

type Reminder = {
  id: string;
  icon: number;
  time: string;
  title: string;
  subtitle: string;
  enabled: boolean;
};

type Profile = {
  age: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  primary_goal: string | null;
  onboarding_completed: boolean | null;
};

type Plan = {
  title: string | null;
  duration_months: number | null;
  goal: string | null;
  status: string | null;
};

type Analysis = {
  confidence_score: number | null;
  estimated_body_fat: number | null;
  body_type: string | null;
  recommended_goal: string | null;
};

const initialReminders: Reminder[] = [
  {
    id: 'wake',
    icon: exactAssets.icons.bell,
    time: '06:00',
    title: 'Wake Up Alarm',
    subtitle: 'Start your transformation day',
    enabled: true,
  },
  {
    id: 'water',
    icon: exactAssets.icons.water,
    time: '07:00',
    title: 'Drink Water',
    subtitle: 'Hydration target reminder',
    enabled: true,
  },
  {
    id: 'lunch',
    icon: exactAssets.icons.lunch,
    time: '12:30',
    title: 'Lunch Reminder',
    subtitle: 'High-protein meal check',
    enabled: true,
  },
  {
    id: 'workout',
    icon: exactAssets.icons.workout,
    time: '17:00',
    title: 'Workout Time',
    subtitle: 'Daily strength session',
    enabled: true,
  },
  {
    id: 'sleep',
    icon: exactAssets.icons.moon,
    time: '22:00',
    title: 'Sleep Reminder',
    subtitle: 'Recovery and consistency',
    enabled: true,
  },
];

function formatGoal(goal?: string | null) {
  return (goal ?? 'fit').replace('_', ' ').toUpperCase();
}

function formatBodyType(value?: string | null) {
  if (!value) return 'Balanced';

  return value
    .replace('_', ' ')
    .split(' ')
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
    .join(' ');
}

function getPlanWeeks(months?: number | null) {
  if (!months) return 16;
  return months * 4;
}

export default function ProfileScreen() {
  const [reminders, setReminders] = useState(initialReminders);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  const activeCount = useMemo(() => reminders.filter((item) => item.enabled).length, [reminders]);
  const bottomPadding = Math.max(insets.bottom, 24) + 100;

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  async function loadProfile(isRefresh = false) {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const user = await getOrCreateAnonymousUser();

      const [{ data: profileData }, { data: planData }, { data: analysisData }] = await Promise.all([
        supabase
          .from('profiles')
          .select('age, height_cm, weight_kg, primary_goal, onboarding_completed')
          .eq('id', user.id)
          .maybeSingle(),
        supabase
          .from('plans')
          .select('title, duration_months, goal, status')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('ai_analyses')
          .select('confidence_score, estimated_body_fat, body_type, recommended_goal')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      setProfile(profileData as Profile | null);
      setPlan(planData as Plan | null);
      setAnalysis(analysisData as Analysis | null);
    } catch (error) {
      console.error('PROFILE_LOAD_ERROR', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function toggleReminder(id: string) {
    setReminders((current) =>
      current.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item))
    );
  }

  if (loading) {
    return (
      <ExactScreen waveMode="home">
        <View style={styles.center}>
          <ActivityIndicator color={exactColors.goldLight} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </ExactScreen>
    );
  }

  return (
    <ExactScreen waveMode="home">
      <ExactHeader title="PROFILE" showBack={false} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPadding }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadProfile(true)}
            tintColor={exactColors.goldLight}
          />
        }
      >
        <View style={styles.profileHero}>
          <View style={styles.avatar}>
            <Image source={exactAssets.logo.mark} style={styles.avatarLogo} resizeMode="contain" />
          </View>

          <View style={styles.profileHeroText}>
            <Text style={styles.profileEyebrow}>4UFITNESS MEMBER</Text>
            <Text style={styles.profileName}>Your AI Transformation</Text>
            <Text style={styles.profileSummary}>
              {plan?.title ?? 'Complete your analysis to activate your full plan.'}
            </Text>
          </View>
        </View>

        <View style={styles.statGrid}>
          <StatCard title="Goal" value={formatGoal(plan?.goal ?? profile?.primary_goal ?? analysis?.recommended_goal)} />
          <StatCard title="Score" value={`${analysis?.confidence_score ?? 72}/100`} />
          <StatCard title="Body Fat" value={`${analysis?.estimated_body_fat ?? 18.5}%`} />
          <StatCard title="Plan" value={`${getPlanWeeks(plan?.duration_months)}W`} />
        </View>

        <View style={styles.dataCard}>
          <Text style={styles.dataTitle}>Body Data</Text>
          <View style={styles.dataRows}>
            <DataRow label="Age" value={profile?.age ? `${profile.age}` : '—'} />
            <DataRow label="Height" value={profile?.height_cm ? `${profile.height_cm} cm` : '—'} />
            <DataRow label="Weight" value={profile?.weight_kg ? `${profile.weight_kg} kg` : '—'} />
            <DataRow label="Body Type" value={formatBodyType(analysis?.body_type)} />
          </View>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryTextBox}>
            <Text style={styles.summaryEyebrow}>SMART ASSISTANT</Text>
            <Text style={styles.summaryTitle}>{activeCount} active reminders</Text>
            <Text style={styles.summaryText}>
              Wake up, meals, workout, hydration and sleep reminders keep your day on track.
            </Text>
          </View>
          <View style={styles.summaryBadge}>
            <Image source={exactAssets.icons.bell} style={styles.summaryIcon} resizeMode="contain" />
          </View>
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.section}>Today's Reminders</Text>
          <Text style={styles.sectionMeta}>ON/OFF</Text>
        </View>

        <View style={styles.list}>
          {reminders.map((item) => (
            <ReminderRow key={item.id} item={item} onToggle={() => toggleReminder(item.id)} />
          ))}
        </View>

        <ExactGoldButton title="＋  Add Reminder" onPress={() => {}} style={styles.button} />

        <View style={styles.settingsGrid}>
          <View style={styles.settingCard}>
            <Text style={styles.settingValue}>500+</Text>
            <Text style={styles.settingLabel}>Motivation messages</Text>
          </View>
          <View style={styles.settingCard}>
            <Text style={styles.settingValue}>AI</Text>
            <Text style={styles.settingLabel}>Adaptive timing</Text>
          </View>
        </View>
      </ScrollView>
    </ExactScreen>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.statLabel}>{title}</Text>
    </View>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.dataRow}>
      <Text style={styles.dataLabel}>{label}</Text>
      <Text style={styles.dataValue}>{value}</Text>
    </View>
  );
}

function ReminderRow({ item, onToggle }: { item: Reminder; onToggle: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        !item.enabled && styles.rowDisabled,
        pressed && styles.pressed,
      ]}
      onPress={onToggle}
    >
      <View style={styles.iconBox}>
        <Image source={item.icon} style={styles.icon} resizeMode="contain" />
      </View>

      <Text style={styles.time}>{item.time}</Text>

      <View style={styles.rowTextBox}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </View>

      <View style={[styles.toggle, item.enabled && styles.toggleOn]}>
        <View style={[styles.toggleDot, item.enabled && styles.toggleDotOn]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: exactColors.textSoft,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 12,
  },
  scroll: {
    paddingTop: 2,
  },
  profileHero: {
    minHeight: 142,
    borderRadius: exactRadius.xl,
    borderWidth: 1,
    borderColor: exactColors.border,
    backgroundColor: 'rgba(7,31,20,0.78)',
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    ...exactShadow.card,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: exactColors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(248,223,161,0.07)',
  },
  avatarLogo: {
    width: 52,
    height: 52,
  },
  profileHeroText: {
    flex: 1,
  },
  profileEyebrow: {
    color: exactColors.goldLight,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.6,
  },
  profileName: {
    color: exactColors.text,
    fontSize: 22,
    lineHeight: 27,
    fontWeight: '900',
    marginTop: 7,
  },
  profileSummary: {
    color: exactColors.textSoft,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
    marginTop: 6,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  statCard: {
    width: '48.5%',
    minHeight: 82,
    borderRadius: exactRadius.lg,
    borderWidth: 1,
    borderColor: exactColors.border,
    backgroundColor: 'rgba(7,31,20,0.68)',
    padding: 14,
    justifyContent: 'center',
    ...exactShadow.card,
  },
  statValue: {
    color: exactColors.goldLight,
    fontSize: 21,
    fontWeight: '900',
  },
  statLabel: {
    color: exactColors.textSoft,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  dataCard: {
    marginTop: 13,
    borderRadius: exactRadius.xl,
    borderWidth: 1,
    borderColor: exactColors.border,
    backgroundColor: 'rgba(7,31,20,0.72)',
    padding: 17,
    ...exactShadow.card,
  },
  dataTitle: {
    color: exactColors.goldLight,
    fontSize: 16,
    fontWeight: '900',
  },
  dataRows: {
    marginTop: 11,
    gap: 8,
  },
  dataRow: {
    minHeight: 42,
    borderRadius: exactRadius.md,
    borderWidth: 1,
    borderColor: exactColors.borderSoft,
    backgroundColor: 'rgba(0,0,0,0.15)',
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dataLabel: {
    color: exactColors.textSoft,
    fontSize: 13,
    fontWeight: '700',
  },
  dataValue: {
    color: exactColors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  summaryCard: {
    minHeight: 124,
    borderRadius: exactRadius.xl,
    borderWidth: 1,
    borderColor: exactColors.border,
    backgroundColor: 'rgba(7,31,20,0.76)',
    padding: 17,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 13,
    ...exactShadow.card,
  },
  summaryTextBox: {
    flex: 1,
  },
  summaryEyebrow: {
    color: exactColors.goldLight,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2.0,
  },
  summaryTitle: {
    color: exactColors.text,
    fontSize: 24,
    fontWeight: '900',
    marginTop: 8,
    letterSpacing: -0.6,
  },
  summaryText: {
    color: exactColors.textSoft,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
    marginTop: 6,
  },
  summaryBadge: {
    width: 64,
    height: 64,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: exactColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(248,223,161,0.06)',
  },
  summaryIcon: {
    width: 38,
    height: 38,
  },
  sectionRow: {
    marginTop: 22,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  section: {
    color: exactColors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  sectionMeta: {
    color: exactColors.muted,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  list: {
    gap: 9,
  },
  row: {
    minHeight: 66,
    borderRadius: exactRadius.md,
    borderWidth: 1,
    borderColor: exactColors.border,
    backgroundColor: 'rgba(7,31,20,0.78)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    ...exactShadow.card,
  },
  rowDisabled: {
    opacity: 0.54,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: exactRadius.md,
    borderWidth: 1,
    borderColor: exactColors.borderSoft,
    backgroundColor: 'rgba(248,223,161,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    width: 29,
    height: 29,
  },
  time: {
    width: 56,
    color: exactColors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  rowTextBox: {
    flex: 1,
  },
  title: {
    color: exactColors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  subtitle: {
    color: exactColors.textSoft,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '600',
    marginTop: 2,
  },
  toggle: {
    width: 42,
    height: 24,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: exactColors.borderSoft,
    backgroundColor: 'rgba(0,0,0,0.20)',
    justifyContent: 'center',
    paddingHorizontal: 3,
    marginLeft: 10,
  },
  toggleOn: {
    borderColor: exactColors.borderStrong,
    backgroundColor: 'rgba(201,155,83,0.34)',
  },
  toggleDot: {
    width: 17,
    height: 17,
    borderRadius: 999,
    backgroundColor: exactColors.muted,
  },
  toggleDotOn: {
    alignSelf: 'flex-end',
    backgroundColor: exactColors.goldLight,
  },
  button: {
    marginTop: 22,
  },
  settingsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  settingCard: {
    flex: 1,
    minHeight: 92,
    borderRadius: exactRadius.lg,
    borderWidth: 1,
    borderColor: exactColors.border,
    backgroundColor: 'rgba(7,31,20,0.70)',
    padding: 14,
    justifyContent: 'center',
  },
  settingValue: {
    color: exactColors.goldLight,
    fontSize: 25,
    fontWeight: '900',
  },
  settingLabel: {
    color: exactColors.textSoft,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
    marginTop: 4,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.992 }],
  },
});
