import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { saveUserProfile } from '../../../lib/database';
import { scheduleReminders } from '../../../lib/notifications';
import { useHydrationStore } from '../../../stores/hydrationStore';

export default function NotificationSettingsScreen() {
  const { 
    userProfile,
    setUserProfile,
    settings, 
    setSettings, 
    personalizedSettings,
    setPersonalizedSettings,
    initializePersonalizedSettings 
  } = useHydrationStore();

  const [isLoading, setIsLoading] = useState(false);
  const [wakeTime, setWakeTime] = useState(userProfile?.wakeTime || '07:00');
  const [sleepTime, setSleepTime] = useState(userProfile?.sleepTime || '23:00');

  const handleSaveTimes = async () => {
    if (!userProfile) return;

    // 時刻のバリデーション
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(wakeTime) || !timeRegex.test(sleepTime)) {
      Alert.alert('エラー', '時刻はHH:MM形式で入力してください（例: 07:00）');
      return;
    }

    setIsLoading(true);

    try {
      const updatedProfile = {
        ...userProfile,
        wakeTime,
        sleepTime,
      };

      await saveUserProfile(updatedProfile);
      setUserProfile(updatedProfile);
      
      // 通知スケジュールを更新
      if (settings.notificationPermission) {
        await scheduleReminders(wakeTime, sleepTime, 2000); // 仮の目標量
      }

      Alert.alert('成功', '起床・就寝時刻を更新しました');
    } catch (error) {
      console.error('Failed to save times:', error);
      Alert.alert('エラー', '時刻の保存に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSettings = () => {
    Alert.alert(
      '設定をリセット',
      'パーソナライズ設定をデフォルトに戻しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'リセット',
          style: 'destructive',
          onPress: () => {
            initializePersonalizedSettings('deskWorker');
            Alert.alert('完了', '設定をリセットしました');
          },
        },
      ]
    );
  };

  const frequencyOptions = [
    { label: '低', value: 'low', description: '1日3-4回' },
    { label: '中', value: 'medium', description: '1日5-6回' },
    { label: '高', value: 'high', description: '1日7-8回' },
  ];

  const snoozeOptions = [
    { label: '5分', value: 5 },
    { label: '15分', value: 15 },
    { label: '30分', value: 30 },
    { label: '1時間', value: 60 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/settings')} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
          <Text style={styles.backText}>戻る</Text>
        </TouchableOpacity>
        <Text style={styles.title}>通知設定</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* 基本設定 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>基本設定</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>通知を有効にする</Text>
            <Switch
              value={settings.notificationPermission}
              onValueChange={(value) => setSettings({ notificationPermission: value })}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>起床時刻</Text>
            <View style={styles.timeInputContainer}>
              <Text style={styles.timeIcon}>🌅</Text>
              <TextInput
                style={styles.timeInput}
                value={wakeTime}
                onChangeText={setWakeTime}
                placeholder="07:00"
                maxLength={5}
              />
            </View>
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>就寝時刻</Text>
            <View style={styles.timeInputContainer}>
              <Text style={styles.timeIcon}>🌙</Text>
              <TextInput
                style={styles.timeInput}
                value={sleepTime}
                onChangeText={setSleepTime}
                placeholder="23:00"
                maxLength={5}
              />
            </View>
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>スヌーズ時間</Text>
            <View style={styles.optionContainer}>
              {snoozeOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    settings.snoozeMinutes === option.value && styles.optionButtonSelected
                  ]}
                  onPress={() => setSettings({ snoozeMinutes: option.value })}
                >
                  <Text style={[
                    styles.optionText,
                    settings.snoozeMinutes === option.value && styles.optionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSaveTimes}
            disabled={isLoading}
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          >
            <Text style={styles.saveButtonText}>
              {isLoading ? '保存中...' : '時刻を保存'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* パーソナライズ設定 */}
        {personalizedSettings && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>パーソナライズ設定</Text>
            
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>通知頻度</Text>
              <View style={styles.optionContainer}>
                {frequencyOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionButton,
                      personalizedSettings.notificationPattern.frequency === option.value && styles.optionButtonSelected
                    ]}
                    onPress={() => {
                      setPersonalizedSettings({
                        ...personalizedSettings,
                        notificationPattern: {
                          ...personalizedSettings.notificationPattern,
                          frequency: option.value as 'low' | 'medium' | 'high'
                        }
                      });
                    }}
                  >
                    <Text style={[
                      styles.optionText,
                      personalizedSettings.notificationPattern.frequency === option.value && styles.optionTextSelected
                    ]}>
                      {option.label}
                    </Text>
                    <Text style={[
                      styles.optionDescription,
                      personalizedSettings.notificationPattern.frequency === option.value && styles.optionDescriptionSelected
                    ]}>
                      {option.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>学習モード</Text>
              <View style={styles.switchContainer}>
                <Switch
                  value={personalizedSettings.notificationPattern.adaptiveMode}
                  onValueChange={(value) => {
                    setPersonalizedSettings({
                      ...personalizedSettings,
                      notificationPattern: {
                        ...personalizedSettings.notificationPattern,
                        adaptiveMode: value
                      }
                    });
                  }}
                />
                <Text style={styles.switchLabel}>
                  {personalizedSettings.notificationPattern.adaptiveMode ? 'ON' : 'OFF'}
                </Text>
              </View>
              <Text style={styles.helpText}>
                学習モードをONにすると、あなたの行動パターンに基づいて通知時間を自動調整します
              </Text>
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>推奨通知時間</Text>
              <Text style={styles.timeList}>
                {personalizedSettings.notificationPattern.preferredTimes.join(', ')}
              </Text>
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>静音時間</Text>
              <Text style={styles.timeList}>
                {personalizedSettings.notificationPattern.quietHours.length > 0
                  ? personalizedSettings.notificationPattern.quietHours
                      .map(hour => `${hour.start}-${hour.end}`)
                      .join(', ')
                  : '設定なし'
                }
              </Text>
            </View>
          </View>
        )}

        {/* アクション */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleResetSettings}
          >
            <Text style={styles.actionButtonText}>デフォルト設定に戻す</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  backIcon: {
    fontSize: 20,
    color: '#007AFF',
    marginRight: 4,
  },
  backText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  settingItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  optionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    minWidth: 80,
  },
  optionButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  optionTextSelected: {
    color: '#007AFF',
  },
  optionDescription: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  optionDescriptionSelected: {
    color: '#007AFF',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 16,
    color: '#1C1C1E',
    marginLeft: 12,
  },
  helpText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 8,
    lineHeight: 16,
  },
  timeList: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  actionButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 8,
  },
  timeIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  timeInput: {
    flex: 1,
    fontSize: 16,
    color: '#1C1C1E',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
