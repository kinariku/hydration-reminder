import { FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SettingsDetailTemplate } from '../../../components/SettingsDetailTemplate';
import { commonStyles } from '../../../constants/design';
import { saveSettings } from '../../../lib/database';
import { useHydrationStore } from '../../../stores/hydrationStore';

// プリセット選択肢（一般的な容器の容量）
const PRESET_OPTIONS = [
  { id: 'small', name: '一口分', value: 100, icon: 'tint' },
  { id: 'cup', name: 'カップ1杯', value: 150, icon: 'coffee' },
  { id: 'glass', name: 'グラス1杯', value: 200, icon: 'glass-whiskey' },
  { id: 'mug', name: 'マグカップ1杯', value: 250, icon: 'mug-hot' },
  { id: 'jockey', name: 'ジョッキ1杯', value: 400, icon: 'beer' },
  { id: 'bottle', name: 'ペットボトル1本', value: 500, icon: 'wine-bottle' },
];

export default function PresetSettingsScreen() {
  const router = useRouter();
  const { settings, setSettings } = useHydrationStore();
  const [selectedPresets, setSelectedPresets] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // 現在の設定を反映
  useEffect(() => {
    const current = new Set<string>();
    settings.presetMl.forEach(preset => {
      const option = PRESET_OPTIONS.find(opt => opt.value === preset);
      if (option) {
        current.add(option.id);
      }
    });
    setSelectedPresets(current);
  }, [settings.presetMl]);

  // 変更検知
  useEffect(() => {
    const currentPresets = Array.from(selectedPresets).map(id => {
      const option = PRESET_OPTIONS.find(opt => opt.id === id);
      return option?.value || 0;
    }).filter(value => value > 0).sort((a, b) => a - b);
    
    const hasPresetChanges = JSON.stringify(currentPresets) !== JSON.stringify(settings.presetMl);
    setHasChanges(hasPresetChanges);
  }, [selectedPresets, settings.presetMl]);

  const togglePreset = (presetId: string) => {
    const newSelected = new Set(selectedPresets);
    if (newSelected.has(presetId)) {
      newSelected.delete(presetId);
    } else {
      newSelected.add(presetId);
    }
    setSelectedPresets(newSelected);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSave = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);
    try {
      const newPresets = Array.from(selectedPresets).map(id => {
        const option = PRESET_OPTIONS.find(opt => opt.id === id);
        return option?.value || 0;
      }).filter(value => value > 0).sort((a, b) => a - b);

      const updatedSettings = { ...settings, presetMl: newPresets };
      setSettings(updatedSettings);
      await saveSettings(updatedSettings);
      setHasChanges(false);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SettingsDetailTemplate
      title="プリセット量"
      onBackPress={() => router.push("/(tabs)/settings")}
    >
      <View style={commonStyles.inputGroup}>
        <View style={styles.presetGrid}>
          {PRESET_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                commonStyles.optionButton,
                selectedPresets.has(option.id) && commonStyles.optionButtonSelected,
                styles.presetButton
              ]}
              onPress={() => togglePreset(option.id)}
            >
              <FontAwesome5 
                name={option.icon} 
                size={24} 
                color={selectedPresets.has(option.id) ? '#0EA5E9' : '#0369A1'}
                style={styles.presetIcon}
              />
              <Text style={[
                commonStyles.optionText,
                selectedPresets.has(option.id) && commonStyles.optionTextSelected,
                styles.presetText
              ]}>
                {option.name}
              </Text>
              <Text style={[
                commonStyles.optionText,
                selectedPresets.has(option.id) && commonStyles.optionTextSelected,
                styles.presetValue
              ]}>
                {option.value}ml
              </Text>
              {selectedPresets.has(option.id) && (
                <FontAwesome5 
                  name="check-circle" 
                  size={20} 
                  color="#0EA5E9"
                  style={styles.checkIcon}
                />
              )}
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
  presetGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 12,
  },
  presetButton: {
    width: '48%',
    paddingVertical: 20,
    paddingHorizontal: 16,
    flexDirection: 'column' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flex: 0, // flex: 1を上書きして2列レイアウトを確保
    marginRight: 0, // marginRightを上書き
    marginBottom: 0, // marginBottomを上書き
  },
  presetIcon: {
    marginBottom: 8,
  },
  presetText: {
    textAlign: 'center' as const,
    marginBottom: 4,
  },
  presetValue: {
    fontSize: 14,
    textAlign: 'center' as const,
    fontWeight: '500',
  },
  checkIcon: {
    position: 'absolute' as const,
    top: 12,
    right: 12,
  },
};