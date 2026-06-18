import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { exactAssets } from '@/assets/exact/assets';
import { ExactCard } from '@/components/exact/ExactCard';
import { ExactHeader } from '@/components/exact/ExactHeader';
import { ExactScreen } from '@/components/exact/ExactScreen';
import { ExactTaskRow } from '@/components/exact/ExactTaskRow';
import { getOrCreateAnonymousUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { exactColors, exactRadius } from '@/theme/exact-match';

type Plan = {
  id: string;
  title: string | null;
  summary: string | null;
  goal: string;
  duration_months: number;
  status: string;
};

type DailyTask = {
  id: string;
  task_type: string;
  title: string;
  description: string | null;
  duration_minutes: number | null;
  calories: number | null;
  is_completed: boolean;
};

type DayChip = {
  key: string;
  label: string;
  date: string;
  active: boolean;
};

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function buildWeekChips(): DayChip[] {
  const today = new Date();
  const dayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1;
  const monday = new Date(today);
  monday.setDate(today.getDate() - dayIndex);

  return ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((label, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);

    return {
      key: `${label}-${date.toISOString()}`,
      label,
      date: String(date.getDate()).padStart(2, '0'),
      active: index === dayIndex,
    };
  });
}

function iconFor(type: string) {
  if (type === 'meal') return exactAssets.icons.meal;
  if (type === 'cardio') return exactAssets.icons.cardio;
  if (type === 'face_yoga') return exactAssets.icons.faceYoga;
  if (type === 'sleep') return exactAssets.icons.moon;
  return exactAssets.icons.workout;
}

function metaFor(task: DailyTask) {
  if (task.task_type === 'sleep') return '8 h';
  if (task.calories) return `${task.calories} KCAL`;
  if (task.duration_minutes) return `${task.duration_minutes} MIN`;
  return undefined;
}

function goalLabel(goal?: string | null) {
  if (!goal) return 'Fit';
  return goal.charAt(0).toUpperCase() + goal.slice(1).replace('_', ' ');
}

const fallbackTasks: DailyTask[] = [
  {
    id: 'fallback-workout',
    task_type: 'workout',
    title: 'Workout',
    description: 'Upper Body Strength',
    duration_minutes: 45,
    calories: null,
    is_completed: false,
  },
  {
    id: 'fallback-meal',
    task_type: 'meal',
    title: 'Meal Plan',
    description: 'High Protein Meal',
    duration_minutes: null,
    calories: 520,
    is_completed: false,
  },
  {
    id: 'fallback-cardio',
    task_type: 'cardio',
    title: 'Cardio',
    description: 'HIIT Session',
    duration_minutes: 20,
    calories: null,
    is_completed: false,
  },
  {
    id: 'fallback-face',
    task_type: 'face_yoga',
    title: 'Face Yoga',
    description: 'Daily Face Routine',
    duration_minutes: 10,
    calories: null,
    is_completed: false,
  },
  {
    id: 'fallback-sleep',
    task_type: 'sleep',
    title: 'Sleep',
    description: '7–8 Hours',
    duration_minutes: 480,
    calories: null,
    is_completed: false,
  },
];

export default function PlanScreen() {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const visibleTasks = tasks.length ? tasks : fallbackTasks;
  const completed = useMemo(() => visibleTasks.filter((task) => task.is_completed).length, [visibleTasks]);
  const progress = visibleTasks.length ? Math.round((completed / visibleTasks.length) * 100) : 0;
  const weekChips = useMemo(() => buildWeekChips(), []);

  useFocusEffect(
    useCallback(() => {
      loadPlan();
    }, [])
  );

  async function loadPlan(refresh = false) {
    try {
      refresh ? setRefreshing(true) : setLoading(true);
      const user = await getOrCreateAnonymousUser();

      const { data: planData } = await supabase
        .from('plans')
        .select('id, title, summary, goal, duration_months, status')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      setPlan(planData as Plan | null);

      if (planData?.id) {
        const { data } = await supabase
          .from('daily_tasks')
          .select('id, task_type, title, description, duration_minutes, calories, is_completed')
          .eq('user_id', user.id)
          .eq('plan_id', planData.id)
          .eq('task_date', todayDate())
          .order('created_at', { ascending: true });

        setTasks((data ?? []) as DailyTask[]);
      } else {
        setTasks([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function toggle(task: DailyTask) {
    if (task.id.startsWith('fallback')) return;

    const next = !task.is_completed;
    setTasks((current) => current.map((item) => (item.id === task.id ? { ...item, is_completed: next } : item)));

    const { error } = await supabase
      .from('daily_tasks')
      .update({ is_completed: next, completed_at: next ? new Date().toISOString() : null })
      .eq('id', task.id);

    if (error) {
      setTasks((current) => current.map((item) => (item.id === task.id ? { ...item, is_completed: task.is_completed } : item)));
    }
  }

  if (loading) {
    return (
      <ExactScreen>
        <View style={styles.center}>
          <ActivityIndicator color={exactColors.goldLight} />
        </View>
      </ExactScreen>
    );
  }

  return (
    <ExactScreen waveMode="home">
      <ExactHeader title="YOUR DAILY PLAN" showBack={false} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadPlan(true)} tintColor={exactColors.goldLight} />
        }
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.daysRow}>
          {weekChips.map((day) => (
            <View key={day.key} style={[styles.dayChip, day.active && styles.dayActive]}>
              <Text style={[styles.dayLabel, day.active && styles.dayActiveText]}>{day.label}</Text>
              <Text style={[styles.dayDate, day.active && styles.dayActiveText]}>{day.date}</Text>
            </View>
          ))}
        </View>

        <ExactCard style={styles.planCard}>
          <View style={styles.planTopRow}>
            <View>
              <Text style={styles.planEyebrow}>ACTIVE TRANSFORMATION</Text>
              <Text style={styles.planTitle}>{plan?.title ?? '4UFitness Transformation'}</Text>
            </View>
            <View style={styles.progressPill}>
              <Text style={styles.progressPillValue}>{progress}%</Text>
              <Text style={styles.progressPillText}>Done</Text>
            </View>
          </View>

          <Text style={styles.planSummary} numberOfLines={2}>
            {plan?.summary ?? 'Today’s system is built around workout, meal, cardio, face yoga and sleep consistency.'}
          </Text>

          <View style={styles.planStats}>
            <View style={styles.planStatBox}>
              <Text style={styles.planStatValue}>{goalLabel(plan?.goal)}</Text>
              <Text style={styles.planStatLabel}>Goal</Text>
            </View>
            <View style={styles.planStatBox}>
              <Text style={styles.planStatValue}>{plan?.duration_months ?? 4}M</Text>
              <Text style={styles.planStatLabel}>Plan</Text>
            </View>
            <View style={styles.planStatBox}>
              <Text style={styles.planStatValue}>{completed}/{visibleTasks.length}</Text>
              <Text style={styles.planStatLabel}>Today</Text>
            </View>
          </View>
        </ExactCard>

        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>TODAY’S PLAN</Text>
          <Text style={styles.sectionMeta}>{completed}/{visibleTasks.length} completed</Text>
        </View>

        <View style={styles.list}>
          {visibleTasks.map((task) => (
            <ExactTaskRow
              key={task.id}
              icon={iconFor(task.task_type)}
              title={task.title}
              subtitle={task.description ?? 'Personalized for today'}
              meta={metaFor(task)}
              completed={task.is_completed}
              onPress={() => toggle(task)}
              compact
              selected={task.is_completed}
            />
          ))}
        </View>

        <ExactCard style={styles.coachHintCard}>
          <Text style={styles.coachHintTitle}>Need a change?</Text>
          <Text style={styles.coachHintText}>
            Ask AI Coach to replace a meal, adjust workout intensity or move your reminder time.
          </Text>
        </ExactCard>
      </ScrollView>
    </ExactScreen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingBottom: 118 },
  daysRow: { flexDirection: 'row', gap: 5, marginTop: 3 },
  dayChip: {
    flex: 1,
    height: 48,
    borderRadius: exactRadius.sm,
    borderWidth: 1,
    borderColor: exactColors.borderSoft,
    backgroundColor: 'rgba(7,31,20,0.76)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayActive: {
    backgroundColor: 'rgba(201,161,90,0.74)',
    borderColor: exactColors.goldLight,
  },
  dayLabel: {
    color: exactColors.goldLight,
    fontSize: 9.6,
    lineHeight: 12,
    fontWeight: '900',
  },
  dayDate: {
    color: exactColors.textSoft,
    fontSize: 14,
    lineHeight: 17,
    fontWeight: '900',
  },
  dayActiveText: { color: exactColors.backgroundDeep },
  planCard: { marginTop: 18, padding: 17 },
  planTopRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, alignItems: 'center' },
  planEyebrow: { color: exactColors.goldLight, fontSize: 10.5, fontWeight: '900', letterSpacing: 1.6 },
  planTitle: { color: exactColors.text, fontSize: 19, lineHeight: 24, fontWeight: '900', marginTop: 7, maxWidth: 235 },
  progressPill: {
    width: 68,
    height: 68,
    borderRadius: exactRadius.full,
    borderWidth: 1,
    borderColor: exactColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(247,217,148,0.07)',
  },
  progressPillValue: { color: exactColors.goldLight, fontSize: 20, fontWeight: '900' },
  progressPillText: { color: exactColors.textSoft, fontSize: 10, fontWeight: '800', marginTop: 1 },
  planSummary: { color: exactColors.textSoft, fontSize: 12.2, lineHeight: 18, fontWeight: '600', marginTop: 13 },
  planStats: { flexDirection: 'row', gap: 8, marginTop: 14 },
  planStatBox: {
    flex: 1,
    minHeight: 60,
    borderRadius: exactRadius.md,
    borderWidth: 1,
    borderColor: exactColors.borderSoft,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.13)',
  },
  planStatValue: { color: exactColors.goldLight, fontSize: 16, fontWeight: '900' },
  planStatLabel: { color: exactColors.textSoft, fontSize: 10.5, fontWeight: '800', marginTop: 3 },
  headerRow: { marginTop: 20, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  sectionTitle: { color: exactColors.goldLight, fontSize: 16, fontWeight: '900', letterSpacing: 0.2 },
  sectionMeta: { color: exactColors.textSoft, fontSize: 11.5, fontWeight: '800' },
  list: { gap: 8 },
  coachHintCard: { marginTop: 15, padding: 16 },
  coachHintTitle: { color: exactColors.goldLight, fontSize: 15, fontWeight: '900' },
  coachHintText: { color: exactColors.textSoft, fontSize: 12, lineHeight: 18, fontWeight: '600', marginTop: 5 },
});
