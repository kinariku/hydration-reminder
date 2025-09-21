import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { CommonHeader } from '../../../components/common-header';
import { saveUserProfile } from '../../../lib/database';
import { scheduleReminders } from '../../../lib/notifications';
import { useHydrationStore } from '../../../stores/hydrationStore';

export default function ProfileSettingsScreen() {
  const { userProfile, setUserProfile, calculateDailyGoal } = useHydrationStore();
  
  const [weight, setWeight] = useState(userProfile?.weightKg?.toString() || '');
  const [height, setHeight] = useState(userProfile?.heightCm?.toString() || '');
  const [sex, setSex] = useState<'male' | 'female' | 'other'>(userProfile?.sex || 'male');
  const [activityLevel, setActivityLevel] = useState<'low' | 'medium' | 'high'>(userProfile?.activityLevel || 'medium');
  const [wakeTime, setWakeTime] = useState(userProfile?.wakeTime || '07:00');
  const [sleepTime, setSleepTime] = useState(userProfile?.sleepTime || '23:00');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!weight || isNaN(Number(weight)) || Number(weight) <= 0) {
      Alert.alert('エラー', '体重を正しく入力してください');
      return;
    }

    // 時刻のバリデーション
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(wakeTime) || !timeRegex.test(sleepTime)) {
      Alert.alert('エラー', '時刻はHH:MM形式で入力してください（例: 07:00）');
      return;
    }

    setIsLoading(true);

    try {
      const profile = {
        id: userProfile?.id || Date.now().toString(),
        weightKg: Number(weight),
        sex,
        heightCm: height ? Number(height) : undefined,
        activityLevel,
        wakeTime,
        sleepTime,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      await saveUserProfile(profile);
      setUserProfile(profile);
      
      const goal = calculateDailyGoal(profile);
      await scheduleReminders(wakeTime, sleepTime, goal.targetMl);

      Alert.alert('成功', 'プロフィールを更新しました');
      router.push('/(tabs)/settings');
    } catch (error) {
      console.error('Failed to save profile:', error);
      Alert.alert('エラー', 'プロフィールの保存に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const previewGoal = calculateDailyGoal({
    weightKg: Number(weight) || 0,
    activityLevel,
  });

  // 性別選択のオプション
  const sexOptions = [
    { label: '男性', value: 'male', icon: '👨' },
    { label: '女性', value: 'female', icon: '👩' },
    { label: 'その他', value: 'other', icon: '👤' },
  ];

  // 活動レベル選択のオプション
  const activityOptions = [
    { label: '低い', value: 'low', description: 'デスクワーク中心', icon: '🪑' },
    { label: '中程度', value: 'medium', description: '適度な運動', icon: '🚶' },
    { label: '高い', value: 'high', description: '激しい運動', icon: '🏃' },
  ];

  return (
    <View style={styles.container}>
      <CommonHeader title="プロフィール設定" />
      
      <ScrollView contentContainerStyle={styles.content}>
        {/* 体重入力 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>体重 (kg) *</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={weight}
              onChangeText={setWeight}
              placeholder="70"
              keyboardType="numeric"
              maxLength={3}
            />
            <Text style={styles.unit}>kg</Text>
          </View>
        </View>

        {/* 身長入力 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>身長 (cm) - 任意</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={height}
              onChangeText={setHeight}
              placeholder="170"
              keyboardType="numeric"
              maxLength={3}
            />
            <Text style={styles.unit}>cm</Text>
          </View>
        </View>

        {/* 性別選択 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>性別</Text>
          <View style={styles.cardContainer}>
            {sexOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.sexCard,
                  sex === option.value && styles.sexCardSelected
                ]}
                onPress={() => setSex(option.value as 'male' | 'female' | 'other')}
              >
                <Text style={styles.sexIcon}>{option.icon}</Text>
                <Text style={[
                  styles.sexLabel,
                  sex === option.value && styles.sexLabelSelected
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 活動レベル選択 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>活動レベル</Text>
          <View style={styles.activityContainer}>
            {activityOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.activityCard,
                  activityLevel === option.value && styles.activityCardSelected
                ]}
                onPress={() => setActivityLevel(option.value as 'low' | 'medium' | 'high')}
              >
                <Text style={styles.activityIcon}>{option.icon}</Text>
                <Text style={[
                  styles.activityLabel,
                  activityLevel === option.value && styles.activityLabelSelected
                ]}>
                  {option.label}
                </Text>
                <Text style={[
                  styles.activityDescription,
                  activityLevel === option.value && styles.activityDescriptionSelected
                ]}>
                  {option.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>


        {/* 目標摂取量プレビュー */}
        {weight && (
          <View style={styles.previewContainer}>
            <Text style={styles.previewTitle}>💧 目標摂取量</Text>
            <Text style={styles.previewAmount}>{previewGoal.targetMl}ml</Text>
            <Text style={styles.previewDescription}>
              体重 {weight}kg × 35ml + 活動レベル補正
            </Text>
          </View>
        )}

        <TouchableOpacity
          onPress={handleSave}
          disabled={isLoading || !weight}
          style={[styles.button, (isLoading || !weight) && styles.buttonDisabled]}
        >
          <Text style={styles.buttonText}>
            {isLoading ? '保存中...' : 'プロフィールを更新'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1C1C1E',
  },
  unit: {
    fontSize: 16,
    color: '#8E8E93',
    marginLeft: 8,
  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  sexCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E5EA',
  },
  sexCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  sexIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  sexLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  sexLabelSelected: {
    color: '#007AFF',
  },
  activityContainer: {
    gap: 12,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E5EA',
  },
  activityCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  activityIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  activityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    flex: 1,
  },
  activityLabelSelected: {
    color: '#007AFF',
  },
  activityDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  activityDescriptionSelected: {
    color: '#007AFF',
  },
  previewContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
    textAlign: 'center',
  },
  previewAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  previewDescription: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
