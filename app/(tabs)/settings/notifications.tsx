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
import { CommonHeader } from '../../../components/common-header';
import { saveUserProfile } from '../../../lib/database';
import {
    cancelScheduledReminders,
    getScheduledNotifications,
    requestNotificationPermission,
    scheduleNextReminder,
    sendTestNotification,
} from '../../../lib/notifications';
import { useHydrationStore } from '../../../stores/hydrationStore';

export default function NotificationSettingsScreen() {
  const {
    userProfile,
    dailyGoal,
    setUserProfile,
    settings,
    setSettings,
    personalizedSettings,
    setPersonalizedSettings,
    initializePersonalizedSettings,
    notificationPermission,
    setNotificationPermission,
    calculateDailyGoal,
  } = useHydrationStore();

  const [isNotificationUpdating, setIsNotificationUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [wakeTime, setWakeTime] = useState(userProfile?.wakeTime || '07:00');
  const [sleepTime, setSleepTime] = useState(userProfile?.sleepTime || '23:00');
  const [scheduledNotifications, setScheduledNotifications] = useState<any[]>([]);
  const [showNotificationList, setShowNotificationList] = useState(false);

  const handleNotificationToggle = async (value: boolean) => {
    setIsNotificationUpdating(true);

    try {
      if (value) {
        const granted = await requestNotificationPermission();
        if (!granted) {
          Alert.alert(
            '通知を有効にできません',
            '端末の設定で通知を許可してから再度お試しください。'
          );
          return;
        }

        if (!userProfile) {
          Alert.alert(
            'プロフィール情報が必要です',
            'プロフィールを設定してから通知を有効にしてください。'
          );
          return;
        }

        const goal = dailyGoal ?? calculateDailyGoal(userProfile);

        await scheduleNextReminder(
          userProfile.wakeTime,
          userProfile.sleepTime,
          goal.targetMl
        );

        setNotificationPermission(true);
      } else {
        await cancelScheduledReminders();
        setNotificationPermission(false);
      }
    } catch (error) {
      console.error('Failed to toggle notifications:', error);
      Alert.alert('エラー', '通知設定の更新に失敗しました。');
    } finally {
      setIsNotificationUpdating(false);
    }
  };

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
      if (notificationPermission) {
        const goal = dailyGoal ?? calculateDailyGoal(updatedProfile);
        await scheduleNextReminder(wakeTime, sleepTime, goal.targetMl);
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

  const handleTestNotification = async () => {
    if (!notificationPermission) {
      Alert.alert('エラー', '通知が有効になっていません');
      return;
    }

    const success = await sendTestNotification();
    if (success) {
      Alert.alert('成功', 'テスト通知を送信しました');
    } else {
      Alert.alert('エラー', 'テスト通知の送信に失敗しました');
    }
  };

  const handleViewScheduledNotifications = async () => {
    try {
      const notifications = await getScheduledNotifications();
      console.log('Scheduled notifications data:', JSON.stringify(notifications, null, 2));
      setScheduledNotifications(notifications);
      setShowNotificationList(true);
    } catch (error) {
      console.error('Failed to get scheduled notifications:', error);
      Alert.alert('エラー', '通知一覧の取得に失敗しました');
    }
  };

  const formatNotificationTime = (notification: any) => {
    try {
      console.log('Formatting notification:', JSON.stringify(notification, null, 2));
      
      let date: Date;
      
      // 通知オブジェクトから日付を取得
      if (notification && notification.trigger) {
        if (notification.trigger.date) {
          date = new Date(notification.trigger.date);
        } else if (notification.trigger.seconds) {
          // timeIntervalタイプの場合、現在時刻に秒数を加算
          const now = new Date();
          date = new Date(now.getTime() + (notification.trigger.seconds * 1000));
          console.log('Time interval trigger - seconds:', notification.trigger.seconds, 'scheduled time:', date.toLocaleString());
        } else if (notification.trigger.weekday) {
          // 曜日ベースのトリガーの場合（現在時刻を使用）
          date = new Date();
        } else {
          console.warn('No valid date found in trigger:', notification.trigger);
          return '日付不明';
        }
      } else {
        console.warn('No trigger found in notification:', notification);
        return '日付不明';
      }
      
      // 無効な日付かチェック
      if (isNaN(date.getTime())) {
        console.warn('Invalid date after parsing:', notification.trigger);
        return '日付不明';
      }
      
      return date.toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch (error) {
      console.error('Error formatting date:', error, 'Notification:', notification);
      return '日付不明';
    }
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
    <View style={styles.container}>
      <CommonHeader title="通知設定" />
      
      <ScrollView contentContainerStyle={styles.content}>
        {/* 基本設定 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>基本設定</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>通知を有効にする</Text>
            <Switch
              value={notificationPermission}
              onValueChange={handleNotificationToggle}
              disabled={isNotificationUpdating}
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

            {/* 学習データの詳細 */}
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>学習データ統計</Text>
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>成功した時間帯</Text>
                  <Text style={styles.statValue}>
                    {personalizedSettings.learningData.successfulReminders.length}個
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>スキップされた時間帯</Text>
                  <Text style={styles.statValue}>
                    {personalizedSettings.learningData.skippedNotifications.length}個
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>最も活動的な時間</Text>
                  <Text style={styles.statValue}>
                    {personalizedSettings.learningData.mostActiveHours.length > 0 
                      ? personalizedSettings.learningData.mostActiveHours.join(', ')
                      : 'データなし'
                    }
                  </Text>
                </View>
              </View>
            </View>

            {/* テスト通知ボタン */}
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>通知テスト</Text>
              <TouchableOpacity
                style={styles.testButton}
                onPress={handleTestNotification}
              >
                <Text style={styles.testButtonText}>テスト通知を送信</Text>
              </TouchableOpacity>
              <Text style={styles.helpText}>
                通知が正常に動作するかテストできます
              </Text>
            </View>

            {/* スケジュール通知一覧ボタン */}
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>スケジュール通知一覧</Text>
              <TouchableOpacity
                style={styles.testButton}
                onPress={handleViewScheduledNotifications}
              >
                <Text style={styles.testButtonText}>通知一覧を表示</Text>
              </TouchableOpacity>
              <Text style={styles.helpText}>
                現在スケジュールされている通知を確認できます
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

      {/* 通知一覧モーダル */}
      {showNotificationList && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>スケジュール通知一覧</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowNotificationList(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.notificationList}>
              {scheduledNotifications.length === 0 ? (
                <Text style={styles.noNotificationsText}>
                  スケジュールされた通知はありません
                </Text>
              ) : (
                scheduledNotifications.map((notification, index) => (
                  <View key={index} style={styles.notificationItem}>
                    <Text style={styles.notificationTitle}>
                      {notification.content.title}
                    </Text>
                    <Text style={styles.notificationBody}>
                      {notification.content.body}
                    </Text>
                    <Text style={styles.notificationTime}>
                      {formatNotificationTime(notification)}
                    </Text>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  placeholder: {
    width: 40,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
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
  statsContainer: {
    marginTop: 12,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  statLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
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
  testButton: {
    backgroundColor: '#34C759',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // モーダルスタイル
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#8E8E93',
    fontWeight: '600',
  },
  notificationList: {
    maxHeight: 400,
  },
  notificationItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  notificationBody: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#8E8E93',
    fontFamily: 'monospace',
  },
  noNotificationsText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    padding: 20,
  },
});
