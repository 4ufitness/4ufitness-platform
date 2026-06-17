import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { Screen } from '@/components/ui/Screen';
import { colors } from '@/theme';

export default function WelcomeScreen() {
  return (
    <Screen style={styles.screen}>
      <View>
        <Text style={styles.kicker}>4UFITNESS</Text>
        <Text style={styles.title}>No questions. Just results.</Text>
        <Text style={styles.subtitle}>
          Upload your body photos. Let AI build your transformation plan: workout, meal, cardio, sleep and face yoga.
        </Text>
      </View>

      <GlassCard>
        <Text style={styles.cardTitle}>Foundation v0.1</Text>
        <Text style={styles.cardText}>Premium UI, monorepo structure and first user flow are ready to evolve.</Text>
      </GlassCard>

      <PremiumButton title="Continue" onPress={() => router.push('/onboarding/body-info')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { justifyContent: 'space-between', paddingVertical: 38 },
  kicker: { color: colors.goldSoft, fontSize: 12, fontWeight: '800', letterSpacing: 2 },
  title: { color: colors.text, fontSize: 45, fontWeight: '900', lineHeight: 50, marginTop: 18, letterSpacing: -1.4 },
  subtitle: { color: colors.muted, fontSize: 16, lineHeight: 25, marginTop: 18 },
  cardTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },
  cardText: { color: colors.muted, marginTop: 8, lineHeight: 22 },
});
