import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { PremiumButton } from '@/components/ui/PremiumButton';
import { Screen } from '@/components/ui/Screen';
import { getOrCreateAnonymousUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { colors, radius } from '@/theme';

type GoalKey = 'fit' | 'lean' | 'bulk';

type Analysis = {
  id: string;
  recommended_goal: GoalKey | 'lose_weight' | null;
  confidence_score: number | null;
  summary: string | null;
  estimated_body_fat: number | null;
};

type Plan = {
  id: string;
  goal: GoalKey | 'lose_weight';
  duration_months: number;
  title: string | null;
  summary: string | null;
};

const goals: {
  key: GoalKey;
  title: string;
  subtitle: string;
  description: string;
}[] = [
  {
    key: 'fit',
    title: 'FIT',
    subtitle: 'Balanced transformation',
    description: 'Build strength, improve shape, increase energy and stay consistent.',
  },
  {
    key: 'lean',
    title: 'LEAN',
    subtitle: 'Defined and lighter',
    description: 'Focus on fat loss, light muscle definition, clean nutrition and cardio.',
  },
  {
    key: 'bulk',
    title: 'BULK',
    subtitle: 'Muscle growth',
    description: 'Increase muscle mass with strength training and higher calorie nutrition.',
  },
];

function normalizeGoal(goal?: string | null): GoalKey {
  if (goal === 'lean') return 'lean';
  if (goal === 'bulk') return 'bulk';

  return 'fit';
}

function formatGoal(goal: string) {
  return goal.toUpperCase();
}

export default function GoalScreen() {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<GoalKey>('fit');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const recommendedGoal = useMemo(
    () => normalizeGoal(analysis?.recommended_goal),
    [analysis?.recommended_goal]
  );

  useFocusEffect(
    useCallback(() => {
      loadGoalData();
    }, [])
  );

  async function loadGoalData() {
    try {
      setIsLoading(true);

      const user = await getOrCreateAnonymousUser();

      const { data: analysisData, error: analysisError } = await supabase
        .from('ai_analyses')
        .select('id, recommended_goal, confidence_score, summary, estimated_body_fat')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (analysisError) {
        throw analysisError;
      }

      const { data: planData, error: planError } = await supabase
        .from('plans')
        .select('id, goal, duration_months, title, summary')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (planError) {
        throw planError;
      }

      setAnalysis(analysisData as Analysis | null);
      setPlan(planData as Plan | null);

      const nextGoal = normalizeGoal(analysisData?.recommended_goal ?? planData?.goal);
      setSelectedGoal(nextGoal);
    } catch (error) {
      console.error('GOAL_LOAD_ERROR', error);
      Alert.alert('Goal error', 'We could not load your recommended goal.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleContinue() {
    try {
      setIsSaving(true);

      const user = await getOrCreateAnonymousUser();

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          primary_goal: selectedGoal,
          onboarding_completed: true,
        })
        .eq('id', user.id);

      if (profileError) {
        throw profileError;
      }

      if (plan?.id) {
        const selectedGoalTitle = formatGoal(selectedGoal);

        const { error: planError } = await supabase
          .from('plans')
          .update({
            goal: selectedGoal,
            title: `${plan.duration_months} Month ${selectedGoalTitle} Transformation`,
            summary:
              selectedGoal === 'fit'
                ? 'A balanced transformation plan focused on strength, clean nutrition, cardio, face yoga and better sleep.'
                : selectedGoal === 'lean'
                  ? 'A lean transformation plan focused on fat loss, definition, clean meals, cardio and consistency.'
                  : 'A muscle growth plan focused on progressive strength training, higher protein nutrition and recovery.',
          })
          .eq('id', plan.id);

        if (planError) {
          throw planError;
        }
      }

      router.replace('/home');
    } catch (error) {
      console.error('GOAL_SAVE_ERROR', error);
      Alert.alert('Goal error', 'We could not save your goal. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <Screen style={styles.centerScreen}>
        <ActivityIndicator size="large" color={colors.goldSoft} />
        <Text style={styles.loadingText}>Loading your AI recommendation...</Text>
      </Screen>
    );
  }

  return (
    <Screen style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.step}>STEP 04</Text>
        <Text style={styles.title}>Choose your transformation goal</Text>
        <Text style={styles.subtitle}>
          AI recommends your best direction, but the final choice is yours.
        </Text>
      </View>

      <View style={styles.recommendationCard}>
        <Text style={styles.cardEyebrow}>AI RECOMMENDATION</Text>
        <View style={styles.recommendationRow}>
          <View>
            <Text style={styles.recommendedGoal}>{formatGoal(recommendedGoal)}</Text>
            <Text style={styles.recommendedMeta}>
              {analysis?.confidence_score ?? 72}% confidence
            </Text>
          </View>

          <View style={styles.scoreCircle}>
            <Text style={styles.scoreText}>{analysis?.confidence_score ?? 72}</Text>
          </View>
        </View>

        <Text style={styles.recommendationText}>
          {analysis?.summary ??
            'Your starting point is strong. A balanced FIT plan is recommended for your first transformation phase.'}
        </Text>

        {analysis?.estimated_body_fat ? (
          <Text style={styles.bodyFatText}>
            Estimated body fat: {analysis.estimated_body_fat}%
          </Text>
        ) : null}
      </View>

      <View style={styles.goals}>
        {goals.map((goal) => {
          const isSelected = selectedGoal === goal.key;
          const isRecommended = recommendedGoal === goal.key;

          return (
            <Pressable
              key={goal.key}
              style={[styles.goalCard, isSelected && styles.goalCardSelected]}
              onPress={() => setSelectedGoal(goal.key)}
              disabled={isSaving}
            >
              <View style={styles.goalHeader}>
                <View>
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                  <Text style={styles.goalSubtitle}>{goal.subtitle}</Text>
                </View>

                <View style={[styles.radio, isSelected && styles.radioSelected]}>
                  {isSelected ? <View style={styles.radioDot} /> : null}
                </View>
              </View>

              <Text style={styles.goalDescription}>{goal.description}</Text>

              {isRecommended ? (
                <View style={styles.recommendedPill}>
                  <Text style={styles.recommendedPillText}>AI Recommended</Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <PremiumButton
        title={isSaving ? 'Saving Goal...' : 'Continue to Dashboard'}
        onPress={handleContinue}
        disabled={isSaving}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingVertical: 34,
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
  header: {
    marginBottom: 22,
  },
  step: {
    color: colors.goldSoft,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 3,
  },
  title: {
    color: colors.text,
    fontSize: 35,
    fontWeight: '900',
    marginTop: 14,
    letterSpacing: -1,
    lineHeight: 41,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 16,
    marginTop: 10,
    lineHeight: 24,
  },
  recommendationCard: {
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
  recommendationRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recommendedGoal: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1,
  },
  recommendedMeta: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 4,
  },
  scoreCircle: {
    width: 62,
    height: 62,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212,175,55,0.08)',
  },
  scoreText: {
    color: colors.goldSoft,
    fontSize: 20,
    fontWeight: '900',
  },
  recommendationText: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 23,
    marginTop: 18,
  },
  bodyFatText: {
    color: colors.goldSoft,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 12,
  },
  goals: {
    flex: 1,
    gap: 12,
    marginTop: 18,
  },
  goalCard: {
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
  },
  goalCardSelected: {
    borderColor: colors.goldSoft,
    backgroundColor: 'rgba(212,175,55,0.08)',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  goalSubtitle: {
    color: colors.goldSoft,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 3,
  },
  goalDescription: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.goldSoft,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
    backgroundColor: colors.goldSoft,
  },
  recommendedPill: {
    alignSelf: 'flex-start',
    marginTop: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  recommendedPillText: {
    color: colors.goldSoft,
    fontSize: 11,
    fontWeight: '900',
  },
});