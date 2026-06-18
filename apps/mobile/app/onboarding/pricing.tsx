import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ExactCard } from '@/components/exact/ExactCard';
import { ExactGoldButton } from '@/components/exact/ExactGoldButton';
import { ExactHeader } from '@/components/exact/ExactHeader';
import { ExactScreen } from '@/components/exact/ExactScreen';
import { getOrCreateAnonymousUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { exactColors, exactRadius } from '@/theme/exact-match';

type PackageKey = '4_month' | '8_month' | '12_month';

const packages = [
  { key: '4_month' as PackageKey, months: 4, title: '4 Month Plan', price: '$79', note: 'AI starting plan' },
  { key: '8_month' as PackageKey, months: 8, title: '8 Month Plan', price: '$119', note: 'Deeper transformation' },
  { key: '12_month' as PackageKey, months: 12, title: '12 Month Plan', price: '$159', note: 'Full lifestyle upgrade' },
];

export default function PricingScreen() {
  const [selected, setSelected] = useState<PackageKey>('4_month');
  const [isSaving, setIsSaving] = useState(false);

  useFocusEffect(useCallback(() => { loadRecommendedPackage(); }, []));

  async function loadRecommendedPackage() {
    const user = await getOrCreateAnonymousUser();
    const { data } = await supabase.from('plans').select('duration_months').eq('user_id', user.id).in('status', ['draft', 'active']).order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (data?.duration_months === 8) setSelected('8_month');
    if (data?.duration_months === 12) setSelected('12_month');
  }

  async function startPlan() {
    try {
      setIsSaving(true);
      const user = await getOrCreateAnonymousUser();
      const pack = packages.find((item) => item.key === selected) ?? packages[0];

      const { data: plan } = await supabase.from('plans').select('id').eq('user_id', user.id).in('status', ['draft', 'active']).order('created_at', { ascending: false }).limit(1).maybeSingle();

      if (plan?.id) {
        await supabase.from('plans').update({ duration_months: pack.months, status: 'active' }).eq('id', plan.id);
      }

      await supabase.from('profiles').update({ onboarding_completed: true }).eq('id', user.id);
      router.replace('/home');
    } catch (error) {
      console.error('PRICING_START_ERROR', error);
      Alert.alert('Plan error', 'We could not activate your plan. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <ExactScreen>
      <ExactHeader title="START YOUR PLAN" showBack progress={1} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Choose your transformation package</Text>
        <Text style={styles.subtitle}>You saw the full plan first. Now start your AI transformation system.</Text>

        <View style={styles.packageList}>
          {packages.map((pack) => {
            const active = selected === pack.key;
            return (
              <Pressable key={pack.key} onPress={() => setSelected(pack.key)}>
                <ExactCard selected={active} style={styles.packageCard}>
                  <View>
                    <Text style={styles.packageTitle}>{pack.title}</Text>
                    <Text style={styles.packageNote}>{pack.note}</Text>
                  </View>
                  <View style={styles.priceBox}>
                    <Text style={styles.price}>{pack.price}</Text>
                    <Text style={styles.priceSub}>one time</Text>
                  </View>
                </ExactCard>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.renewalBox}>
          <Text style={styles.renewalTitle}>Renewal after first plan</Text>
          <Text style={styles.renewalPrice}>$99.99 / 1 Year</Text>
          <Text style={styles.renewalText}>The first plan is your transformation. Renewal is simple full access.</Text>
        </View>
      </ScrollView>

      <ExactGoldButton title={isSaving ? 'Starting...' : 'Start My Journey'} onPress={startPlan} disabled={isSaving} />
    </ExactScreen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 88 },
  title: { color: exactColors.text, fontSize: 26, lineHeight: 32, fontWeight: '900', marginTop: 8, textAlign: 'center' },
  subtitle: { color: exactColors.textSoft, fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 8, marginHorizontal: 18, fontWeight: '600' },
  packageList: { gap: 10, marginTop: 28 },
  packageCard: { minHeight: 92, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  packageTitle: { color: exactColors.goldLight, fontSize: 17, fontWeight: '900' },
  packageNote: { color: exactColors.textSoft, fontSize: 12, marginTop: 5, fontWeight: '600' },
  priceBox: { alignItems: 'flex-end' },
  price: { color: exactColors.text, fontSize: 26, fontWeight: '900' },
  priceSub: { color: exactColors.muted, fontSize: 11, fontWeight: '700' },
  renewalBox: { marginTop: 18, borderRadius: exactRadius.lg, borderWidth: 1, borderColor: exactColors.border, padding: 16, backgroundColor: 'rgba(0,0,0,0.16)' },
  renewalTitle: { color: exactColors.goldLight, fontSize: 14, fontWeight: '900' },
  renewalPrice: { color: exactColors.text, fontSize: 22, fontWeight: '900', marginTop: 6 },
  renewalText: { color: exactColors.textSoft, fontSize: 12, lineHeight: 18, marginTop: 6, fontWeight: '600' },
});
