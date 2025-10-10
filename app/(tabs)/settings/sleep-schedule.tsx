import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SettingsDetailTemplate } from '../../../components/SettingsDetailTemplate';
import { commonStyles, DESIGN } from '../../../constants/design';
import { saveUserProfile } from '../../../lib/database';
import { useHydrationStore } from '../../../stores/hydrationStore';

export default function SleepScheduleSettingsScreen() {
  const router = useRouter();
  const { userProfile, setUserProfile } = useHydrationStore();
  const [wakeTime, setWakeTime] = useState(userProfile?.wakeTime || '07:00');
  const [sleepTime, setSleepTime] = useState(userProfile?.sleepTime || '23:00');
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // 時刻フォーマット関数
  const formatTimeInput = (text: string) => {
    // 数字のみを抽出
    const numbers = text.replace(/\D/g, '');
    
    if (numbers.length === 0) return '';
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 4) {
      const hours = numbers.slice(0, -2);
      const minutes = numbers.slice(-2);
      return `${hours}:${minutes}`;
    }
    return numbers.slice(0, 4).replace(/(\d{2})(\d{2})/, '$1:$2');
  };

  // 変更検知
  useEffect(() => {
    const wakeChanged = wakeTime !== userProfile?.wakeTime;
    const sleepChanged = sleepTime !== userProfile?.sleepTime;
    setHasChanges(wakeChanged || sleepChanged);
  }, [wakeTime, sleepTime, userProfile?.wakeTime, userProfile?.sleepTime]);

  // 保存関数
  const handleSave = async () => {
    if (!userProfile) return;

    // 時刻のバリデーション
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(wakeTime) || !timeRegex.test(sleepTime)) {
      return;
    }

    setIsLoading(true);
    try {
      const updatedProfile = {
        ...userProfile,
        wakeTime,
        sleepTime,
      };
      await saveUserProfile(updatedProfile);
      setUserProfile(updatedProfile);
      setHasChanges(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SettingsDetailTemplate
      title="睡眠時間設定"
      onBackPress={() => router.push("/(tabs)/settings")}
    >
      <View style={commonStyles.inputGroup}>
        <View style={styles.timeContainer}>
          <View style={styles.timeInputGroup}>
            <Text style={commonStyles.label}>起床時間 *</Text>
            <View style={commonStyles.inputContainer}>
              <TextInput
                style={commonStyles.input}
                value={wakeTime}
                onChangeText={(text) => setWakeTime(formatTimeInput(text))}
                placeholder="07:00"
                placeholderTextColor={DESIGN.colors.secondary}
                keyboardType="numeric"
                maxLength={5}
              />
            </View>
          </View>
          
          <View style={styles.separator}>
            <Text style={styles.separatorText}>〜</Text>
          </View>
          
          <View style={styles.timeInputGroup}>
            <Text style={commonStyles.label}>就寝時間 *</Text>
            <View style={commonStyles.inputContainer}>
              <TextInput
                style={commonStyles.input}
                value={sleepTime}
                onChangeText={(text) => setSleepTime(formatTimeInput(text))}
                placeholder="23:00"
                placeholderTextColor={DESIGN.colors.secondary}
                keyboardType="numeric"
                maxLength={5}
              />
            </View>
          </View>
        </View>
        <Text style={commonStyles.description}>
          毎日の起床・就寝時間を設定してください。
        </Text>
      </View>

      <View style={commonStyles.infoCard}>
        <Text style={commonStyles.infoTitle}>睡眠時間について</Text>
        <Text style={commonStyles.infoText}>
          設定した睡眠時間は、通知の配信時間や水分摂取の目標計算に使用されます。
        </Text>
        <Text style={commonStyles.infoText}>
          起床時間: {wakeTime} | 就寝時間: {sleepTime}
        </Text>
      </View>

      <TouchableOpacity
        style={[commonStyles.saveButton, !hasChanges && commonStyles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={!hasChanges || isLoading}
        activeOpacity={0.8}
      >
        <Text style={[commonStyles.saveButtonText, !hasChanges && commonStyles.saveButtonTextDisabled]}>
          {isLoading ? '保存中...' : '保存'}
        </Text>
      </TouchableOpacity>
    </SettingsDetailTemplate>
  );
}

const styles = {
  timeContainer: {
    flexDirection: 'row' as const,
    alignItems: 'flex-end' as const,
    gap: 12,
  },
  timeInputGroup: {
    flex: 1,
  },
  separator: {
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    height: 60, // 入力フィールドの高さに合わせる（paddingVertical: 16 + fontSize: 18 + margin）
  },
  separatorText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#0369A1',
  },
};
