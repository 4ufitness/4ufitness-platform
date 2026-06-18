import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { ExactCard } from '@/components/exact/ExactCard';
import { ExactGoldButton } from '@/components/exact/ExactGoldButton';
import { ExactHeader } from '@/components/exact/ExactHeader';
import { ExactScreen } from '@/components/exact/ExactScreen';
import { getOrCreateAnonymousUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { exactColors, exactRadius } from '@/theme/exact-match';

const today = new Date().toISOString().slice(0, 10);

const defaultTasks = [
  { task_type: 'workout', title: 'Upper Body Strength', description: 'Controlled strength training built for your starting level.', duration_minutes: 45, calories: null },
  { task_type: 'meal', title: 'High Protein Meal', description: 'Balanced protein-focused nutrition for transformation.', duration_minutes: null, calories: 520 },
  { task_type: 'cardio', title: 'Cardio Session', description: 'Low-impact cardio to support fat burning and endurance.', duration_minutes: 20, calories: null },
  { task_type: 'face_yoga', title: 'Daily Face Routine', description: 'Short face yoga routine for wellness and consistency.', duration_minutes: 10, calories: null },
  { task_type: 'sleep', title: 'Sleep Target', description: '7–8 hours recovery target for better progress.', duration_minutes: 480, calories: null },
];

export default function AIAnalysisScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [score, setScore] = useState(72);
  const startedRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (!startedRef.current) {
        startedRef.current = true;
        runDemoAnalysis();
      }
    }, [])
  );

  async function runDemoAnalysis() {
    try {
      setIsLoading(true);
      const user = await getOrCreateAnonymousUser();

      const { data: existingPlan } = await supabase
        .from('plans')
        .select('id, status')
        .eq('user_id', user.id)
        .in('status', ['draft', 'active'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!existingPlan?.id) {
        const { data: photo } = await supabase
          .from('body_photos')
          .select('id')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        const { data: analysis, error: analysisError } = await supabase
          .from('ai_analyses')
          .insert({
            user_id: user.id,
            body_photo_id: photo?.id ?? null,
            body_type: 'balanced',
            estimated_body_fat: 18.5,
            recommended_goal: 'fit',
            confidence_score: 72,
            summary: 'Your body structure is suitable for a balanced transformation. FIT is recommended for your first phase.',
            raw_result: {
              version: 'demo-product-flow-v2.6',
              system: ['workout', 'meal', 'cardio', 'face_yoga', 'sleep'],
              recommended_duration_months: 4,
            },
          })
          .select('id, confidence_score')
          .single();

        if (analysisError) throw analysisError;
        setScore(analysis?.confidence_score ?? 72);

        const { data: plan, error: planError } = await supabase
          .from('plans')
          .insert({
            user_id: user.id,
            ai_analysis_id: analysis.id,
            goal: 'fit',
            duration_months: 4,
            title: '4 Month FIT Transformation',
            summary: 'A complete AI-built system with workout, meal plan, cardio, face yoga and sleep support.',
            status: 'draft',
            plan_data: {
              weekly_workout_days: 4,
              meal_style: 'high_protein_balanced',
              cardio_sessions: 3,
              face_yoga_daily: true,
              sleep_target_hours: 8,
            },
          })
          .select('id')
          .single();

        if (planError) throw planError;

        const { error: tasksError } = await supabase.from('daily_tasks').insert(
          defaultTasks.map((task) => ({
            ...task,
            user_id: user.id,
            plan_id: plan.id,
            task_date: today,
            is_completed: false,
          }))
        );

        if (tasksError) throw tasksError;
      } else {
        const { data: latestAnalysis } = await supabase
          .from('ai_analyses')
          .select('confidence_score')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        setScore(latestAnalysis?.confidence_score ?? 72);
      }

      await new Promise((resolve) => setTimeout(resolve, 900));
      setIsReady(true);
    } catch (error) {
      console.error('AI_ANALYSIS_ERROR', error);
      setIsReady(true);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ExactScreen waveMode="full">
      <ExactHeader title="YOUR AI ANALYSIS" showBack progress={0.68} />

      <View style={styles.content}>
        <ExactCard style={styles.scoreCard}>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreLabel}>AI Score</Text>
            <View style={styles.scoreRow}>
              <Text style={styles.score}>{score}</Text>
              <Text style={styles.scoreMax}>/100</Text>
            </View>
          </View>

          <View style={styles.ringWrap}>
            <View style={styles.ring} />
            <View style={styles.ringInner} />
          </View>

          <View style={styles.scoreTextBox}>
            <Text style={styles.scoreTitle}>Good Start!</Text>
            <Text style={styles.scoreText}>AI checked your photos and built your first transformation direction.</Text>
          </View>
        </ExactCard>

        <View style={styles.steps}>
          <AnalysisStep title="Body type" text="Balanced starting structure" active />
          <AnalysisStep title="Body fat" text="18.5% estimated baseline" active />
          <AnalysisStep title="Recommended goal" text="FIT transformation direction" active />
          <AnalysisStep title="Daily system" text="Workout, meal, cardio, face yoga and sleep" active={isReady} />
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={exactColors.goldLight} />
          <Text style={styles.loadingText}>Building your system...</Text>
        </View>
      ) : (
        <ExactGoldButton title="See AI Recommendation" onPress={() => router.push('/onboarding/goal')} style={styles.bottomButton} />
      )}
    </ExactScreen>
  );
}

function AnalysisStep({ title, text, active }: { title: string; text: string; active?: boolean }) {
  return (
    <View style={styles.stepRow}>
      <View style={[styles.stepDot, active && styles.stepDotActive]}>
        {active ? <Text style={styles.stepCheck}>✓</Text> : null}
      </View>
      <View style={styles.stepTextBox}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepText}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: 8,
  },
  scoreCard: {
    minHeight: 132,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scoreBox: {
    width: 80,
  },
  scoreLabel: {
    color: exactColors.goldLight,
    fontSize: 12.5,
    fontWeight: '900',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 4,
  },
  score: {
    color: exactColors.text,
    fontSize: 48,
    fontWeight: '300',
    lineHeight: 54,
  },
  scoreMax: {
    color: exactColors.text,
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 7,
  },
  ringWrap: {
    width: 74,
    height: 74,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 999,
    borderWidth: 8,
    borderColor: exactColors.gold,
    borderLeftColor: 'rgba(246,217,143,0.15)',
    transform: [{ rotate: '20deg' }],
  },
  ringInner: {
    width: 43,
    height: 43,
    borderRadius: 999,
    backgroundColor: 'rgba(4, 19, 12, 0.92)',
  },
  scoreTextBox: {
    flex: 1,
  },
  scoreTitle: {
    color: exactColors.goldLight,
    fontSize: 15,
    fontWeight: '900',
  },
  scoreText: {
    color: exactColors.text,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
    fontWeight: '600',
  },
  steps: {
    marginTop: 24,
    gap: 10,
  },
  stepRow: {
    minHeight: 62,
    borderRadius: exactRadius.lg,
    borderWidth: 1,
    borderColor: exactColors.borderSoft,
    backgroundColor: 'rgba(5, 26, 17, 0.68)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    gap: 13,
  },
  stepDot: {
    width: 26,
    height: 26,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: exactColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  stepDotActive: {
    backgroundColor: exactColors.goldLight,
    borderColor: exactColors.goldLight,
  },
  stepCheck: {
    color: exactColors.backgroundDeep,
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 18,
  },
  stepTextBox: {
    flex: 1,
  },
  stepTitle: {
    color: exactColors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  stepText: {
    color: exactColors.textSoft,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
    fontWeight: '600',
  },
  loading: {
    alignItems: 'center',
    paddingBottom: 8,
  },
  bottomButton: {
    marginBottom: 12,
  },
  loadingText: {
    color: exactColors.textSoft,
    marginTop: 8,
    fontSize: 13,
    fontWeight: '700',
  },
});
