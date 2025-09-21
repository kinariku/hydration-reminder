import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { saveUserProfile } from '../lib/database';
import { scheduleNextReminder } from '../lib/notifications';
import { useHydrationStore } from '../stores/hydrationStore';

export default function OnboardingScreen() {
  const { setUserProfile, setOnboarded } = useHydrationStore();
  
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [sex, setSex] = useState<'male' | 'female' | 'other'>('male');
  const [activityLevel, setActivityLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [sleepTime, setSleepTime] = useState('23:00');
  const [isLoading, setIsLoading] = useState(false);

  const handleComplete = async () => {
    if (!weight || isNaN(Number(weight)) || Number(weight) <= 0) {
      Alert.alert('エラー', '体重を正しく入力してください');
      return;
    }

    setIsLoading(true);

    try {
      const profile = {
        id: Date.now().toString(),
        weightKg: Number(weight),
        sex,
        heightCm: height ? Number(height) : undefined,
        activityLevel,
        wakeTime,
        sleepTime,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      // Save to database
      await saveUserProfile(profile);
      
      // Update store
      setUserProfile(profile);
      setOnboarded(true);

      // Schedule notifications
      const goal = calculateDailyGoal(profile);
      await scheduleNextReminder(wakeTime, sleepTime, goal.targetMl);

      // Force reload to show home screen
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Failed to save profile:', error);
      Alert.alert('エラー', 'プロフィールの保存に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDailyGoal = (profile: any) => {
    const baseAmount = profile.weightKg * 35;
    let activityBonus = 0;
    
    switch (profile.activityLevel) {
      case 'low':
        activityBonus = 0;
        break;
      case 'medium':
        activityBonus = 500;
        break;
      case 'high':
        activityBonus = 1000;
        break;
    }

    const totalAmount = baseAmount + activityBonus;
    const clampedAmount = Math.max(1200, Math.min(5000, totalAmount));

    return {
      targetMl: clampedAmount,
    };
  };

  const previewGoal = calculateDailyGoal({
    weightKg: Number(weight) || 0,
    activityLevel,
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>プロフィール設定</Text>
        <Text style={styles.subtitle}>
          あなたに最適な水分補給目標を計算します
        </Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>体重 (kg) *</Text>
            <TextInput
              style={styles.input}
              value={weight}
              onChangeText={setWeight}
              placeholder="例: 65"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>身長 (cm)</Text>
            <TextInput
              style={styles.input}
              value={height}
              onChangeText={setHeight}
              placeholder="例: 170"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>性別</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={sex}
                onValueChange={setSex}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                <Picker.Item label="男性" value="male" />
                <Picker.Item label="女性" value="female" />
                <Picker.Item label="その他" value="other" />
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>活動レベル</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={activityLevel}
                onValueChange={setActivityLevel}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                <Picker.Item label="低い (デスクワーク中心)" value="low" />
                <Picker.Item label="普通 (適度な運動)" value="medium" />
                <Picker.Item label="高い (激しい運動)" value="high" />
              </Picker>
            </View>
          </View>

          <View style={styles.timeRow}>
            <View style={styles.timeInput}>
              <Text style={styles.label}>起床時刻</Text>
              <TextInput
                style={styles.input}
                value={wakeTime}
                onChangeText={setWakeTime}
                placeholder="07:00"
              />
            </View>
            <View style={styles.timeInput}>
              <Text style={styles.label}>就寝時刻</Text>
              <TextInput
                style={styles.input}
                value={sleepTime}
                onChangeText={setSleepTime}
                placeholder="23:00"
              />
            </View>
          </View>

          {weight && (
            <View style={styles.preview}>
              <Text style={styles.previewTitle}>目標摂取量</Text>
              <Text style={styles.previewAmount}>
                {previewGoal.targetMl}ml / 日
              </Text>
              <Text style={styles.previewDescription}>
                体重 {weight}kg × 35ml + 活動補正
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleComplete}
          disabled={isLoading || !weight}
        >
          <Text style={styles.buttonText}>
            {isLoading ? '設定中...' : '設定完了'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 30,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  picker: {
    height: Platform.OS === 'ios' ? 200 : 50,
    backgroundColor: '#fff',
  },
  pickerItem: {
    fontSize: 16,
    color: '#000',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeInput: {
    flex: 1,
    marginRight: 10,
  },
  preview: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 16,
    marginTop: 10,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 4,
  },
  previewAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 4,
  },
  previewDescription: {
    fontSize: 14,
    color: '#1976D2',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#E5E5EA',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
