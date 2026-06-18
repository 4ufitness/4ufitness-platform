import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { exactAssets } from '@/assets/exact/assets';
import { ExactGoldButton } from '@/components/exact/ExactGoldButton';
import { ExactHeader } from '@/components/exact/ExactHeader';
import { ExactScreen } from '@/components/exact/ExactScreen';
import { getOrCreateAnonymousUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { exactColors, exactRadius } from '@/theme/exact-match';

type PhotoKey = 'front' | 'side' | 'back';
type PhotoState = Record<PhotoKey, string | null>;

type UploadedPaths = {
  front_photo_path: string;
  side_photo_path: string;
  back_photo_path: string;
};

const labels: { key: PhotoKey; title: string; subtitle: string }[] = [
  { key: 'front', title: 'Front', subtitle: 'Straight' },
  { key: 'side', title: 'Side', subtitle: 'Profile' },
  { key: 'back', title: 'Back', subtitle: 'Rear' },
];

const initialPhotos: PhotoState = { front: null, side: null, back: null };

export default function PhotoUploadScreen() {
  const [photos, setPhotos] = useState<PhotoState>(initialPhotos);
  const [isUploading, setIsUploading] = useState(false);

  async function pickPhoto(type: PhotoKey) {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow photo access to upload your body photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.9,
    });

    if (result.canceled || !result.assets?.[0]?.uri) return;
    setPhotos((current) => ({ ...current, [type]: result.assets[0].uri }));
  }

  async function uploadPhoto(userId: string, type: PhotoKey, uri: string) {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) throw new Error(`${type} photo not found.`);

    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const filePath = `${userId}/${type}-${Date.now()}.jpg`;

    const { error } = await supabase.storage
      .from('body-photos')
      .upload(filePath, decode(base64), {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) throw error;
    return filePath;
  }

  async function handleContinue() {
    if (!photos.front || !photos.side || !photos.back) {
      Alert.alert('Photos required', 'Please upload front, side and back photos for AI analysis.');
      return;
    }

    try {
      setIsUploading(true);
      const user = await getOrCreateAnonymousUser();

      const [front, side, back] = await Promise.all([
        uploadPhoto(user.id, 'front', photos.front),
        uploadPhoto(user.id, 'side', photos.side),
        uploadPhoto(user.id, 'back', photos.back),
      ]);

      const uploaded: UploadedPaths = {
        front_photo_path: front,
        side_photo_path: side,
        back_photo_path: back,
      };

      const { error } = await supabase.from('body_photos').insert({
        user_id: user.id,
        ...uploaded,
        status: 'uploaded',
      });

      if (error) throw error;
      router.push('/onboarding/ai-analysis');
    } catch (error) {
      console.error('PHOTO_UPLOAD_ERROR', error);
      Alert.alert('Upload error', 'We could not upload your photos. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }

  const uploadedCount = labels.filter((item) => photos[item.key]).length;

  return (
    <ExactScreen waveMode="full">
      <ExactHeader title="UPLOAD YOUR PHOTOS" showBack progress={0.52} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.copyBox}>
          <Text style={styles.title}>Front, side, back</Text>
          <Text style={styles.subtitle}>
            AI reads your body structure from three angles and creates the first transformation direction.
          </Text>
        </View>

        <View style={styles.progressMini}>
          <Text style={styles.progressText}>{uploadedCount}/3 photos uploaded</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${(uploadedCount / 3) * 100}%` }]} />
          </View>
        </View>

        <View style={styles.tiles}>
          {labels.map((item) => {
            const active = Boolean(photos[item.key]);
            return (
              <Pressable
                key={item.key}
                style={[styles.uploadTile, active && styles.uploadTileActive]}
                onPress={() => pickPhoto(item.key)}
                disabled={isUploading}
              >
                {photos[item.key] ? (
                  <Image source={{ uri: photos[item.key] as string }} style={styles.preview} resizeMode="cover" />
                ) : (
                  <View style={styles.placeholder}>
                    <Image source={exactAssets.icons.upload} style={styles.bodyIcon} resizeMode="contain" />
                    <View style={styles.cameraCircle}>
                      <Image source={exactAssets.icons.camera} style={styles.cameraIcon} resizeMode="contain" />
                    </View>
                  </View>
                )}

                <View style={styles.tileFooter}>
                  <Text style={styles.tileLabel}>{item.title}</Text>
                  <Text style={styles.tileSub}>{active ? 'Ready' : item.subtitle}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.securityBox}>
          <Text style={styles.securityTitle}>Private body analysis</Text>
          <Text style={styles.securityText}>
            Keep the same lighting and distance for best results. Your full plan will be generated after this step.
          </Text>
        </View>
      </ScrollView>

      <ExactGoldButton
        title={isUploading ? 'Uploading...' : 'Continue'}
        onPress={handleContinue}
        disabled={isUploading}
        style={styles.button}
      />
    </ExactScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingTop: 4,
    paddingBottom: 82,
  },
  copyBox: {
    alignItems: 'center',
    marginBottom: 18,
  },
  title: {
    color: exactColors.text,
    fontSize: 25,
    lineHeight: 31,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    color: exactColors.textSoft,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 8,
    marginHorizontal: 10,
    fontWeight: '600',
  },
  progressMini: {
    marginBottom: 18,
  },
  progressText: {
    color: exactColors.goldLight,
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
  },
  progressTrack: {
    height: 5,
    width: 160,
    alignSelf: 'center',
    borderRadius: 999,
    backgroundColor: 'rgba(246,217,143,0.16)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: exactColors.goldLight,
  },
  tiles: {
    flexDirection: 'row',
    gap: 9,
  },
  uploadTile: {
    flex: 1,
    height: 148,
    borderRadius: exactRadius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: exactColors.border,
    backgroundColor: 'rgba(5, 26, 17, 0.74)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  uploadTileActive: {
    borderStyle: 'solid',
    borderColor: exactColors.borderStrong,
  },
  preview: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  bodyIcon: {
    width: 42,
    height: 50,
    opacity: 0.76,
  },
  cameraCircle: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    backgroundColor: 'rgba(246,217,143,0.10)',
    borderWidth: 1,
    borderColor: exactColors.borderSoft,
  },
  cameraIcon: {
    width: 21,
    height: 21,
  },
  tileFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.22)',
  },
  tileLabel: {
    color: exactColors.goldLight,
    fontSize: 12.5,
    fontWeight: '900',
  },
  tileSub: {
    color: exactColors.textSoft,
    fontSize: 10.5,
    fontWeight: '700',
    marginTop: 1,
  },
  securityBox: {
    marginTop: 20,
    borderRadius: exactRadius.lg,
    borderWidth: 1,
    borderColor: exactColors.borderSoft,
    backgroundColor: 'rgba(7,31,20,0.50)',
    padding: 16,
  },
  securityTitle: {
    color: exactColors.goldLight,
    fontSize: 14,
    fontWeight: '900',
  },
  securityText: {
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
