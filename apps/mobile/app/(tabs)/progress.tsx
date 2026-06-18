import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { exactAssets } from '@/assets/exact/assets';
import { ExactCard } from '@/components/exact/ExactCard';
import { ExactHeader } from '@/components/exact/ExactHeader';
import { ExactScreen } from '@/components/exact/ExactScreen';
import { getOrCreateAnonymousUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { exactColors, exactRadius, exactShadow } from '@/theme/exact-match';

type Task = {
  id: string;
  task_type: string;
  is_completed: boolean;
};

type Analysis = {
  confidence_score: number | null;
  estimated_body_fat: number | null;
  recommended_goal: string | null;
  body_type: string | null;
};

type Profile = {
  age: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  primary_goal: string | null;
};

type Plan = {
  title: string | null;
  duration_months: number | null;
  goal: string | null;
  status: string | null;
};

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

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

export default function ProgressScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  const completedCount = useMemo(
    () => tasks.filter((task) => task.is_completed).length,
    [tasks]
  );

  const dailyPercent = useMemo(() => {
    if (!tasks.length) return 0;
    return Math.round((completedCount / tasks.length) * 100);
  }, [completedCount, tasks.length]);

  const transformationScore = useMemo(() => {
    const aiScore = analysis?.confidence_score ?? 72;
    if (!tasks.length) return aiScore;

    return Math.min(100, Math.round(aiScore * 0.7 + dailyPercent * 0.3));
  }, [analysis?.confidence_score, dailyPercent, tasks.length]);

  const bottomPadding = Math.max(insets.bottom, 24) + 100;

  useFocusEffect(
    useCallback(() => {
      loadProgress();
    }, [])
  );

  async function loadProgress(isRefresh = false) {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const user = await getOrCreateAnonymousUser();
      const today = getTodayDate();

      const [{ data: taskData }, { data: analysisData }, { data: profileData }, { data: planData }] =
        await Promise.all([
          supabase
            .from('daily_tasks')
            .select('id, task_type, is_completed')
            .eq('user_id', user.id)
            .eq('task_date', today)
            .order('created_at', { ascending: true }),
          supabase
            .from('ai_analyses')
            .select('confidence_score, estimated_body_fat, recommended_goal, body_type')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle(),
          supabase
            .from('profiles')
            .select('age, height_cm, weight_kg, primary_goal')
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
        ]);

      setTasks((taskData ?? []) as Task[]);
      setAnalysis(analysisData as Analysis | null);
      setProfile(profileData as Profile | null);
      setPlan(planData as Plan | null);
    } catch (error) {
      console.error('PROGRESS_LOAD_ERROR', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  if (loading) {
    return (
      <ExactScreen waveMode="home">
        <View style={styles.center}>
          <ActivityIndicator color={exactColors.goldLight} />
          <Text style={styles.loadingText}>Loading your progress...</Text>
        </View>
      </ExactScreen>
    );
  }

  return (
    <ExactScreen waveMode="home">
      <ExactHeader title="YOUR PROGRESS" showBack={false} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPadding }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadProgress(true)}
            tintColor={exactColors.goldLight}
          />
        }
      >
        <ExactCard style={styles.hero}>
          <View style={styles.heroTopRow}>
            <View style={styles.scoreTextBox}>
              <Text style={styles.heroKicker}>AI TRANSFORMATION SCORE</Text>
              <View style={styles.scoreRow}>
                <Text style={styles.heroScore}>{transformationScore}</Text>
                <Text style={styles.heroMax}>/100</Text>
              </View>
            </View>

            <View style={styles.scoreRing}>
              <View style={styles.scoreRingInner}>
                <Text style={styles.scoreRingText}>{dailyPercent}%</Text>
                <Text style={styles.scoreRingLabel}>daily</Text>
              </View>
            </View>
          </View>

          <Text style={styles.heroText}>
            Your score updates with today’s workout, meal, cardio, face yoga and sleep tasks.
          </Text>
        </ExactCard>

        <View style={styles.statsRow}>
          <Stat title="Daily" value={`${dailyPercent}%`} />
          <Stat title="Body Fat" value={`${analysis?.estimated_body_fat ?? 18.5}%`} />
          <Stat title="Goal" value={formatGoal(plan?.goal ?? profile?.primary_goal ?? analysis?.recommended_goal)} />
        </View>

        <View style={styles.statsRowCompact}>
          <InfoPill title="Body Type" value={formatBodyType(analysis?.body_type)} />
          <InfoPill title="Plan" value={`${getPlanWeeks(plan?.duration_months)} weeks`} />
          <InfoPill title="Weight" value={profile?.weight_kg ? `${profile.weight_kg} kg` : '—'} />
        </View>

        <ExactCard style={styles.chartBox}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.chartTitle}>Transformation Curve</Text>
              <Text style={styles.chartSubtitle}>{plan?.title ?? '4UFitness transformation plan'}</Text>
            </View>
            <View style={styles.phaseBadge}>
              <Text style={styles.phaseText}>{getPlanWeeks(plan?.duration_months)}W</Text>
            </View>
          </View>

          <View style={styles.chartImageWrap}>
            <Image
              source={exactAssets.ui.chartGrowth}
              style={styles.chartImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.weekRow}>
            {['W1', 'W2', 'W3', 'W4', 'W5', 'W6'].map((week) => (
              <Text key={week} style={styles.weekText}>
                {week}
              </Text>
            ))}
          </View>
        </ExactCard>

        <ExactCard style={styles.consistencyCard}>
          <Text style={styles.consistencyTitle}>Today’s Consistency</Text>
          <Text style={styles.consistencyText}>
            {completedCount}/{tasks.length || 5} tasks completed. Complete the full daily system to keep
            your transformation score moving.
          </Text>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${dailyPercent}%` }]} />
          </View>
        </ExactCard>
      </ScrollView>
    </ExactScreen>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );
}

function InfoPill({ title, value }: { title: string; value: string }) {
  return (
    <View style={styles.infoPill}>
      <Text style={styles.infoTitle}>{title}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
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
  hero: {
    minHeight: 184,
    padding: 20,
    justifyContent: 'center',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 18,
  },
  scoreTextBox: {
    flex: 1,
  },
  heroKicker: {
    color: exactColors.goldLight,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 9,
  },
  heroScore: {
    color: exactColors.text,
    fontSize: 58,
    lineHeight: 62,
    fontWeight: '300',
  },
  heroMax: {
    color: exactColors.text,
    fontSize: 19,
    fontWeight: '900',
    marginBottom: 9,
    marginLeft: 3,
  },
  scoreRing: {
    width: 88,
    height: 88,
    borderRadius: 999,
    borderWidth: 9,
    borderTopColor: exactColors.goldLight,
    borderRightColor: exactColors.gold,
    borderBottomColor: 'rgba(247,217,148,0.18)',
    borderLeftColor: 'rgba(247,217,148,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '32deg' }],
  },
  scoreRingInner: {
    transform: [{ rotate: '-32deg' }],
    alignItems: 'center',
  },
  scoreRingText: {
    color: exactColors.goldLight,
    fontSize: 18,
    fontWeight: '900',
  },
  scoreRingLabel: {
    color: exactColors.textSoft,
    fontSize: 10,
    fontWeight: '800',
    marginTop: -2,
  },
  heroText: {
    color: exactColors.textSoft,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '700',
    marginTop: 14,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 12,
  },
  stat: {
    flex: 1,
    height: 86,
    borderRadius: exactRadius.md,
    borderWidth: 1,
    borderColor: exactColors.border,
    backgroundColor: 'rgba(7,31,20,0.68)',
    alignItems: 'center',
    justifyContent: 'center',
    ...exactShadow.card,
  },
  statValue: {
    color: exactColors.goldLight,
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
  },
  statTitle: {
    color: exactColors.textSoft,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 3,
  },
  statsRowCompact: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 9,
  },
  infoPill: {
    flex: 1,
    minHeight: 58,
    borderRadius: exactRadius.md,
    borderWidth: 1,
    borderColor: exactColors.borderSoft,
    backgroundColor: 'rgba(0,0,0,0.16)',
    paddingHorizontal: 9,
    justifyContent: 'center',
  },
  infoTitle: {
    color: exactColors.muted,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  infoValue: {
    color: exactColors.text,
    fontSize: 13,
    fontWeight: '900',
    marginTop: 4,
  },
  chartBox: {
    marginTop: 14,
    minHeight: 284,
    padding: 17,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  chartTitle: {
    color: exactColors.goldLight,
    fontSize: 16,
    fontWeight: '900',
  },
  chartSubtitle: {
    color: exactColors.textSoft,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600',
    marginTop: 3,
  },
  phaseBadge: {
    minWidth: 54,
    height: 26,
    borderRadius: exactRadius.full,
    borderWidth: 1,
    borderColor: exactColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(247,217,148,0.08)',
  },
  phaseText: {
    color: exactColors.goldLight,
    fontSize: 11,
    fontWeight: '900',
  },
  chartImageWrap: {
    minHeight: 174,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  chartImage: {
    width: '100%',
    height: 174,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
    marginTop: 2,
  },
  weekText: {
    color: exactColors.muted,
    fontSize: 10,
    fontWeight: '800',
  },
  consistencyCard: {
    marginTop: 14,
    padding: 17,
  },
  consistencyTitle: {
    color: exactColors.goldLight,
    fontSize: 15,
    fontWeight: '900',
  },
  consistencyText: {
    color: exactColors.textSoft,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
    marginTop: 7,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(247,217,148,0.14)',
    overflow: 'hidden',
    marginTop: 14,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: exactColors.goldLight,
  },
});
