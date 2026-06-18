import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { exactAssets } from '@/assets/exact/assets';
import { ExactCard } from '@/components/exact/ExactCard';
import { ExactGoldButton } from '@/components/exact/ExactGoldButton';
import { ExactHeader } from '@/components/exact/ExactHeader';
import { ExactScreen } from '@/components/exact/ExactScreen';
import { getOrCreateAnonymousUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { exactColors, exactRadius } from '@/theme/exact-match';

type GoalKey = 'fit' | 'bulk' | 'lean';

const options = [
  { key: 'fit' as GoalKey, title: 'Fit', figure: exactAssets.figures.fit },
  { key: 'bulk' as GoalKey, title: 'Bulk', figure: exactAssets.figures.bulk },
  { key: 'lean' as GoalKey, title: 'Lean', figure: exactAssets.figures.lean },
];

export default function FutureBodyScreen() {
  const [selected, setSelected] = useState<GoalKey>('fit');

  useFocusEffect(
    useCallback(() => {
      loadGoal();
    }, [])
  );

  async function loadGoal() {
    const user = await getOrCreateAnonymousUser();

    const { data } = await supabase
      .from('profiles')
      .select('primary_goal')
      .eq('id', user.id)
      .maybeSingle();

    if (data?.primary_goal === 'bulk' || data?.primary_goal === 'lean' || data?.primary_goal === 'fit') {
      setSelected(data.primary_goal);
    }
  }

  async function chooseGoal(goal: GoalKey) {
    setSelected(goal);

    const user = await getOrCreateAnonymousUser();

    await supabase.from('profiles').update({ primary_goal: goal }).eq('id', user.id);
    await supabase.from('plans').update({ goal }).eq('user_id', user.id).in('status', ['draft', 'active']);
  }

  return (
    <ExactScreen waveMode="full">
      <ExactHeader title="CHOOSE YOUR FUTURE BODY" showBack progress={0.84} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.figureStage}>
          {options.map((item) => {
            const active = selected === item.key;

            return (
              <Pressable
                key={item.key}
                style={[styles.figureCol, active && styles.figureColActive]}
                onPress={() => chooseGoal(item.key)}
              >
                <Image source={item.figure} style={[styles.figure, active && styles.figureActive]} resizeMode="contain" />
              </Pressable>
            );
          })}
        </View>

        <View style={styles.segmentRow}>
          {options.map((item) => (
            <Pressable
              key={item.key}
              style={[styles.segment, selected === item.key && styles.segmentActive]}
              onPress={() => chooseGoal(item.key)}
            >
              <Text style={[styles.segmentText, selected === item.key && styles.segmentTextActive]}>
                {item.title}
              </Text>
            </Pressable>
          ))}
        </View>

        <ExactCard style={styles.resultCard}>
          <Text style={styles.resultTitle}>EST. RESULTS IN 16 WEEKS</Text>
          <ResultItem text="More energy & strength" />
          <ResultItem text="Improved body composition" />
          <ResultItem text="Better confidence" />

          <View style={styles.chartWrap}>
            <Image
              source={exactAssets.ui.chartGrowth}
              style={styles.chartImage}
              resizeMode="contain"
            />
          </View>
        </ExactCard>

        <ExactGoldButton
          title="See My Full Plan"
          onPress={() => router.push('/onboarding/plan-preview')}
          style={styles.button}
        />
      </ScrollView>
    </ExactScreen>
  );
}

function ResultItem({ text }: { text: string }) {
  return (
    <View style={styles.item}>
      <Text style={styles.check}>✓</Text>
      <Text style={styles.itemText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 96,
  },
  figureStage: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 4,
    minHeight: 184,
  },
  figureCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 0,
    paddingBottom: 0,
    borderRadius: exactRadius.lg,
  },
  figureColActive: {
    backgroundColor: 'rgba(246,217,143,0.035)',
  },
  figure: {
    width: 100,
    height: 170,
    opacity: 0.84,
  },
  figureActive: {
    width: 110,
    height: 180,
    opacity: 1,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  segment: {
    flex: 1,
    height: 50,
    borderRadius: exactRadius.md,
    borderWidth: 1,
    borderColor: exactColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(7,31,20,0.64)',
  },
  segmentActive: {
    backgroundColor: 'rgba(201,161,90,0.76)',
    borderColor: exactColors.goldLight,
  },
  segmentText: {
    color: exactColors.goldLight,
    fontSize: 15.5,
    fontWeight: '900',
  },
  segmentTextActive: {
    color: exactColors.text,
  },
  resultCard: {
    marginTop: 16,
    minHeight: 268,
    padding: 16,
  },
  resultTitle: {
    color: exactColors.goldLight,
    fontSize: 14.5,
    fontWeight: '900',
    marginBottom: 14,
    letterSpacing: 0.3,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 10,
  },
  check: {
    color: exactColors.goldLight,
    fontSize: 18,
    fontWeight: '900',
  },
  itemText: {
    color: exactColors.text,
    fontSize: 13.2,
    fontWeight: '800',
  },
  chartWrap: {
    flex: 1,
    minHeight: 118,
    marginTop: 0,
    justifyContent: 'flex-end',
  },
  chartImage: {
    width: '100%',
    height: 116,
  },
  button: {
    marginTop: 12,
    marginBottom: 12,
  },
});
