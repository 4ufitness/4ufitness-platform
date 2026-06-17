import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { PremiumButton } from '@/components/ui/PremiumButton';
import { Screen } from '@/components/ui/Screen';
import { getOrCreateAnonymousUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { colors, radius } from '@/theme';

type PhotoKey = 'front' | 'side' | 'back';

type SelectedPhotos = {
  front?: string;
  side?: string;
  back?: string;
};

const photoLabels: Record<PhotoKey, string> = {
  front: 'Front',
  side: 'Side',
  back: 'Back',
};

const photoDescriptions: Record<PhotoKey, string> = {
  front: 'Front body photo',
  side: 'Side body photo',
  back: 'Back body photo',
};

export default function PhotoUploadScreen() {
  const [photos, setPhotos] = useState<SelectedPhotos>({});
  const [isUploading, setIsUploading] = useState(false);

  async function pickImage(type: PhotoKey) {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert('Permission needed', 'Please allow photo access to continue.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 0.85,
        aspect: [3, 4],
        mediaTypes: ['images'],
      });

      if (result.canceled) {
        return;
      }

      const uri = result.assets?.[0]?.uri;

      if (!uri) {
        Alert.alert('Photo error', 'Selected photo could not be read.');
        return;
      }

      setPhotos((current) => ({
        ...current,
        [type]: uri,
      }));
    } catch (error) {
      console.error('PHOTO_PICK_ERROR', error);
      Alert.alert('Photo error', 'We could not select this photo. Please try again.');
    }
  }

  async function uploadPhoto(userId: string, type: PhotoKey, uri: string) {
    const fileInfo = await FileSystem.getInfoAsync(uri);

    if (!fileInfo.exists) {
      throw new Error(`${type} photo file does not exist.`);
    }

    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const arrayBuffer = decode(base64);
    const filePath = `${userId}/${type}-${Date.now()}.jpg`;

    const { data, error } = await supabase.storage
      .from('body-photos')
      .upload(filePath, arrayBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) {
      throw error;
    }

    return data.path;
  }

  async function handleContinue() {
    if (!photos.front || !photos.side || !photos.back) {
      Alert.alert('Missing photos', 'Please upload front, side and back photos.');
      return;
    }

    try {
      setIsUploading(true);

      const user = await getOrCreateAnonymousUser();

      const frontPath = await uploadPhoto(user.id, 'front', photos.front);
      const sidePath = await uploadPhoto(user.id, 'side', photos.side);
      const backPath = await uploadPhoto(user.id, 'back', photos.back);

      const { error } = await supabase.from('body_photos').insert({
        user_id: user.id,
        front_photo_path: frontPath,
        side_photo_path: sidePath,
        back_photo_path: backPath,
        status: 'uploaded',
      });

      if (error) {
        throw error;
      }

      router.push('/onboarding/ai-analysis');
    } catch (error) {
      console.error('PHOTO_UPLOAD_ERROR', error);
      Alert.alert('Upload failed', 'We could not upload your photos. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Screen style={styles.screen}>
      <View>
        <Text style={styles.step}>STEP 02</Text>
        <Text style={styles.title}>Upload your body photos</Text>
        <Text style={styles.subtitle}>
          Front, side and back photos help AI create your transformation plan.
        </Text>
      </View>

      <View style={styles.grid}>
        {(['front', 'side', 'back'] as PhotoKey[]).map((type) => {
          const selectedUri = photos[type];

          return (
            <Pressable
              key={type}
              style={styles.uploadCard}
              onPress={() => pickImage(type)}
              disabled={isUploading}
            >
              {selectedUri ? (
                <>
                  <Image source={{ uri: selectedUri }} style={styles.preview} />
                  <View style={styles.previewOverlay}>
                    <Text style={styles.previewLabel}>{photoLabels[type]}</Text>
                    <Text style={styles.previewChange}>Tap to change</Text>
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.uploadIcon}>＋</Text>
                  <Text style={styles.uploadTitle}>{photoLabels[type]}</Text>
                  <Text style={styles.uploadSubtitle}>{photoDescriptions[type]}</Text>
                </>
              )}
            </Pressable>
          );
        })}
      </View>

      <PremiumButton
        title={isUploading ? 'Uploading...' : 'Start AI Analysis'}
        onPress={handleContinue}
        disabled={isUploading}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingVertical: 38,
  },
  step: {
    color: colors.goldSoft,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
  },
  title: {
    color: colors.text,
    fontSize: 35,
    fontWeight: '900',
    marginTop: 14,
    letterSpacing: -1,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 16,
    marginTop: 10,
    lineHeight: 24,
  },
  grid: {
    marginTop: 34,
    gap: 14,
    flex: 1,
  },
  uploadCard: {
    height: 145,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  uploadIcon: {
    color: colors.goldSoft,
    fontSize: 34,
    fontWeight: '500',
  },
  uploadTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 10,
  },
  uploadSubtitle: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 4,
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  previewOverlay: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    borderRadius: radius.md,
    backgroundColor: 'rgba(0,0,0,0.52)',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  previewLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  previewChange: {
    color: colors.goldSoft,
    fontSize: 12,
    marginTop: 2,
  },
});