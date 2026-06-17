import { router, useFocusEffect } from 'expo-router';
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

type Profile = {
  id: string;
  age: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  primary_goal: string | null;
  onboarding_completed: boolean | null;
};

type Plan = {
  id: string;
  title: string | null;
  summary: string | null;
  goal: string;
  duration_months: number;
  status: string;
};

type Analysis = {
  id: string;
  confidence_score: number | null;
  recommended_goal: string | null;
  summary: string | null;
  estimated_body_fat: number | null;
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

export default function HomeScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const completedCount = useMemo(
    () => tasks.filter((task) => task.is_completed).length,
    [tasks]
  );

  const dailyFocusPercent = useMemo(() => {
    if (!tasks.length) return 0;
    return Math.round((completedCount / tasks.length) * 100);
  }, [completedCount, tasks.length]);

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [])
  );

  async function loadDashboard(isRefresh = false) {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setErrorMessage(null);

      const user = await getOrCreateAnonymousUser();

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, age, height_cm, weight_kg, primary_goal, onboarding_completed')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      setProfile(profileData as Profile | null);

      const { data: planData, error: planError } = await supabase
        .from('plans')
        .select('id, title, summary, goal, duration_months, status')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (planError) throw planError;

      setPlan(planData as Plan | null);

      const { data: analysisData, error: analysisError } = await supabase
        .from('ai_analyses')
        .select('id, confidence_score, recommended_goal, summary, estimated_body_fat')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (analysisError) throw analysisError;

      setAnalysis(analysisData as Analysis | null);

      if (planData?.id) {
        const today = getTodayDate();

        const { data: tasksData, error: tasksError } = await supabase
          .from('daily_tasks')
          .select(
            'id, task_type, title, description, duration_minutes, calories, is_completed'
          )
          .eq('user_id', user.id)
          .eq('plan_id', planData.id)
          .eq('task_date', today)
          .order('created_at', { ascending: true });

        if (tasksError) throw tasksError;

        setTasks((tasksData ?? []) as DailyTask[]);
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error('HOME_DASHBOARD_LOAD_ERROR', error);
      setErrorMessage('Dashboard could not be loaded. Pull to refresh or try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  async function toggleTask(task: DailyTask) {
    try {
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
      console.error('TASK_TOGGLE_ERROR', error);
      setTasks((current) =>
        current.map((item) =>
          item.id === task.id ? { ...item, is_completed: task.is_completed } : item
        )
      );
    }
  }

  if (isLoading) {
    return (
      <Screen style={styles.centerScreen}>
        <ActivityIndicator size="large" color={colors.goldSoft} />
        <Text style={styles.loadingText}>Loading your transformation system...</Text>
      </Screen>
    );
  }

  if (!plan) {
    return (
      <Screen style={styles.screen}>
        <View style={styles.emptyContent}>
          <Text style={styles.kicker}>WELCOME</Text>
          <Text style={styles.title}>Your AI transformation system is waiting.</Text>
          <Text style={styles.subtitle}>
            Complete your body info and photos to generate your first personal plan.
          </Text>
        </View>

        <PremiumButton
          title="Start Onboarding"
          onPress={() => router.push('/onboarding/body-info')}
        />
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
            onRefresh={() => loadDashboard(true)}
            tintColor={colors.goldSoft}
          />
        }
      >
        <View>
          <Text style={styles.kicker}>TODAY</Text>
          <Text style={styles.title}>Your transformation plan is ready.</Text>
        </View>

        {errorMessage ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <View style={styles.coachCard}>
          <Text style={styles.cardTitle}>AI Coach</Text>
          <Text style={styles.coachText}>
            {tasks[0]?.description ??
              analysis?.summary ??
              'Start today with your personal plan.'}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{dailyFocusPercent}%</Text>
            <Text style={styles.statLabel}>Daily Focus</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {plan.duration_months === 4
                ? '16W'
                : plan.duration_months === 8
                  ? '32W'
                  : '48W'}
            </Text>
            <Text style={styles.statLabel}>Plan Phase</Text>
          </View>
        </View>

        <View style={styles.planCard}>
          <Text style={styles.cardEyebrow}>ACTIVE PLAN</Text>
          <Text style={styles.planTitle}>{plan.title ?? '4UFitness Plan'}</Text>
          <Text style={styles.planSummary}>
            {plan.summary ?? 'Your daily system is personalized for your goal.'}
          </Text>

          <View style={styles.planMetaRow}>
            <View style={styles.metaPill}>
              <Text style={styles.metaText}>{formatGoal(plan.goal)}</Text>
            </View>

            <View style={styles.metaPill}>
              <Text style={styles.metaText}>{plan.duration_months} Months</Text>
            </View>

            {analysis?.confidence_score ? (
              <View style={styles.metaPill}>
                <Text style={styles.metaText}>{analysis.confidence_score}% AI</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today’s Tasks</Text>
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
            >
              <View style={styles.taskIconBox}>
                <Text style={styles.taskIcon}>{getTaskIcon(task.task_type)}</Text>
              </View>

              <View style={styles.taskContent}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.taskDescription} numberOfLines={2}>
                  {task.description ?? 'Personal task for today.'}
                </Text>
              </View>

              <View style={styles.taskStatus}>
                <Text style={styles.taskStatusText}>
                  {task.is_completed ? '✓' : ''}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>

        <PremiumButton title="Open My Plan" onPress={() => router.push('/plan')} />
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
  scrollContent: {
    paddingBottom: 34,
  },
  loadingText: {
    color: colors.muted,
    marginTop: 16,
    fontSize: 15,
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
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -2,
    lineHeight: 50,
    marginTop: 18,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 25,
    marginTop: 16,
  },
  errorCard: {
    marginTop: 22,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,80,80,0.35)',
    backgroundColor: 'rgba(255,80,80,0.08)',
    padding: 16,
  },
  errorText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 21,
  },
  coachCard: {
    marginTop: 34,
    borderRadius: radius.xxl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 27,
    fontWeight: '900',
  },
  coachText: {
    color: colors.muted,
    fontSize: 18,
    lineHeight: 29,
    marginTop: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 18,
  },
  statCard: {
    flex: 1,
    minHeight: 160,
    borderRadius: radius.xxl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 22,
    justifyContent: 'center',
  },
  statValue: {
    color: colors.goldSoft,
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: -1,
  },
  statLabel: {
    color: colors.muted,
    fontSize: 15,
    marginTop: 8,
  },
  planCard: {
    marginTop: 18,
    borderRadius: radius.xxl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 22,
  },
  cardEyebrow: {
    color: colors.goldSoft,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
  },
  planTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
    marginTop: 10,
  },
  planSummary: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 23,
    marginTop: 10,
  },
  planMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 18,
  },
  metaPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  metaText: {
    color: colors.goldSoft,
    fontSize: 12,
    fontWeight: '800',
  },
  sectionHeader: {
    marginTop: 28,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
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
    opacity: 0.72,
  },
  taskIconBox: {
    width: 46,
    height: 46,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskIcon: {
    fontSize: 22,
  },
  taskContent: {
    flex: 1,
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
  taskStatus: {
    width: 28,
    height: 28,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskStatusText: {
    color: colors.goldSoft,
    fontSize: 16,
    fontWeight: '900',
  },
});