import { router } from 'expo-router';
import { Image, Platform, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { exactAssets } from '@/assets/exact/assets';
import { ExactGoldButton } from '@/components/exact/ExactGoldButton';
import { ExactScreen } from '@/components/exact/ExactScreen';
import { exactColors } from '@/theme/exact-match';

export default function WelcomeScreen() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const scale = Math.min(width / 393, height / 852, 1);
  const bottomSafeOffset = Platform.OS === 'android' ? Math.max(insets.bottom, 34) : Math.max(insets.bottom, 12);

  return (
    <ExactScreen contentStyle={styles.screen} waveMode="full">
      <View style={[styles.brandBlock, { marginTop: Math.max(40, height * 0.085 - insets.top * 0.2) }]}>
        <Image source={exactAssets.logo.full} style={{ width: 136 * scale, height: 96 * scale }} resizeMode="contain" />
      </View>

      <View style={[styles.copyBlock, { marginTop: 34 * scale }]}> 
        <Text style={[styles.hello, { fontSize: 48 * scale, lineHeight: 55 * scale }]}>Hello 👋</Text>
        <Text style={[styles.copy, { fontSize: 18 * scale, lineHeight: 28 * scale }]}>Your AI-powered{`\n`}fitness & health{`\n`}assistant</Text>
      </View>

      <View style={[styles.bottom, { bottom: Math.max(31, height * 0.045) + bottomSafeOffset }]}> 
        <ExactGoldButton
          title="Swipe to Start    →"
          lightText
          onPress={() => router.push('/onboarding/body-info')}
          style={[styles.welcomeButton, { width: Math.min(width - 118, 230 * scale) }]}
          buttonStyle={{ height: 48 * scale, borderRadius: 24 * scale }}
          textStyle={{ fontSize: 14.8 * scale, fontWeight: '500' }}
        />

        <View style={[styles.dots, { marginTop: 18 * scale }]}> 
          <View style={[styles.dotActive, { width: 8 * scale, height: 8 * scale }]} />
          <View style={[styles.dot, { width: 8 * scale, height: 8 * scale }]} />
          <View style={[styles.dot, { width: 8 * scale, height: 8 * scale }]} />
        </View>
      </View>
    </ExactScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    alignItems: 'center',
  },
  brandBlock: {
    alignItems: 'center',
  },
  copyBlock: {
    alignItems: 'center',
  },
  hello: {
    color: exactColors.text,
    fontWeight: '500',
    letterSpacing: -1.4,
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 2,
  },
  copy: {
    color: exactColors.text,
    textAlign: 'center',
    marginTop: 18,
    fontWeight: '400',
    textShadowColor: 'rgba(0,0,0,0.40)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  bottom: {
    position: 'absolute',
    alignItems: 'center',
    left: 0,
    right: 0,
  },
  welcomeButton: {
    alignSelf: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  dotActive: {
    borderRadius: 999,
    backgroundColor: exactColors.goldLight,
  },
  dot: {
    borderRadius: 999,
    backgroundColor: 'rgba(246,217,143,0.38)',
  },
});
