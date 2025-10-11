import { FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SettingsDetailTemplate } from '../../../components/SettingsDetailTemplate';
import { commonStyles } from '../../../constants/design';
import { saveUserProfile } from '../../../lib/database';
import { useHydrationStore } from '../../../stores/hydrationStore';

export default function ActivitySettingsScreen() {
  const router = useRouter();
  const { userProfile, setUserProfile } = useHydrationStore();
  const [activityLevel, setActivityLevel] = useState<'low' | 'medium' | 'high'>(userProfile?.activityLevel || 'medium');
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // 活動レベル選択のオプション
  const activityOptions = [
    { label: '低い', value: 'low', description: 'デスクワーク中心', icon: '🪑' },
    { label: '中程度', value: 'medium', description: '適度な運動', icon: '🚶' },
    { label: '高い', value: 'high', description: '激しい運動', icon: '🏃' },
  ];

  // 変更検知
  useEffect(() => {
    setHasChanges(activityLevel !== userProfile?.activityLevel);
  }, [activityLevel, userProfile?.activityLevel]);

  // 保存関数
  const handleSave = async () => {
    if (!userProfile) return;

    setIsLoading(true);
    try {
      const updatedProfile = {
        ...userProfile,
        activityLevel,
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
      title="活動レベル設定"
      onBackPress={() => router.back()}
    >
      <View style={commonStyles.inputGroup}>
        <Text style={commonStyles.label}>活動レベル</Text>
        <View style={styles.activityContainer}>
          {activityOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                commonStyles.optionButton,
                activityLevel === option.value && commonStyles.optionButtonSelected,
                styles.activityButton
              ]}
              onPress={() => setActivityLevel(option.value as 'low' | 'medium' | 'high')}
            >
              <Text style={styles.activityIcon}>{option.icon}</Text>
              <View style={styles.activityContent}>
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
              </View>
              {activityLevel === option.value && (
                <View style={styles.checkContainer}>
                  <FontAwesome5 
                    name="check-circle" 
                    size={20} 
                    color="#0EA5E9" 
                  />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
        <Text style={commonStyles.description}>
          水分摂取量の計算に使用されます
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
  activityContainer: {
    gap: 12,
  },
  activityButton: {
    flexDirection: 'row', // 横並びレイアウト
    flex: 0, // 均等幅を無効化
  },
  activityIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 4,
  },
  activityLabelSelected: {
    color: '#0EA5E9',
    fontWeight: '600',
  },
  activityDescription: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '400',
  },
  activityDescriptionSelected: {
    color: '#0284C7',
    fontWeight: '500',
  },
  checkContainer: {
    marginLeft: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
};