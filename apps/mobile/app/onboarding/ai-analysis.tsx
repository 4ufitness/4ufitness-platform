import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';

import { PremiumButton } from '@/components/ui/PremiumButton';
import { Screen } from '@/components/ui/Screen';
import { getOrCreateAnonymousUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { colors, radius } from '@/theme';

type AnalysisStep = 'analyzing' | 'creating_plan' | 'ready' | 'error';

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

export default function AIAnalysisScreen() {
  const [step, setStep] = useState<AnalysisStep>('analyzing');
  const [message, setMessage] = useState('Analyzing your body photos...');
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (hasStartedRef.current) {
      return;
    }

    hasStartedRef.current = true;
    runDemoAnalysis();
  }, []);

  async function runDemoAnalysis() {
    try {
      const user = await getOrCreateAnonymousUser();

      setStep('analyzing');
      setMessage('Analyzing your body photos...');

      await wait(1200);

      const { data: bodyPhoto, error: bodyPhotoError } = await supabase
        .from('body_photos')
        .select('id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (bodyPhotoError) {
        throw bodyPhotoError;
      }

      setMessage('Calculating your transformation direction...');

      await wait(1200);

      const { data: analysis, error: analysisError } = await supabase
        .from('ai_analyses')
        .insert({
          user_id: user.id,
          body_photo_id: bodyPhoto?.id ?? null,
          body_type: 'balanced',
          estimated_body_fat: 18.5,
          recommended_goal: 'fit',
          confidence_score: 72,
          summary:
            'Your starting point is strong. A fit transformation plan with strength training, high-protein meals, light cardio and recovery-focused sleep is recommended.',
          raw_result: {
            source: 'demo_foundation_v0_1',
            body_balance: 'good',
            posture_note: 'neutral',
            recommended_plan_duration: 4,
            focus_areas: ['strength', 'nutrition', 'sleep', 'consistency'],
          },
        })
        .select('id')
        .single();

      if (analysisError) {
        throw analysisError;
      }

      setStep('creating_plan');
      setMessage('Creating your personal plan...');

      await wait(1200);

      const { data: plan, error: planError } = await supabase
        .from('plans')
        .insert({
          user_id: user.id,
          ai_analysis_id: analysis.id,
          goal: 'fit',
          duration_months: 4,
          title: '4 Month Fit Transformation',
          summary:
            'A balanced 4-month transformation plan focused on strength, clean nutrition, cardio, face yoga and better sleep.',
          status: 'active',
          plan_data: {
            weekly_workout_days: 4,
            cardio_days: 3,
            meal_style: 'high_protein_balanced',
            sleep_target_hours: 8,
            face_yoga_frequency: 'daily',
          },
        })
        .select('id')
        .single();

      if (planError) {
        throw planError;
      }

      const today = getTodayDate();

      const { error: taskError } = await supabase.from('daily_tasks').insert([
        {
          user_id: user.id,
          plan_id: plan.id,
          task_date: today,
          task_type: 'workout',
          title: 'Upper Body Strength',
          description: '35 minutes strength workout focused on chest, shoulders and core.',
          duration_minutes: 35,
          calories: 220,
        },
        {
          user_id: user.id,
          plan_id: plan.id,
          task_date: today,
          task_type: 'meal',
          title: 'High Protein Breakfast',
          description: 'Eggs, Greek yogurt or lean protein with complex carbs.',
          calories: 520,
        },
        {
          user_id: user.id,
          plan_id: plan.id,
          task_date: today,
          task_type: 'cardio',
          title: 'Light Cardio',
          description: '20 minutes incline walk or low-impact cardio.',
          duration_minutes: 20,
          calories: 160,
        },
        {
          user_id: user.id,
          plan_id: plan.id,
          task_date: today,
          task_type: 'face_yoga',
          title: 'Daily Face Yoga',
          description: '10 minutes facial routine for relaxation and tone.',
          duration_minutes: 10,
        },
        {
          user_id: user.id,
          plan_id: plan.id,
          task_date: today,
          task_type: 'sleep',
          title: 'Sleep Target',
          description: 'Aim for 7–8 hours of quality sleep tonight.',
          duration_minutes: 480,
        },
      ]);

      if (taskError) {
        throw taskError;
      }

      await supabase
        .from('profiles')
        .update({
          primary_goal: 'fit',
          onboarding_completed: true,
        })
        .eq('id', user.id);

      setStep('ready');
      setMessage('Your transformation plan is ready.');
    } catch (error) {
      console.error('AI_ANALYSIS_FLOW_ERROR', error);
      setStep('error');
      setMessage('We could not create your plan. Please try again.');
      Alert.alert('Analysis error', 'We could not create your plan. Please try again.');
    }
  }

  function handleContinue() {
    router.replace('/onboarding/goal');
  }

  function handleRetry() {
    hasStartedRef.current = false;
    runDemoAnalysis();
  }

  return (
    <Screen style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.step}>STEP 03</Text>
        <Text style={styles.title}>
          {step === 'ready' ? 'Analysis complete' : 'AI is building your plan'}
        </Text>
        <Text style={styles.subtitle}>{message}</Text>

        <View style={styles.analysisCard}>
          {step === 'ready' ? (
            <>
              <Text style={styles.score}>72</Text>
              <Text style={styles.scoreLabel}>AI Confidence Score</Text>
              <Text style={styles.summary}>
                Recommended goal: FIT. Your first plan is focused on strength, high-protein
                nutrition, light cardio and recovery.
              </Text>
            </>
          ) : step === 'error' ? (
            <>
              <Text style={styles.errorTitle}>Something went wrong</Text>
              <Text style={styles.summary}>
                Your photos were uploaded, but the demo analysis could not be created.
              </Text>
            </>
          ) : (
            <>
              <ActivityIndicator size="large" color={colors.goldSoft} />
              <Text style={styles.loadingText}>
                {step === 'creating_plan'
                  ? 'Creating your daily system...'
                  : 'Reading body composition signals...'}
              </Text>
            </>
          )}
        </View>
      </View>

      {step === 'ready' ? (
        <PremiumButton title="See Recommended Goal" onPress={handleContinue} />
      ) : step === 'error' ? (
        <PremiumButton title="Try Again" onPress={handleRetry} />
      ) : null}
    </Screen>
  );
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const styles = StyleSheet.create({
  screen: {
    paddingVertical: 38,
  },
  content: {
    flex: 1,
  },
  step: {
    color: colors.goldSoft,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
  },
  title: {
    color: colors.text,
    fontSize: 36,
    fontWeight: '900',
    marginTop: 14,
    letterSpacing: -1,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 16,
    marginTop: 10,
    lineHeight: 24,
  },
  analysisCard: {
    marginTop: 48,
    minHeight: 310,
    borderRadius: radius.xxl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  loadingText: {
    color: colors.muted,
    fontSize: 16,
    marginTop: 22,
    textAlign: 'center',
  },
  score: {
    color: colors.goldSoft,
    fontSize: 78,
    fontWeight: '900',
    letterSpacing: -3,
  },
  scoreLabel: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 6,
  },
  summary: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 23,
    marginTop: 18,
    textAlign: 'center',
  },
  errorTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
  },
});