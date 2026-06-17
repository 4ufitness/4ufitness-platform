import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { PremiumButton } from '@/components/ui/PremiumButton';
import { Screen } from '@/components/ui/Screen';
import { getOrCreateAnonymousUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { colors, radius } from '@/theme';

type Plan = {
  id: string;
  title: string | null;
  summary: string | null;
  goal: string;
  duration_months: number;
  status: string;
  plan_data: Record<string, unknown> | null;
};

type DailyTask = {
  id: string;
  task_date: string;
  task_type: string;
  title: string;
  description: string | null;
  duration_minutes: number | null;
  calories: number | null;
  is_completed: boolean;
};

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function formatGoal(goal?: string | null) {
  if (!goal) return 'Fit';

  return goal
    .replace('_', ' ')
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getPlanWeeks(durationMonths: number) {
  if (durationMonths === 4) return 16;
  if (durationMonths === 8) return 32;
  if (durationMonths === 12) return 48;

  return durationMonths * 4;
}

function getTaskIcon(type: string) {
  switch (type) {
    case 'workout':
      return '🏋️';
    case 'meal':
      return '🥗';
    case 'cardio':
      return '❤️';
    case 'face_yoga':
      return '🧘';
    case 'sleep':
      return '🌙';
    case 'motivation':
      return '✨';
    default:
      return '•';
  }
}

function getTaskLabel(type: string) {
  switch (type) {
    case 'workout':
      return 'Workout';
    case 'meal':
      return 'Meal Plan';
    case 'cardio':
      return 'Cardio';
    case 'face_yoga':
      return 'Face Yoga';
    case 'sleep':
      return 'Sleep';
    case 'motivation':
      return 'Motivation';
    default:
      return 'Task';
  }
}

export default function PlanScreen() {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const completedCount = useMemo(
    () => tasks.filter((task) => task.is_completed).length,
    [tasks]
  );

  const progressPercent = useMemo(() => {
    if (!tasks.length) return 0;
    return Math.round((completedCount / tasks.length) * 100);
  }, [completedCount, tasks.length]);

  useFocusEffect(
    useCallback(() => {
      loadPlan();
    }, [])
  );

  async function loadPlan(isRefresh = false) {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const user = await getOrCreateAnonymousUser();

      const { data: planData, error: planError } = await supabase
        .from('plans')
        .select('id, title, summary, goal, duration_months, status, plan_data')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (planError) {
        throw planError;
      }

      setPlan(planData as Plan | null);

      if (!planData?.id) {
        setTasks([]);
        return;
      }

      const today = getTodayDate();

      const { data: taskData, error: taskError } = await supabase
        .from('daily_tasks')
        .select(
          'id, task_date, task_type, title, description, duration_minutes, calories, is_completed'
        )
        .eq('user_id', user.id)
        .eq('plan_id', planData.id)
        .eq('task_date', today)
        .order('created_at', { ascending: true });

      if (taskError) {
        throw taskError;
      }

      setTasks((taskData ?? []) as DailyTask[]);
    } catch (error) {
      console.error('PLAN_LOAD_ERROR', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  async function toggleTask(task: DailyTask) {
    try {
      setIsUpdating(true);

      const nextValue = !task.is_completed;

      setTasks((current) =>
        current.map((item) =>
          item.id === task.id ? { ...item, is_completed: nextValue } : item
        )
      );

      const { error } = await supabase
        .from('daily_tasks')
        .update({
          is_completed: nextValue,
          completed_at: nextValue ? new Date().toISOString() : null,
        })
        .eq('id', task.id);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('PLAN_TASK_TOGGLE_ERROR', error);

      setTasks((current) =>
        current.map((item) =>
          item.id === task.id ? { ...item, is_completed: task.is_completed } : item
        )
      );
    } finally {
      setIsUpdating(false);
    }
  }

  if (isLoading) {
    return (
      <Screen style={styles.centerScreen}>
        <ActivityIndicator size="large" color={colors.goldSoft} />
        <Text style={styles.loadingText}>Loading your plan...</Text>
      </Screen>
    );
  }

  if (!plan) {
    return (
      <Screen style={styles.screen}>
        <View style={styles.emptyContent}>
          <Text style={styles.kicker}>PLAN</Text>
          <Text style={styles.title}>No active plan yet.</Text>
          <Text style={styles.subtitle}>
            Complete your AI analysis to generate your personal transformation plan.
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadPlan(true)}
            tintColor={colors.goldSoft}
          />
        }
      >
        <View>
          <Text style={styles.kicker}>YOUR PLAN</Text>
          <Text style={styles.title}>{plan.title ?? '4UFitness Transformation'}</Text>
          <Text style={styles.subtitle}>
            {plan.summary ?? 'Your daily system is personalized for your goal.'}
          </Text>
        </View>

        <View style={styles.heroCard}>
          <View>
            <Text style={styles.heroEyebrow}>ACTIVE GOAL</Text>
            <Text style={styles.heroGoal}>{formatGoal(plan.goal)}</Text>
          </View>

          <View style={styles.progressCircle}>
            <Text style={styles.progressValue}>{progressPercent}%</Text>
            <Text style={styles.progressLabel}>Today</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{plan.duration_months}M</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{getPlanWeeks(plan.duration_months)}W</Text>
            <Text style={styles.statLabel}>Plan Phase</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {completedCount}/{tasks.length}
            </Text>
            <Text style={styles.statLabel}>Done</Text>
          </View>
        </View>

        <View style={styles.systemCard}>
          <Text style={styles.sectionEyebrow}>DAILY SYSTEM</Text>

          <View style={styles.systemRows}>
            <View style={styles.systemRow}>
              <Text style={styles.systemIcon}>🏋️</Text>
              <View style={styles.systemTextBox}>
                <Text style={styles.systemTitle}>Workout</Text>
                <Text style={styles.systemSubtitle}>Strength and consistency</Text>
              </View>
            </View>

            <View style={styles.systemRow}>
              <Text style={styles.systemIcon}>🥗</Text>
              <View style={styles.systemTextBox}>
                <Text style={styles.systemTitle}>Meal Plan</Text>
                <Text style={styles.systemSubtitle}>High protein balanced nutrition</Text>
              </View>
            </View>

            <View style={styles.systemRow}>
              <Text style={styles.systemIcon}>❤️</Text>
              <View style={styles.systemTextBox}>
                <Text style={styles.systemTitle}>Cardio</Text>
                <Text style={styles.systemSubtitle}>Low impact fat-burning support</Text>
              </View>
            </View>

            <View style={styles.systemRow}>
              <Text style={styles.systemIcon}>🧘</Text>
              <View style={styles.systemTextBox}>
                <Text style={styles.systemTitle}>Face Yoga</Text>
                <Text style={styles.systemSubtitle}>Daily wellness and relaxation</Text>
              </View>
            </View>

            <View style={styles.systemRow}>
              <Text style={styles.systemIcon}>🌙</Text>
              <View style={styles.systemTextBox}>
                <Text style={styles.systemTitle}>Sleep</Text>
                <Text style={styles.systemSubtitle}>Recovery and discipline</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today’s Plan</Text>
          <Text style={styles.sectionMeta}>
            {completedCount}/{tasks.length} completed
          </Text>
        </View>

        <View style={styles.taskList}>
          {tasks.map((task) => (
            <Pressable
              key={task.id}
              style={[styles.taskCard, task.is_completed && styles.taskCardCompleted]}
              onPress={() => toggleTask(task)}
              disabled={isUpdating}
            >
              <View style={styles.taskIconBox}>
                <Text style={styles.taskIcon}>{getTaskIcon(task.task_type)}</Text>
              </View>

              <View style={styles.taskContent}>
                <Text style={styles.taskType}>{getTaskLabel(task.task_type)}</Text>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.taskDescription} numberOfLines={2}>
                  {task.description ?? 'Personal task for today.'}
                </Text>
              </View>

              <View style={styles.taskMeta}>
                {task.duration_minutes ? (
                  <Text style={styles.taskMetaText}>{task.duration_minutes} min</Text>
                ) : task.calories ? (
                  <Text style={styles.taskMetaText}>{task.calories} kcal</Text>
                ) : null}

                <View style={styles.checkCircle}>
                  <Text style={styles.checkText}>{task.is_completed ? '✓' : ''}</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        <PremiumButton title="Refresh Plan" onPress={() => loadPlan(true)} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingTop: 30,
    paddingBottom: 0,
  },
  centerScreen: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.muted,
    marginTop: 16,
    fontSize: 15,
  },
  scrollContent: {
    paddingBottom: 34,
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
  },
  kicker: {
    color: colors.goldSoft,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 4,
  },
  title: {
    color: colors.text,
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: -2,
    lineHeight: 45,
    marginTop: 16,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 25,
    marginTop: 14,
  },
  heroCard: {
    marginTop: 30,
    borderRadius: radius.xxl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroEyebrow: {
    color: colors.goldSoft,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
  },
  heroGoal: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '900',
    marginTop: 8,
  },
  progressCircle: {
    width: 84,
    height: 84,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212,175,55,0.08)',
  },
  progressValue: {
    color: colors.goldSoft,
    fontSize: 22,
    fontWeight: '900',
  },
  progressLabel: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  statCard: {
    flex: 1,
    minHeight: 104,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    justifyContent: 'center',
  },
  statValue: {
    color: colors.goldSoft,
    fontSize: 25,
    fontWeight: '900',
  },
  statLabel: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 5,
  },
  systemCard: {
    marginTop: 16,
    borderRadius: radius.xxl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 22,
  },
  sectionEyebrow: {
    color: colors.goldSoft,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
  },
  systemRows: {
    marginTop: 16,
    gap: 13,
  },
  systemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },
  systemIcon: {
    fontSize: 24,
    width: 34,
  },
  systemTextBox: {
    flex: 1,
  },
  systemTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  systemSubtitle: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 2,
  },
  sectionHeader: {
    marginTop: 28,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  sectionMeta: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  taskList: {
    gap: 12,
    marginBottom: 24,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  taskCardCompleted: {
    opacity: 0.7,
  },
  taskIconBox: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskIcon: {
    fontSize: 23,
  },
  taskContent: {
    flex: 1,
  },
  taskType: {
    color: colors.goldSoft,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 4,
  },
  taskTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  taskDescription: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  taskMeta: {
    alignItems: 'flex-end',
    gap: 8,
  },
  taskMetaText: {
    color: colors.goldSoft,
    fontSize: 11,
    fontWeight: '800',
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    color: colors.goldSoft,
    fontSize: 16,
    fontWeight: '900',
  },
});