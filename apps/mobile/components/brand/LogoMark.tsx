import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme';

export function LogoMark() {
  return (
    <View style={styles.wrap}>
      <LinearGradient colors={[colors.goldSoft, colors.gold, colors.goldDark]} style={styles.symbol}>
        <Text style={styles.symbolText}>4U</Text>
      </LinearGradient>
      <Text style={styles.brand}>4UFITNESS</Text>
      <Text style={styles.tagline}>TRANSFORM YOUR BODY. UPGRADE YOUR LIFE.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  symbol: {
    width: 92,
    height: 92,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  symbolText: { color: '#11170F', fontSize: 34, fontWeight: '900', letterSpacing: -2 },
  brand: { color: colors.text, fontSize: 28, fontWeight: '900', letterSpacing: 2.2 },
  tagline: { color: colors.goldSoft, fontSize: 10, letterSpacing: 1.4, marginTop: 8, textAlign: 'center' },
});
