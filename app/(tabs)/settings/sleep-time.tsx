import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SettingsDetailTemplate } from '../../../components/SettingsDetailTemplate';
import { RADIUS } from '../../../constants/radius';
import { saveUserProfile } from '../../../lib/database';
import { useHydrationStore } from '../../../stores/hydrationStore';

export default function SleepTimeSettingsScreen() {
  const router = useRouter();
  const { userProfile, setUserProfile } = useHydrationStore();
  const [sleepTime, setSleepTime] = useState(userProfile?.sleepTime || '23:00');
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // 時刻フォーマット関数
  const formatTimeInput = (text: string) => {
    const numbers = text.replace(/\D/g, '');
    
    if (numbers.length === 0) return '';
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}:${numbers.slice(2)}`;
    }
    return `${numbers.slice(0, 2)}:${numbers.slice(2, 4)}`;
  };

  const handleSleepTimeChange = (text: string) => {
    const formatted = formatTimeInput(text);
    setSleepTime(formatted);
  };

  // 変更検知
  useEffect(() => {
    if (!userProfile) return;
    
    const hasSleepTimeChanges = sleepTime !== userProfile.sleepTime;
    setHasChanges(hasSleepTimeChanges);
  }, [sleepTime, userProfile]);

  // 保存関数
  const handleSave = async () => {
    if (!userProfile) return;

    // 時刻のバリデーション
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(sleepTime)) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);
    try {
      const updatedProfile = {
        ...userProfile,
        sleepTime,
      };

      await saveUserProfile(updatedProfile);
      setUserProfile(updatedProfile);
      setHasChanges(false);
      console.log('Sleep time saved successfully');
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SettingsDetailTemplate
      title="就寝時間設定"
      onBackPress={() => router.push("/(tabs)/settings")}
    >
      <View style={styles.inputGroup}>
        <Text style={styles.label}>就寝時間</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={sleepTime}
            onChangeText={handleSleepTimeChange}
            placeholder="23:00"
            keyboardType="numeric"
            maxLength={5}
          />
        </View>
        <Text style={styles.description}>
          通知の終了時間として使用されます
        </Text>
      </View>

      <View style={styles.saveButtonContainer}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            !hasChanges && styles.saveButtonDisabled
          ]}
          onPress={handleSave}
          disabled={!hasChanges || isLoading}
        >
          <Text style={[
            styles.saveButtonText,
            !hasChanges && styles.saveButtonTextDisabled
          ]}>
            {isLoading ? '保存中...' : '保存'}
          </Text>
        </TouchableOpacity>
      </View>
    </SettingsDetailTemplate>
  );
}

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: 32,
  },
  label: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0369A1',
    marginBottom: 12,
  },
  inputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: RADIUS.input,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  input: {
    fontSize: 16,
    color: '#0369A1',
    fontWeight: '600',
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#0284C7',
    marginTop: 8,
    fontWeight: '500',
  },
  saveButtonContainer: {
    marginTop: 32,
  },
  saveButton: {
    backgroundColor: '#0EA5E9',
    borderRadius: RADIUS.input,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: 'rgba(14, 165, 233, 0.3)',
    shadowOpacity: 0.1,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  saveButtonTextDisabled: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
});
