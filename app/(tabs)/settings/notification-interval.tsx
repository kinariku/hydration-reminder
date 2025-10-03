import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SettingsDetailTemplate } from '../../../components/SettingsDetailTemplate';
import { commonStyles, DESIGN } from '../../../constants/design';
import { useHydrationStore } from '../../../stores/hydrationStore';

const INTERVAL_OPTIONS = [30, 60, 90, 120, 180, 240]; // 分単位

export default function NotificationIntervalScreen() {
  const router = useRouter();
  const { settings, setSettings } = useHydrationStore();
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // 通知間隔設定
  const [notificationInterval, setNotificationInterval] = useState(
    (settings as any)?.notificationInterval || 60
  );

  // 変更検知
  useEffect(() => {
    const intervalChanged = notificationInterval !== ((settings as any)?.notificationInterval || 60);
    setHasChanges(intervalChanged);
  }, [notificationInterval, settings]);

  const handleSave = async () => {
    if (!hasChanges) return;
    
    setIsLoading(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      setSettings({
        ...settings,
        notificationInterval,
      } as any);
      
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save notification interval:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectInterval = (interval: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNotificationInterval(interval);
  };

  const formatInterval = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}分`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) {
        return `${hours}時間`;
      } else {
        return `${hours}時間${remainingMinutes}分`;
      }
    }
  };

  return (
    <SettingsDetailTemplate
      title="通知間隔"
      onBackPress={() => router.back()}
    >
      <View style={commonStyles.inputGroup}>
        <Text style={commonStyles.label}>リマインダー通知の間隔</Text>
        <Text style={commonStyles.description}>
          水分補給のリマインダーを送る間隔を設定してください
        </Text>
      </View>

      <View style={[commonStyles.infoCard, { marginBottom: 24 }]}>
        <Text style={commonStyles.infoTitle}>間隔を選択</Text>
        <View style={styles.optionsGrid}>
          {INTERVAL_OPTIONS.map((interval) => (
            <TouchableOpacity
              key={interval}
              style={[
                commonStyles.optionButton,
                notificationInterval === interval && commonStyles.optionButtonSelected
              ]}
              onPress={() => selectInterval(interval)}
            >
              <Text style={[
                commonStyles.optionText,
                notificationInterval === interval && commonStyles.optionTextSelected
              ]}>
                {formatInterval(interval)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={[commonStyles.infoCard, { marginBottom: 24 }]}>
        <Text style={commonStyles.infoTitle}>現在の設定</Text>
        <Text style={styles.currentSetting}>
          {formatInterval(notificationInterval)}間隔でリマインダー通知を送信します
        </Text>
      </View>

      <View style={[commonStyles.infoCard, { marginBottom: 24 }]}>
        <Text style={commonStyles.infoTitle}>設定について</Text>
        <Text style={commonStyles.infoText}>
          • 選択した間隔で、水分補給のリマインダー通知が送信されます{'\n'}
          • 朝の目覚め通知は起床時間に1回のみ送信されます{'\n'}
          • スヌーズ機能を使用した場合、設定した間隔後に再通知されます{'\n'}
          • 睡眠時間中は通知は送信されません
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
  optionsGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 12,
    marginTop: 16,
  },
  currentSetting: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: DESIGN.colors.primary,
    textAlign: 'center' as const,
    marginTop: 8,
  },
};
