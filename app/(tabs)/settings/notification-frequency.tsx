import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SettingsDetailTemplate } from '../../../components/SettingsDetailTemplate';
import { commonStyles } from '../../../constants/design';
import { saveSettings } from '../../../lib/database';
import { useHydrationStore } from '../../../stores/hydrationStore';

export default function NotificationFrequencySettingsScreen() {
  const router = useRouter();
  const { settings, setSettings } = useHydrationStore();
  const [notificationFrequency, setNotificationFrequency] = useState<'low' | 'medium' | 'high'>(settings?.notificationFrequency || 'medium');
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // 通知頻度選択のオプション
  const frequencyOptions = [
    { 
      label: '低頻度', 
      value: 'low', 
      description: '1時間おき',
      icon: '🐌'
    },
    { 
      label: '中頻度', 
      value: 'medium', 
      description: '30分おき',
      icon: '🚶'
    },
    { 
      label: '高頻度', 
      value: 'high', 
      description: '15分おき',
      icon: '🏃'
    },
  ];

  // 変更検知
  useEffect(() => {
    const hasFrequencyChanges = notificationFrequency !== settings?.notificationFrequency;
    setHasChanges(hasFrequencyChanges);
  }, [notificationFrequency, settings?.notificationFrequency]);

  // 保存関数
  const handleSave = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);
    try {
      const updatedSettings = {
        ...settings,
        notificationFrequency,
      };
      
      await saveSettings(updatedSettings);
      setSettings(updatedSettings);
      setHasChanges(false);
      console.log('Notification frequency saved successfully');
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SettingsDetailTemplate
      title="通知頻度設定"
      onBackPress={() => router.push("/(tabs)/settings")}
    >
      <View style={commonStyles.inputGroup}>
        <Text style={commonStyles.label}>通知頻度</Text>
        <View style={styles.optionsContainer}>
          {frequencyOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                commonStyles.optionButton,
                notificationFrequency === option.value && commonStyles.optionButtonSelected
              ]}
              onPress={() => setNotificationFrequency(option.value as 'low' | 'medium' | 'high')}
            >
              <Text style={styles.optionIcon}>{option.icon}</Text>
              <View style={styles.optionContent}>
                <Text style={[
                  commonStyles.optionText,
                  notificationFrequency === option.value && commonStyles.optionTextSelected
                ]}>
                  {option.label}
                </Text>
                <Text style={[
                  styles.optionDescription,
                  notificationFrequency === option.value && styles.optionDescriptionSelected
                ]}>
                  {option.description}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={commonStyles.description}>
          水分摂取のリマインダー頻度を設定します
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
  optionsContainer: {
    gap: 12,
  },
  optionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionDescription: {
    fontSize: 14,
    color: '#0284C7',
    fontWeight: '500',
  },
  optionDescriptionSelected: {
    color: '#0369A1',
    fontWeight: '600',
  },
};