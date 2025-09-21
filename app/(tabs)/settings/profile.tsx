import React, { useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { CommonHeader } from '../../../components/common-header';
import { saveUserProfile } from '../../../lib/database';
import { useHydrationStore } from '../../../stores/hydrationStore';

export default function ProfileSettingsScreen() {
  const { userProfile, setUserProfile } = useHydrationStore();
  
  const [weight, setWeight] = useState(userProfile?.weightKg?.toString() || '');
  const [height, setHeight] = useState(userProfile?.heightCm?.toString() || '');
  const [sex, setSex] = useState<'male' | 'female' | 'other'>(userProfile?.sex || 'male');
  const [activityLevel, setActivityLevel] = useState<'low' | 'medium' | 'high'>(userProfile?.activityLevel || 'medium');
  const [wakeTime, setWakeTime] = useState(userProfile?.wakeTime || '07:00');
  const [sleepTime, setSleepTime] = useState(userProfile?.sleepTime || '23:00');
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // 変更検知
  useEffect(() => {
    if (!userProfile) return;
    
    const hasProfileChanges = 
      weight !== userProfile.weightKg?.toString() ||
      height !== userProfile.heightCm?.toString() ||
      sex !== userProfile.sex ||
      activityLevel !== userProfile.activityLevel ||
      wakeTime !== userProfile.wakeTime ||
      sleepTime !== userProfile.sleepTime;
    
    setHasChanges(hasProfileChanges);
  }, [weight, height, sex, activityLevel, wakeTime, sleepTime, userProfile]);

  // 保存関数
  const handleSave = async () => {
    if (!userProfile || !weight || isNaN(Number(weight)) || Number(weight) <= 0) return;

    // 時刻のバリデーション
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(wakeTime) || !timeRegex.test(sleepTime)) return;

    setIsLoading(true);
    try {
      const updatedProfile = {
        ...userProfile,
        weightKg: Number(weight),
        heightCm: Number(height),
        sex,
        activityLevel,
        wakeTime,
        sleepTime,
      };

      await saveUserProfile(updatedProfile);
      setUserProfile(updatedProfile);
      setHasChanges(false);
      console.log('Profile saved successfully');
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsLoading(false);
    }
  };



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

        {/* 保存ボタン */}
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
  saveButtonContainer: {
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#E5E5EA',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonTextDisabled: {
    color: '#8E8E93',
  },
});
