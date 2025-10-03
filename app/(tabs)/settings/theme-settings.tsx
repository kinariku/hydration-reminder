import { FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SettingsDetailTemplate } from '../../../components/SettingsDetailTemplate';
import { commonStyles } from '../../../constants/design';
import { useHydrationStore } from '../../../stores/hydrationStore';

const THEME_OPTIONS = [
  {
    id: 'light',
    label: 'ライト',
    description: '明るいテーマ',
    icon: 'sun',
  },
  {
    id: 'dark',
    label: 'ダーク',
    description: '暗いテーマ',
    icon: 'moon',
  },
  {
    id: 'system',
    label: 'システム',
    description: 'システムに従う',
    icon: 'mobile-alt',
  },
];

export default function ThemeSettingsScreen() {
  const router = useRouter();
  const { settings, setSettings } = useHydrationStore();
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | 'system'>(settings.theme);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setHasChanges(selectedTheme !== settings.theme);
  }, [selectedTheme, settings.theme]);

  const handleSave = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);
    try {
      setSettings({ theme: selectedTheme });
      setHasChanges(false);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SettingsDetailTemplate
      title="テーマ設定"
      onBackPress={() => router.push('/(tabs)/settings')}
    >
      <View style={commonStyles.inputGroup}>
        <Text style={commonStyles.label}>アプリのテーマ</Text>
        <Text style={commonStyles.description}>
          アプリの表示テーマを選択してください
        </Text>
      </View>

      <View style={commonStyles.inputGroup}>
        <Text style={commonStyles.infoTitle}>テーマの選択</Text>
        <View style={styles.optionsContainer}>
          {THEME_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                commonStyles.optionButton,
                selectedTheme === option.id && commonStyles.optionButtonSelected
              ]}
              onPress={() => setSelectedTheme(option.id as 'light' | 'dark' | 'system')}
            >
              <FontAwesome5 name={option.icon} size={24} color={selectedTheme === option.id ? '#FFFFFF' : '#0369A1'} style={styles.optionIcon} />
              <View style={styles.optionContent}>
                <Text style={[
                  commonStyles.optionText,
                  selectedTheme === option.id && commonStyles.optionTextSelected
                ]}>
                  {option.label}
                </Text>
                <Text style={[
                  styles.optionDescription,
                  selectedTheme === option.id && styles.optionDescriptionSelected
                ]}>
                  {option.description}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
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
    marginTop: 16,
  },
  optionIcon: {
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
    color: '#FFFFFF',
  },
};