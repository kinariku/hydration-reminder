import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SettingsDetailTemplate } from '../../../components/SettingsDetailTemplate';
import { commonStyles } from '../../../constants/design';
import { saveSettings } from '../../../lib/database';
import { useHydrationStore } from '../../../stores/hydrationStore';

export default function UnitSettingsScreen() {
  const router = useRouter();
  const { settings, setSettings } = useHydrationStore();
  const [units, setUnits] = useState<'ml' | 'oz'>(settings?.units || 'ml');
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // 単位選択のオプション
  const unitOptions = [
    { 
      label: 'ミリリットル (ml)', 
      value: 'ml'
    },
    { 
      label: 'オンス (oz)', 
      value: 'oz'
    },
  ];

  // 変更検知
  useEffect(() => {
    const hasUnitChanges = units !== settings?.units;
    setHasChanges(hasUnitChanges);
  }, [units, settings]);

  // 保存関数
  const handleSave = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);
    try {
      const updatedSettings = {
        ...settings,
        units,
      };
      
      await saveSettings(updatedSettings);
      setSettings(updatedSettings);
      setHasChanges(false);
      console.log('Units saved successfully');
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SettingsDetailTemplate
      title="単位設定"
      onBackPress={() => router.push('/(tabs)/settings')}
    >
      <View style={[styles.optionsContainer, { marginBottom: 24 }]}>
        {unitOptions.map((option, index) => (
          <TouchableOpacity
            key={option.value}
            style={[
              commonStyles.optionButton,
              units === option.value && commonStyles.optionButtonSelected,
              styles.optionButton
            ]}
            onPress={() => setUnits(option.value as 'ml' | 'oz')}
          >
            <Text style={[
              commonStyles.optionText,
              units === option.value && commonStyles.optionTextSelected
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
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
    flexDirection: 'row' as const,
    gap: 12,
  },
  optionButton: {
    flex: 1,
    flexDirection: 'column' as const,
  },
};
