import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import { PremiumButton } from '@/components/ui/PremiumButton';
import { Screen } from '@/components/ui/Screen';
import { getOrCreateAnonymousUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { colors, radius } from '@/theme';

export default function BodyInfoScreen() {
  const [age, setAge] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  async function handleContinue() {
    const parsedAge = Number(age);
    const parsedHeight = Number(heightCm);
    const parsedWeight = Number(weightKg.replace(',', '.'));

    if (!parsedAge || !parsedHeight || !parsedWeight) {
      Alert.alert('Missing info', 'Please enter your age, height and weight.');
      return;
    }

    if (parsedAge < 10 || parsedAge > 100) {
      Alert.alert('Invalid age', 'Please enter a valid age.');
      return;
    }

    if (parsedHeight < 80 || parsedHeight > 250) {
      Alert.alert('Invalid height', 'Please enter your height in centimeters.');
      return;
    }

    if (parsedWeight < 25 || parsedWeight > 300) {
      Alert.alert('Invalid weight', 'Please enter your weight in kilograms.');
      return;
    }

    try {
      setIsSaving(true);

      const user = await getOrCreateAnonymousUser();

      const { error } = await supabase.from('profiles').upsert(
        {
          id: user.id,
          email: user.email ?? null,
          age: parsedAge,
          height_cm: parsedHeight,
          weight_kg: parsedWeight,
          onboarding_completed: false,
        },
        {
          onConflict: 'id',
        }
      );

      if (error) {
        throw error;
      }

      router.push('/onboarding/photo-upload');
    } catch (error) {
      console.error('BODY_INFO_SAVE_ERROR', error);
      Alert.alert('Connection error', 'We could not save your profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Screen style={styles.screen}>
      <View>
        <Text style={styles.step}>STEP 01</Text>
        <Text style={styles.title}>Your basic body info</Text>
        <Text style={styles.subtitle}>We only ask for what AI needs to start.</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          value={age}
          onChangeText={setAge}
          placeholder="Age"
          placeholderTextColor={colors.muted}
          keyboardType="number-pad"
          style={styles.input}
        />

        <TextInput
          value={heightCm}
          onChangeText={setHeightCm}
          placeholder="Height (cm)"
          placeholderTextColor={colors.muted}
          keyboardType="number-pad"
          style={styles.input}
        />

        <TextInput
          value={weightKg}
          onChangeText={setWeightKg}
          placeholder="Weight (kg)"
          placeholderTextColor={colors.muted}
          keyboardType="decimal-pad"
          style={styles.input}
        />
      </View>

      <PremiumButton
        title={isSaving ? 'Saving...' : 'Upload Photos'}
        onPress={handleContinue}
        disabled={isSaving}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingVertical: 38 },
  step: { color: colors.goldSoft, fontSize: 12, fontWeight: '800', letterSpacing: 2 },
  title: { color: colors.text, fontSize: 35, fontWeight: '900', marginTop: 14, letterSpacing: -1 },
  subtitle: { color: colors.muted, fontSize: 16, marginTop: 10 },
  form: { gap: 14, marginTop: 42, flex: 1 },
  input: {
    height: 62,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: 20,
    fontSize: 17,
  },
});