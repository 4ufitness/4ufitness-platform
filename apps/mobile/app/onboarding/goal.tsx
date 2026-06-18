import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { exactAssets } from '@/assets/exact/assets';
import { ExactCard } from '@/components/exact/ExactCard';
import { ExactGoldButton } from '@/components/exact/ExactGoldButton';
import { ExactHeader } from '@/components/exact/ExactHeader';
import { ExactScreen } from '@/components/exact/ExactScreen';
import { getOrCreateAnonymousUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { exactColors, exactRadius } from '@/theme/exact-match';

type GoalKey = 'fit' | 'bulk' | 'lean';

type Analysis = {
  recommended_goal: string | null;
  confidence_score: number | null;
  estimated_body_fat: number | null;
  body_type: string | null;
  summary: string | null;
};

type Plan = { id: string; duration_months: number; status: string; goal?: string | null };

const goals = [
  { key: 'fit' as GoalKey, title: 'Fit', subtitle: 'Get fit & improve your overall health', figure: exactAssets.figures.fit },
  { key: 'bulk' as GoalKey, title: 'Bulk', subtitle: 'Build muscle & gain weight', figure: exactAssets.figures.bulk },
  { key: 'lean' as GoalKey, title: 'Lean', subtitle: 'Lose fat & build a lean physique', figure: exactAssets.figures.lean },
];

function normalizeGoal(goal?: string | null): GoalKey {
  if (goal === 'bulk') return 'bulk';
  if (goal === 'lean') return 'lean';
  return 'fit';
}

function goalTitle(goal: GoalKey) {
  if (goal === 'bulk') return 'BULK';
  if (goal === 'lean') return 'LEAN';
  return 'FIT';
}

function formatBodyType(type?: string | null) {
  if (!type) return 'Balanced';
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export default function GoalScreen() {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<GoalKey>('fit');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useFocusEffect(useCallback(() => { loadData(); }, []));

  async function loadData() {
    try {
      setIsLoading(true);
      const user = await getOrCreateAnonymousUser();
      const [{ data: analysisData }, { data: planData }] = await Promise.all([
        supabase
          .from('ai_analyses')
          .select('recommended_goal, confidence_score, estimated_body_fat, body_type, summary')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('plans')
          .select('id, duration_months, status, goal')
          .eq('user_id', user.id)
          .in('status', ['draft', 'active'])
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);
      setAnalysis(analysisData as Analysis | null);
      setPlan(planData as Plan | null);
      setSelectedGoal(normalizeGoal(analysisData?.recommended_goal ?? planData?.goal));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleNext() {
    try {
      setIsSaving(true);
      const user = await getOrCreateAnonymousUser();
      await supabase.from('profiles').update({ primary_goal: selectedGoal }).eq('id', user.id);
      if (plan?.id) {
        await supabase.from('plans').update({
          goal: selectedGoal,
          title: `${plan.duration_months} Month ${goalTitle(selectedGoal)} Transformation`,
          summary: selectedGoal === 'fit'
            ? 'A complete balanced transformation system for strength, shape, nutrition and recovery.'
            : selectedGoal === 'bulk'
              ? 'A muscle growth system focused on progressive strength, protein nutrition and recovery.'
              : 'A lean transformation system focused on fat loss, definition, cardio and clean nutrition.',
        }).eq('id', plan.id);
      }
      router.push('/onboarding/future-body');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <ExactScreen><View style={styles.center}><ActivityIndicator color={exactColors.goldLight} /></View></ExactScreen>;
  }

  return (
    <ExactScreen waveMode="full">
      <ExactHeader title="YOUR AI ANALYSIS" showBack progress={0.76} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <ExactCard style={styles.resultCard}>
          <View style={styles.scoreBox}>
            <Text style={styles.cardKicker}>AI Score</Text>
            <View style={styles.scoreRow}>
              <Text style={styles.score}>{analysis?.confidence_score ?? 72}</Text>
              <Text style={styles.max}>/100</Text>
            </View>
          </View>

          <View style={styles.ringWrap}>
            <View style={styles.ring} />
            <View style={styles.ringInner} />
          </View>

          <View style={styles.resultTextBox}>
            <Text style={styles.good}>Good Start!</Text>
            <Text style={styles.resultText}>You’re on the right track. Let’s build your plan.</Text>
          </View>
        </ExactCard>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Body Type</Text>
            <Text style={styles.statValue}>{formatBodyType(analysis?.body_type)}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Body Fat</Text>
            <Text style={styles.statValue}>{analysis?.estimated_body_fat ?? 18.5}%</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Recommended Goal</Text>

        <View style={styles.figureRow}>
          {goals.map((goal) => {
            const selected = selectedGoal === goal.key;
            return (
              <Pressable
                key={goal.key}
                style={[styles.figureCard, selected && styles.figureCardSelected]}
                onPress={() => setSelectedGoal(goal.key)}
              >
                <Image source={goal.figure} style={styles.figure} resizeMode="contain" />
                <View style={styles.figureFooter}>
                  <Text style={styles.figureLabel}>{goal.title}</Text>
                </View>
                {selected ? (
                  <View style={styles.selectedMark}>
                    <Text style={styles.selectedMarkText}>✓</Text>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.goalTextPanel}>
          <Text style={styles.selectedTitle}>{goals.find((item) => item.key === selectedGoal)?.title}</Text>
          <Text style={styles.selectedSubtitle}>{goals.find((item) => item.key === selectedGoal)?.subtitle}</Text>
        </View>

        <ExactGoldButton
          title={isSaving ? 'Saving...' : 'Create My Plan'}
          onPress={handleNext}
          disabled={isSaving}
          style={styles.button}
        />
      </ScrollView>
    </ExactScreen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 96,
  },
  resultCard: {
    minHeight: 126,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  scoreBox: {
    width: 78,
  },
  cardKicker: {
    color: exactColors.goldLight,
    fontSize: 12,
    fontWeight: '900',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 2,
  },
  score: {
    color: exactColors.text,
    fontSize: 44,
    lineHeight: 49,
    fontWeight: '300',
  },
  max: {
    color: exactColors.text,
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 7,
  },
  ringWrap: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 999,
    borderWidth: 7,
    borderColor: exactColors.gold,
    borderLeftColor: 'rgba(246,217,143,0.16)',
    transform: [{ rotate: '20deg' }],
  },
  ringInner: {
    width: 39,
    height: 39,
    borderRadius: 999,
    backgroundColor: 'rgba(4, 19, 12, 0.92)',
  },
  resultTextBox: {
    flex: 1,
  },
  good: {
    color: exactColors.goldLight,
    fontSize: 14.5,
    fontWeight: '900',
  },
  resultText: {
    color: exactColors.text,
    fontSize: 11.8,
    lineHeight: 17.6,
    marginTop: 5,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  statCard: {
    flex: 1,
    minHeight: 76,
    borderRadius: exactRadius.md,
    borderWidth: 1,
    borderColor: exactColors.borderSoft,
    backgroundColor: 'rgba(5,26,17,0.67)',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  statLabel: {
    color: exactColors.textSoft,
    fontSize: 11.5,
    fontWeight: '800',
  },
  statValue: {
    color: exactColors.goldLight,
    fontSize: 22,
    fontWeight: '900',
    marginTop: 4,
  },
  sectionTitle: {
    color: exactColors.text,
    fontSize: 17,
    fontWeight: '900',
    marginTop: 24,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  figureRow: {
    flexDirection: 'row',
    gap: 8,
  },
  figureCard: {
    flex: 1,
    height: 176,
    borderRadius: exactRadius.md,
    borderWidth: 1,
    borderColor: exactColors.border,
    backgroundColor: 'rgba(5,26,17,0.72)',
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  figureCardSelected: {
    borderColor: exactColors.borderStrong,
    backgroundColor: 'rgba(10,44,28,0.78)',
  },
  figure: {
    width: '94%',
    height: 136,
    marginBottom: 1,
  },
  figureFooter: {
    width: '100%',
    paddingVertical: 7,
    backgroundColor: 'rgba(0,0,0,0.16)',
  },
  figureLabel: {
    textAlign: 'center',
    color: exactColors.goldLight,
    fontSize: 13.5,
    fontWeight: '900',
  },
  selectedMark: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 28,
    height: 28,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: exactColors.goldLight,
  },
  selectedMarkText: {
    color: exactColors.backgroundDeep,
    fontSize: 18,
    fontWeight: '900',
  },
  goalTextPanel: {
    minHeight: 70,
    marginTop: 12,
    borderRadius: exactRadius.md,
    borderWidth: 1,
    borderColor: exactColors.borderSoft,
    backgroundColor: 'rgba(7,31,20,0.58)',
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  selectedTitle: {
    color: exactColors.goldLight,
    fontSize: 18,
    fontWeight: '900',
  },
  selectedSubtitle: {
    color: exactColors.text,
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: '600',
    marginTop: 2,
  },
  button: {
    marginTop: 16,
    marginBottom: 12,
  },
});
