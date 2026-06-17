import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { Screen } from '@/components/ui/Screen';
import { colors } from '@/theme';

const goals = ['FIT', 'LEAN', 'BULK'];

export default function GoalScreen() {
  return (
    <Screen style={styles.screen}>
      <View>
        <Text style={styles.step}>STEP 03</Text>
        <Text style={styles.title}>AI recommends LEAN</Text>
        <Text style={styles.subtitle}>The user can accept or choose a different direction.</Text>
      </View>

      <View style={styles.goals}>
        {goals.map((goal) => (
          <GlassCard key={goal} style={goal === 'LEAN' ? styles.selected : undefined}>
            <Text style={styles.goal}>{goal}</Text>
            <Text style={styles.goalText}>{goal === 'LEAN' ? 'Recommended by AI' : 'Available option'}</Text>
          </GlassCard>
        ))}
      </View>

      <PremiumButton title="Enter Dashboard" onPress={() => router.replace('/(tabs)/home')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingVertical: 38 },
  step: { color: colors.goldSoft, fontSize: 12, fontWeight: '800', letterSpacing: 2 },
  title: { color: colors.text, fontSize: 35, fontWeight: '900', marginTop: 14, letterSpacing: -1 },
  subtitle: { color: colors.muted, fontSize: 16, lineHeight: 24, marginTop: 10 },
  goals: { flex: 1, gap: 14, marginTop: 34 },
  selected: { borderColor: colors.gold, backgroundColor: 'rgba(212,175,55,0.12)' },
  goal: { color: colors.text, fontSize: 26, fontWeight: '900', letterSpacing: 1 },
  goalText: { color: colors.muted, marginTop: 8 },
});
