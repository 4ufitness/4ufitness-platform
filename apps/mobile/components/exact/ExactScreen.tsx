import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { ReactNode } from 'react';
import { Image, Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { exactAssets } from '@/assets/exact/assets';
import { exactGradient, exactSpacing } from '@/theme/exact-match';

type ExactScreenProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  showWave?: boolean;
  waveMode?: 'low' | 'full' | 'home' | 'none';
};

export function ExactScreen({ children, style, contentStyle, showWave = true, waveMode = 'low' }: ExactScreenProps) {
  const insets = useSafeAreaInsets();
  const shouldShowWave = showWave && waveMode !== 'none';
  const bottomSafePadding = Platform.OS === 'android' ? Math.max(insets.bottom, 38) : Math.max(insets.bottom, 18);
  const topSafePadding = Platform.OS === 'android' ? 12 : 8;

  return (
    <LinearGradient colors={exactGradient.screen} style={[styles.root, style]}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <Image source={exactAssets.backgrounds.vignette} style={styles.vignette} resizeMode="cover" />

      {shouldShowWave ? (
        <>
          {waveMode === 'full' || waveMode === 'home' ? (
            <Image
              source={exactAssets.backgrounds.wave}
              style={[styles.waveMid, waveMode === 'home' && styles.waveHome]}
              resizeMode="cover"
            />
          ) : null}
          <Image source={exactAssets.backgrounds.wave} style={styles.waveLow} resizeMode="cover" />
        </>
      ) : null}

      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={[styles.content, { paddingTop: topSafePadding, paddingBottom: bottomSafePadding }, contentStyle]}>{children}</View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
  },
  safe: {
    flex: 1,
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
    paddingHorizontal: exactSpacing.pageX,
  },
  vignette: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    left: 0,
    top: 0,
    opacity: 1,
  },
  waveMid: {
    position: 'absolute',
    width: '142%',
    height: 520,
    left: '-23%',
    bottom: 44,
    opacity: 0.40,
    transform: [{ rotate: '-1.5deg' }],
  },
  waveHome: {
    bottom: 18,
    opacity: 0.34,
  },
  waveLow: {
    position: 'absolute',
    width: '145%',
    height: 520,
    left: '-23%',
    bottom: -230,
    opacity: 0.54,
  },
});
