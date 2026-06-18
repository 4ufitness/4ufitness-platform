import { router } from 'expo-router';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { exactAssets } from '@/assets/exact/assets';
import { ExactFeatureTile } from '@/components/exact/ExactFeatureTile';
import { ExactLogo } from '@/components/exact/ExactLogo';
import { ExactScreen } from '@/components/exact/ExactScreen';

export default function HomeScreen() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const scale = Math.min(width / 393, height / 852, 1);
  const isCompact = height < 780;
  const cardHeight = Math.max(118, Math.min(isCompact ? 124 : 137, height * 0.158));
  const iconSize = Math.max(42, Math.min(52, 50 * scale));

  return (
    <ExactScreen waveMode="home">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: Math.max(4, 10 - insets.top * 0.06),
            paddingBottom: Math.max(126, 96 + insets.bottom),
          },
        ]}
      >
        <View style={[styles.logo, { marginBottom: (isCompact ? 16 : 22) * scale }]}> 
          <ExactLogo size="word" />
        </View>

        <View style={styles.grid}>
          <ExactFeatureTile
            icon={exactAssets.icons.workout}
            title="Workout"
            subtitle="Custom plans"
            iconSize={iconSize}
            cardStyle={{ height: cardHeight }}
            onPress={() => router.push('/plan')}
          />
          <ExactFeatureTile
            icon={exactAssets.icons.nutrition}
            title="Nutrition"
            subtitle="Meal plans"
            iconSize={iconSize}
            cardStyle={{ height: cardHeight }}
            onPress={() => router.push('/plan')}
          />
          <ExactFeatureTile
            icon={exactAssets.icons.weightLoss}
            title={'Weight Loss\n& Gain'}
            subtitle="Smart tracking"
            iconSize={iconSize}
            cardStyle={{ height: cardHeight }}
            onPress={() => router.push('/progress')}
          />
          <ExactFeatureTile
            icon={exactAssets.icons.faceYoga}
            title="Face Yoga"
            subtitle="Daily routines"
            iconSize={iconSize}
            cardStyle={{ height: cardHeight }}
            onPress={() => router.push('/plan')}
          />
          <ExactFeatureTile
            icon={exactAssets.icons.sleep}
            title="Sleep Tracking"
            subtitle="Better sleep"
            iconSize={iconSize}
            cardStyle={{ height: cardHeight }}
            onPress={() => router.push('/profile')}
          />
          <ExactFeatureTile
            icon={exactAssets.icons.aiAssistant}
            title="AI Assistant"
            subtitle="24/7 support"
            iconSize={iconSize}
            cardStyle={{ height: cardHeight }}
            onPress={() => router.push('/ai-coach')}
          />
        </View>
      </ScrollView>
    </ExactScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
  },
  logo: {
    alignItems: 'center',
    marginTop: 0,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
});
