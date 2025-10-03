import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SettingsDetailTemplate } from '../../../components/SettingsDetailTemplate';
import { commonStyles, DESIGN } from '../../../constants/design';
import { saveSettings } from '../../../lib/database';
import { useHydrationStore } from '../../../stores/hydrationStore';

export default function SnoozeSettingsScreen() {
  const router = useRouter();
  const { settings, setSettings } = useHydrationStore();
  const [snoozeMinutes, setSnoozeMinutes] = useState<number>(settings?.snoozeMinutes || 15);
  const [customMinutes, setCustomMinutes] = useState<string>(settings?.snoozeMinutes?.toString() || '15');
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // カスタム入力の処理
  const handleCustomInput = (text: string) => {
    const numbers = text.replace(/\D/g, '');
    setCustomMinutes(numbers);
    const minutes = parseInt(numbers) || 15;
    setSnoozeMinutes(Math.min(Math.max(minutes, 1), 120)); // 1-120分の範囲
  };

  // 変更検知
  useEffect(() => {
    const hasSnoozeChanges = snoozeMinutes !== settings?.snoozeMinutes;
    setHasChanges(hasSnoozeChanges);
  }, [snoozeMinutes, settings?.snoozeMinutes]);

  // 保存関数
  const handleSave = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);
    try {
      const updatedSettings = {
        ...settings,
        snoozeMinutes,
      };
      
      await saveSettings(updatedSettings);
      setSettings(updatedSettings);
      setHasChanges(false);
      console.log('Snooze minutes saved successfully');
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SettingsDetailTemplate
      title="スヌーズ時間設定"
      onBackPress={() => router.back()}
    >
      <View style={commonStyles.inputGroup}>
        <Text style={commonStyles.label}>スヌーズ時間</Text>
        <View style={commonStyles.inputContainer}>
          <TextInput
            style={commonStyles.input}
            value={customMinutes}
            onChangeText={handleCustomInput}
            placeholder="15"
            keyboardType="numeric"
            maxLength={3}
            placeholderTextColor={DESIGN.colors.secondary}
          />
          <Text style={commonStyles.unit}>分</Text>
        </View>
        <Text style={commonStyles.description}>
          通知をスヌーズした場合の再通知までの時間を設定します（1〜120分）
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

// 共通デザインを使用するため、個別のスタイルは不要
