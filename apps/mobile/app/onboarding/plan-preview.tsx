import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { exactAssets } from '@/assets/exact/assets';
import { ExactCard } from '@/components/exact/ExactCard';
import { ExactGoldButton } from '@/components/exact/ExactGoldButton';
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

function goalLabel(goal?: string | null) {
  if (!goal) return 'Fit';
  return goal.charAt(0).toUpperCase() + goal.slice(1).replace('_', ' ');
}

export default function PlanPreviewScreen() {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadPlan();
    }, [])
  );

  async function loadPlan() {
    try {
      setLoading(true);
      const user = await getOrCreateAnonymousUser();
      const { data } = await supabase
        .from('plans')
        .select('id, title, summary, goal, duration_months, status')
        .eq('user_id', user.id)
        .in('status', ['draft', 'active'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      setPlan(data as Plan | null);
    } finally {
      setLoading(false);
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

  const duration = plan?.duration_months ?? 4;
  const weeks = duration * 4;

  return (
    <ExactScreen waveMode="low">
      <ExactHeader title="YOUR TRANSFORMATION PLAN" showBack progress={0.86} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.titleRow}>
          <Text style={styles.program}>{duration} Month Program</Text>
          <Text style={styles.star}>★</Text>
        </View>
        <Text style={styles.subtitle}>{plan?.summary ?? 'Personalized just for you.'}</Text>

        <ExactCard style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <View>
              <Text style={styles.summaryKicker}>AI PLAN PREVIEW</Text>
              <Text style={styles.summaryTitle}>{goalLabel(plan?.goal)} transformation</Text>
            </View>
            <View style={styles.weeksBadge}>
              <Text style={styles.weeksValue}>{weeks}</Text>
              <Text style={styles.weeksLabel}>Weeks</Text>
            </View>
          </View>

          <View style={styles.timelineTrack}>
            <View style={styles.timelineActive} />
          </View>

          <View style={styles.summaryStats}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>5</Text>
              <Text style={styles.statLabel}>Daily systems</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>Full</Text>
              <Text style={styles.statLabel}>Access preview</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>AI</Text>
              <Text style={styles.statLabel}>Adjustable</Text>
            </View>
          </View>
        </ExactCard>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>PLAN SYSTEM</Text>
          <Text style={styles.sectionMeta}>No locked days</Text>
        </View>

        <View style={styles.list}>
          <ExactTaskRow
            icon={exactAssets.icons.workout}
            title="Workout Plan"
            subtitle="4–5 days per week"
            meta="OPEN"
            compact
          />
          <ExactTaskRow
            icon={exactAssets.icons.meal}
            title="Meal Plan"
            subtitle="Customized for your goal"
            meta="OPEN"
            compact
          />
          <ExactTaskRow
            icon={exactAssets.icons.cardio}
            title="Cardio Plan"
            subtitle="Burn fat & improve endurance"
            meta="OPEN"
            compact
          />
          <ExactTaskRow
            icon={exactAssets.icons.faceYoga}
            title="Face Yoga"
            subtitle="Daily face exercises"
            meta="OPEN"
            compact
          />
          <ExactTaskRow
            icon={exactAssets.icons.moon}
            title="Sleep Plan"
            subtitle="Improve sleep quality"
            meta="OPEN"
            compact
          />
        </View>

        <ExactCard style={styles.unlockBox}>
          <Text style={styles.unlockTitle}>Full plan transparency</Text>
          <Text style={styles.unlockText}>
            You can see the full transformation system before starting. Workout, meal, cardio, face yoga and sleep stay open from day one.
          </Text>
        </ExactCard>
      </ScrollView>

      <ExactGoldButton title="Continue to Pricing" onPress={() => router.push('/onboarding/pricing')} />
    </ExactScreen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingBottom: 88 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 2 },
  program: { color: exactColors.text, fontSize: 24, lineHeight: 31, fontWeight: '900' },
  star: { color: exactColors.goldLight, fontSize: 18, marginTop: -1 },
  subtitle: { color: exactColors.textSoft, fontSize: 13, fontWeight: '600', marginTop: 4 },
  summaryCard: { marginTop: 18, padding: 17 },
  summaryTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  summaryKicker: { color: exactColors.goldLight, fontSize: 10.5, fontWeight: '900', letterSpacing: 1.6 },
  summaryTitle: { color: exactColors.text, fontSize: 18.5, lineHeight: 24, fontWeight: '900', marginTop: 6 },
  weeksBadge: {
    width: 68,
    height: 68,
    borderRadius: exactRadius.full,
    borderWidth: 1,
    borderColor: exactColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(247,217,148,0.07)',
  },
  weeksValue: { color: exactColors.goldLight, fontSize: 19, fontWeight: '900' },
  weeksLabel: { color: exactColors.textSoft, fontSize: 10, fontWeight: '800', marginTop: 1 },
  timelineTrack: {
    height: 8,
    borderRadius: exactRadius.full,
    backgroundColor: 'rgba(247,217,148,0.13)',
    marginTop: 17,
    overflow: 'hidden',
  },
  timelineActive: {
    width: '72%',
    height: '100%',
    borderRadius: exactRadius.full,
    backgroundColor: exactColors.goldLight,
  },
  summaryStats: { flexDirection: 'row', gap: 8, marginTop: 14 },
  statBox: {
    flex: 1,
    minHeight: 58,
    borderRadius: exactRadius.md,
    borderWidth: 1,
    borderColor: exactColors.borderSoft,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.13)',
    paddingHorizontal: 4,
  },
  statValue: { color: exactColors.goldLight, fontSize: 15, fontWeight: '900' },
  statLabel: { color: exactColors.textSoft, fontSize: 9.5, fontWeight: '800', marginTop: 4, textAlign: 'center' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 21, marginBottom: 10 },
  sectionTitle: { color: exactColors.goldLight, fontSize: 15.5, fontWeight: '900', letterSpacing: 0.4 },
  sectionMeta: { color: exactColors.textSoft, fontSize: 11.5, fontWeight: '800' },
  list: { gap: 8 },
  unlockBox: { marginTop: 16, padding: 16 },
  unlockTitle: { color: exactColors.goldLight, fontSize: 15, fontWeight: '900' },
  unlockText: { color: exactColors.textSoft, fontSize: 12, lineHeight: 19, marginTop: 6, fontWeight: '600' },
});
