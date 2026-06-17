import { StyleSheet, Text } from 'react-native';
import { Screen } from '@/components/ui/Screen';
import { colors } from '@/theme';

export default function PlaceholderScreen() {
  return (
    <Screen style={styles.screen}>
      <Text style={styles.title}>Ai Coach</Text>
      <Text style={styles.subtitle}>This screen will be designed in Sprint 1.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { justifyContent: 'center' },
  title: { color: colors.text, fontSize: 36, fontWeight: '900' },
  subtitle: { color: colors.muted, fontSize: 16, marginTop: 12 },
});
