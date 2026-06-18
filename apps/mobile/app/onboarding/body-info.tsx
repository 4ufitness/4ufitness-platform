import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ExactGoldButton } from '@/components/exact/ExactGoldButton';
import { ExactHeader } from '@/components/exact/ExactHeader';
import { ExactScreen } from '@/components/exact/ExactScreen';
import { getOrCreateAnonymousUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { exactColors, exactRadius } from '@/theme/exact-match';

function cleanNumber(value: string) {
  return Number(value.replace(',', '.').trim());
}

export default function BodyInfoScreen() {
  const [age, setAge] = useState('25');
  const [height, setHeight] = useState('175');
  const [weight, setWeight] = useState('75');
  const [isSaving, setIsSaving] = useState(false);

  async function handleContinue() {
    const parsedAge = cleanNumber(age);
    const parsedHeight = cleanNumber(height);
    const parsedWeight = cleanNumber(weight);

    if (!parsedAge || parsedAge < 12 || parsedAge > 90) {
      Alert.alert('Check your age', 'Please enter a valid age.');
      return;
    }

    if (!parsedHeight || parsedHeight < 100 || parsedHeight > 230) {
      Alert.alert('Check your height', 'Please enter your height in centimeters.');
      return;
    }

    if (!parsedWeight || parsedWeight < 30 || parsedWeight > 250) {
      Alert.alert('Check your weight', 'Please enter your weight in kilograms.');
      return;
    }

    try {
      setIsSaving(true);
      const user = await getOrCreateAnonymousUser();

      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        age: Math.round(parsedAge),
        height_cm: Math.round(parsedHeight),
        weight_kg: parsedWeight,
        onboarding_completed: false,
      });

      if (error) throw error;
      router.push('/onboarding/photo-upload');
    } catch (error) {
      console.error('BODY_INFO_SAVE_ERROR', error);
      Alert.alert('Profile error', 'We could not save your information. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <ExactScreen waveMode="full">
      <ExactHeader title="TELL US ABOUT YOU" showBack progress={0.34} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scroll}
        >
          <View style={styles.copyBox}>
            <Text style={styles.kicker}>AI NEEDS ONLY THE BASICS</Text>
            <Text style={styles.title}>Your personal system starts here.</Text>
            <Text style={styles.subtitle}>
              No long questionnaire. Add your body basics and AI will handle the transformation logic.
            </Text>
          </View>

          <View style={styles.fields}>
            <InfoInput label="Age" value={age} onChangeText={setAge} suffix="" />
            <InfoInput label="Height" value={height} onChangeText={setHeight} suffix="cm" />
            <InfoInput label="Weight" value={weight} onChangeText={setWeight} suffix="kg" />
          </View>

          <View style={styles.miniCard}>
            <Text style={styles.miniTitle}>AI decides the rest</Text>
            <Text style={styles.miniText}>
              Workout, meal plan, cardio, face yoga and sleep are generated automatically after analysis.
            </Text>
          </View>
        </ScrollView>

        <ExactGoldButton
          title={isSaving ? 'Saving...' : 'Continue'}
          onPress={handleContinue}
          disabled={isSaving}
          style={styles.button}
        />
      </KeyboardAvoidingView>
    </ExactScreen>
  );
}

function InfoInput({
  label,
  value,
  suffix,
  onChangeText,
}: {
  label: string;
  value: string;
  suffix: string;
  onChangeText: (value: string) => void;
}) {
  return (
    <View style={styles.inputRow}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputValueBox}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType="numeric"
          placeholderTextColor={exactColors.muted}
          style={styles.input}
          maxFontSizeMultiplier={1.05}
        />
        {suffix ? <Text style={styles.suffix}>{suffix}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scroll: {
    paddingTop: 8,
    paddingBottom: 72,
  },
  copyBox: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  kicker: {
    color: exactColors.goldLight,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  title: {
    color: exactColors.text,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '900',
    marginTop: 10,
    textAlign: 'center',
  },
  subtitle: {
    color: exactColors.textSoft,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
  fields: {
    gap: 8,
  },
  inputRow: {
    height: 51,
    borderRadius: exactRadius.md,
    borderWidth: 1,
    borderColor: exactColors.border,
    backgroundColor: 'rgba(5, 26, 17, 0.82)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  inputLabel: {
    width: 92,
    color: exactColors.goldLight,
    fontSize: 14,
    fontWeight: '900',
  },
  inputValueBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  input: {
    minWidth: 82,
    color: exactColors.text,
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'right',
    paddingVertical: 0,
  },
  suffix: {
    color: exactColors.textSoft,
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 6,
  },
  miniCard: {
    marginTop: 20,
    borderRadius: exactRadius.lg,
    borderWidth: 1,
    borderColor: exactColors.borderSoft,
    backgroundColor: 'rgba(7, 31, 20, 0.52)',
    padding: 16,
  },
  miniTitle: {
    color: exactColors.goldLight,
    fontSize: 14,
    fontWeight: '900',
  },
  miniText: {
    color: exactColors.textSoft,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
    fontWeight: '600',
  },
  button: {
    marginTop: 10,
    marginBottom: 12,
  },
});
