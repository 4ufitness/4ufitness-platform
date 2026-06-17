import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { LogoMark } from '@/components/brand/LogoMark';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { Screen } from '@/components/ui/Screen';
import { colors } from '@/theme';

export default function SplashScreen() {
  return (
    <Screen style={styles.screen}>
      <View style={styles.center}>
        <LogoMark />
        <Text style={styles.copy}>AI-powered personal transformation system.</Text>
      </View>
      <PremiumButton title="Start Foundation Demo" onPress={() => router.push('/welcome')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { justifyContent: 'space-between', paddingVertical: 44 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  copy: { color: colors.muted, textAlign: 'center', marginTop: 22, fontSize: 15, lineHeight: 23 },
});
