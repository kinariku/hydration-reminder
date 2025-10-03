import { FontAwesome5 } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert, AppState, ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { NotificationStatusCard } from '../../../components/ui/NotificationStatusCard';
import { TestButton } from '../../../components/ui/TestButton';
import { RADIUS } from '../../../constants/radius';
import { saveUserProfile } from '../../../lib/database';
import {
    checkNotificationStatus,
    getScheduledNotifications,
    openNotificationSettings,
    sendTestNotification
} from '../../../lib/notifications';
import { useHydrationStore } from '../../../stores/hydrationStore';

export default function NotificationSettingsScreen() {
  const {
    userProfile,
    dailyGoal,
    setUserProfile,
    settings,
    setSettings,
    notificationPermission,
    setNotificationPermission,
    calculateDailyGoal,
  } = useHydrationStore();

  const [isNotificationUpdating, setIsNotificationUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [wakeTime, setWakeTime] = useState(userProfile?.wakeTime || '07:00');
  const [sleepTime, setSleepTime] = useState(userProfile?.sleepTime || '23:00');
  const [scheduledNotifications, setScheduledNotifications] = useState<any[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  
  // 通知設定の追加項目
  const [tempNotificationFrequency, setTempNotificationFrequency] = useState<'low' | 'medium' | 'high'>(
    settings?.notificationFrequency || 'medium'
  );
  const [tempSnoozeMinutes, setTempSnoozeMinutes] = useState(settings?.snoozeMinutes || 15);
  const [enableMorningNotification, setEnableMorningNotification] = useState((settings as any)?.enableMorningNotification ?? true);
  const [enableReminderNotification, setEnableReminderNotification] = useState((settings as any)?.enableReminderNotification ?? true);
  const [enableSnoozeNotification, setEnableSnoozeNotification] = useState((settings as any)?.enableSnoozeNotification ?? true);
  const [notificationSound, setNotificationSound] = useState((settings as any)?.notificationSound ?? true);
  const [notificationVibration, setNotificationVibration] = useState((settings as any)?.notificationVibration ?? true);
  const [customMessage, setCustomMessage] = useState((settings as any)?.customNotificationMessage || '');
  const [notificationInterval, setNotificationInterval] = useState((settings as any)?.notificationInterval || 60);

  // 時刻フォーマット関数
  const formatTimeInput = (text: string) => {
    // 数字のみを抽出
    const numbers = text.replace(/\D/g, '');
    
    if (numbers.length === 0) return '';
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}:${numbers.slice(2)}`;
    }
    // 5文字以上の場合は最初の4文字のみ使用
    return `${numbers.slice(0, 2)}:${numbers.slice(2, 4)}`;
  };

  // 通知の種類を判定する関数
  const getNotificationType = (notification: any) => {
    const data = notification.content.data;
    if (data?.type === 'morning_wakeup') return '朝の目覚め';
    if (data?.type === 'reminder') return 'リマインダー';
    if (data?.type === 'snooze') return 'スヌーズ';
    return '通知';
  };

  const handleWakeTimeChange = (text: string) => {
    const formatted = formatTimeInput(text);
    setWakeTime(formatted);
  };

  const handleSleepTimeChange = (text: string) => {
    const formatted = formatTimeInput(text);
    setSleepTime(formatted);
  };
  const [showNotificationList, setShowNotificationList] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<{
    isEnabled: boolean;
    canRequest: boolean;
    status: string;
  }>({ isEnabled: false, canRequest: false, status: 'unknown' });
  

  
  // TextInputのref
  const wakeTimeRef = useRef<TextInput>(null);
  const sleepTimeRef = useRef<TextInput>(null);

  // 通知状態をチェック
  const checkNotificationStatusOnLoad = async () => {
    try {
      const status = await checkNotificationStatus();
      setNotificationStatus(status);
      console.log('Notification status checked:', status);
    } catch (error) {
      console.error('Failed to check notification status:', error);
    }
  };

  // 変更検知
  useEffect(() => {
    const timeChanged = wakeTime !== userProfile?.wakeTime || sleepTime !== userProfile?.sleepTime;
    const frequencyChanged = tempNotificationFrequency !== (settings?.notificationFrequency || 'medium');
    const snoozeChanged = tempSnoozeMinutes !== (settings?.snoozeMinutes || 15);
    const morningChanged = enableMorningNotification !== ((settings as any)?.enableMorningNotification ?? true);
    const reminderChanged = enableReminderNotification !== ((settings as any)?.enableReminderNotification ?? true);
    const snoozeEnabledChanged = enableSnoozeNotification !== ((settings as any)?.enableSnoozeNotification ?? true);
    const soundChanged = notificationSound !== ((settings as any)?.notificationSound ?? true);
    const vibrationChanged = notificationVibration !== ((settings as any)?.notificationVibration ?? true);
    const messageChanged = customMessage !== ((settings as any)?.customNotificationMessage || '');
    const intervalChanged = notificationInterval !== ((settings as any)?.notificationInterval || 60);
    
    setHasChanges(timeChanged || frequencyChanged || snoozeChanged || morningChanged || 
                 reminderChanged || snoozeEnabledChanged || soundChanged || vibrationChanged || 
                 messageChanged || intervalChanged);
  }, [wakeTime, sleepTime, tempNotificationFrequency, tempSnoozeMinutes, enableMorningNotification, 
      enableReminderNotification, enableSnoozeNotification, notificationSound, notificationVibration, 
      customMessage, notificationInterval, userProfile, settings]);

  // 保存関数
  const handleSave = async () => {
    if (!userProfile) return;

    // 時刻のバリデーション
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(wakeTime) || !timeRegex.test(sleepTime)) return;

    setIsLoading(true);
    try {
      // プロフィールの更新
      const updatedProfile = {
        ...userProfile,
        wakeTime,
        sleepTime,
      };
      await saveUserProfile(updatedProfile);
      setUserProfile(updatedProfile);

      // 設定の更新
      setSettings({
        ...settings,
        notificationFrequency: tempNotificationFrequency as 'low' | 'medium' | 'high',
        snoozeMinutes: tempSnoozeMinutes,
        enableMorningNotification,
        enableReminderNotification,
        enableSnoozeNotification,
        notificationSound,
        notificationVibration,
        customNotificationMessage: customMessage,
        notificationInterval,
      } as any);

      setHasChanges(false);
      console.log('Notification settings saved successfully');
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsLoading(false);
    }
  };


  // 時刻のバリデーション
  const isValidTime = (time: string) => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  };

  // 時刻の妥当性チェック
  const isTimeValid = () => {
    return isValidTime(wakeTime) && isValidTime(sleepTime);
  };

  // iPhone設定を開く
  const handleOpenSettings = async () => {
    try {
      const success = await openNotificationSettings();
      if (!success) {
        Alert.alert(
          '設定を開けません',
          'iPhone設定アプリを手動で開いて、通知を有効にしてください。'
        );
      }
    } catch (error) {
      console.error('Failed to open settings:', error);
      Alert.alert('エラー', '設定を開けませんでした。');
    }
  };


  // コンポーネントマウント時に通知状態をチェック
  useEffect(() => {
    if (userProfile) {
      setWakeTime(userProfile.wakeTime);
      setSleepTime(userProfile.sleepTime);
    }
    
    // 通知状態をチェック
    checkNotificationStatusOnLoad();
  }, []); // 初回マウント時のみ実行

  // アプリがフォアグラウンドに戻った時に通知状態を再チェック
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        console.log('App became active, checking notification status...');
        checkNotificationStatusOnLoad();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);



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
      <Svg style={styles.backgroundGradient} width="100%" height="100%">
        <Defs>
          <LinearGradient id="notificationGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#E0F2FE" />
            <Stop offset="25%" stopColor="#BAE6FD" />
            <Stop offset="50%" stopColor="#7DD3FC" />
            <Stop offset="75%" stopColor="#38BDF8" />
            <Stop offset="100%" stopColor="#0EA5E9" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#notificationGradient)" />
      </Svg>
      
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.headerSection}>
          <View style={styles.titleContainer}>
            <FontAwesome5 name="bell" size={28} color="#0EA5E9" />
            <Text style={styles.appTitle}>通知設定</Text>
          </View>
        </View>
      </SafeAreaView>
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        {/* 基本設定 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>基本設定</Text>
          
          <NotificationStatusCard 
            status={notificationStatus}
            onSetupPress={handleOpenSettings}
            showOpenButton={true}
          />

          <View style={[styles.lifeRhythmCard, !notificationStatus.isEnabled && styles.lifeRhythmCardDisabled]}>
            <View style={styles.lifeRhythmHeader}>
              <Text style={[styles.lifeRhythmTitle, !notificationStatus.isEnabled && styles.lifeRhythmTitleDisabled]}>生活リズム</Text>
            </View>
            
            <View style={styles.timeInputsContainer}>
              <TouchableOpacity 
                style={styles.timeInputWrapper}
                onPress={() => {
                  if (notificationStatus.isEnabled) {
                    wakeTimeRef.current?.focus();
                  }
                }}
                disabled={!notificationStatus.isEnabled}
                activeOpacity={0.7}
              >
                <Text style={[styles.timeLabel, !notificationStatus.isEnabled && styles.timeLabelDisabled]}>起床</Text>
                <TextInput
                  ref={wakeTimeRef}
                  style={[
                    styles.timeInput, 
                    !notificationStatus.isEnabled && styles.timeInputDisabled,
                    !isValidTime(wakeTime) && wakeTime.length > 0 && styles.timeInputError
                  ]}
                  value={wakeTime}
                  onChangeText={notificationStatus.isEnabled ? handleWakeTimeChange : undefined}
                  placeholder="07:00"
                  maxLength={5}
                  editable={notificationStatus.isEnabled}
                  keyboardType="numeric"
                  returnKeyType="done"
                  autoComplete="off"
                  autoCorrect={false}
                  autoCapitalize="none"
                  selectTextOnFocus={true}
                />
              </TouchableOpacity>
              
              <View style={styles.timeSeparator}>
                <Text style={styles.timeSeparatorText}>〜</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.timeInputWrapper}
                onPress={() => {
                  if (notificationStatus.isEnabled) {
                    sleepTimeRef.current?.focus();
                  }
                }}
                disabled={!notificationStatus.isEnabled}
                activeOpacity={0.7}
              >
                <Text style={[styles.timeLabel, !notificationStatus.isEnabled && styles.timeLabelDisabled]}>就寝</Text>
                <TextInput
                  ref={sleepTimeRef}
                  style={[
                    styles.timeInput, 
                    !notificationStatus.isEnabled && styles.timeInputDisabled,
                    !isValidTime(sleepTime) && sleepTime.length > 0 && styles.timeInputError
                  ]}
                  value={sleepTime}
                  onChangeText={notificationStatus.isEnabled ? handleSleepTimeChange : undefined}
                  placeholder="23:00"
                  maxLength={5}
                  editable={notificationStatus.isEnabled}
                  keyboardType="numeric"
                  returnKeyType="done"
                  autoComplete="off"
                  autoCorrect={false}
                  autoCapitalize="none"
                  selectTextOnFocus={true}
                />
              </TouchableOpacity>
            </View>
            
          </View>

          {/* 通知頻度設定 */}
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>通知頻度</Text>
            <View style={styles.optionContainer}>
              {frequencyOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    tempNotificationFrequency === option.value && styles.optionButtonSelected
                  ]}
                  onPress={() => setTempNotificationFrequency(option.value as 'low' | 'medium' | 'high')}
                >
                  <Text style={[
                    styles.optionText,
                    tempNotificationFrequency === option.value && styles.optionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                  <Text style={[
                    styles.optionDescription,
                    tempNotificationFrequency === option.value && styles.optionDescriptionSelected
                  ]}>
                    {option.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={[styles.settingItem, !notificationStatus.isEnabled && styles.settingItemDisabled]}>
            <Text style={[styles.settingLabel, !notificationStatus.isEnabled && styles.settingLabelDisabled]}>スヌーズ時間</Text>
            <View style={styles.optionContainer}>
              {snoozeOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.snoozeButton,
                    tempSnoozeMinutes === option.value && styles.snoozeButtonSelected,
                    !notificationStatus.isEnabled && styles.snoozeButtonDisabled
                  ]}
                  onPress={() => notificationStatus.isEnabled && setTempSnoozeMinutes(option.value)}
                  disabled={!notificationStatus.isEnabled}
                >
                  <Text style={[
                    styles.snoozeText,
                    tempSnoozeMinutes === option.value && styles.snoozeTextSelected,
                    !notificationStatus.isEnabled && styles.snoozeTextDisabled
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* テスト通知ボタン */}
          <View style={[styles.settingItem, !notificationStatus.isEnabled && styles.settingItemDisabled]}>
            <Text style={[styles.settingLabel, !notificationStatus.isEnabled && styles.settingLabelDisabled]}>通知テスト</Text>
            <TestButton
              onPress={handleTestNotification}
              disabled={!notificationStatus.isEnabled}
              title="テスト通知を送信"
              description="通知が正常に動作するかテストできます"
            />
            <Text style={[styles.helpText, !notificationStatus.isEnabled && styles.helpTextDisabled]}>
              通知が正常に動作するかテストできます
            </Text>
          </View>

          {/* スケジュール通知一覧ボタン */}
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>スケジュール通知一覧</Text>
            <TestButton
              onPress={handleViewScheduledNotifications}
              disabled={false}
              title="通知一覧を表示"
              description="現在スケジュールされている通知を確認できます"
            />
            <Text style={styles.helpText}>
              現在スケジュールされている通知を確認できます
            </Text>
          </View>

          {/* 通知の種類設定 */}
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>通知の種類</Text>
            <View style={styles.toggleContainer}>
              <View style={styles.toggleItem}>
                <Text style={styles.toggleLabel}>朝の通知</Text>
                <TouchableOpacity
                  style={[styles.toggle, enableMorningNotification && styles.toggleActive]}
                  onPress={() => setEnableMorningNotification(!enableMorningNotification)}
                >
                  <View style={[styles.toggleThumb, enableMorningNotification && styles.toggleThumbActive]} />
                </TouchableOpacity>
              </View>
              <View style={styles.toggleItem}>
                <Text style={styles.toggleLabel}>リマインダー通知</Text>
                <TouchableOpacity
                  style={[styles.toggle, enableReminderNotification && styles.toggleActive]}
                  onPress={() => setEnableReminderNotification(!enableReminderNotification)}
                >
                  <View style={[styles.toggleThumb, enableReminderNotification && styles.toggleThumbActive]} />
                </TouchableOpacity>
              </View>
              <View style={styles.toggleItem}>
                <Text style={styles.toggleLabel}>スヌーズ通知</Text>
                <TouchableOpacity
                  style={[styles.toggle, enableSnoozeNotification && styles.toggleActive]}
                  onPress={() => setEnableSnoozeNotification(!enableSnoozeNotification)}
                >
                  <View style={[styles.toggleThumb, enableSnoozeNotification && styles.toggleThumbActive]} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* 通知の音設定 */}
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>通知の音</Text>
            <View style={styles.toggleContainer}>
              <View style={styles.toggleItem}>
                <Text style={styles.toggleLabel}>サウンド</Text>
                <TouchableOpacity
                  style={[styles.toggle, notificationSound && styles.toggleActive]}
                  onPress={() => setNotificationSound(!notificationSound)}
                >
                  <View style={[styles.toggleThumb, notificationSound && styles.toggleThumbActive]} />
                </TouchableOpacity>
              </View>
              <View style={styles.toggleItem}>
                <Text style={styles.toggleLabel}>バイブレーション</Text>
                <TouchableOpacity
                  style={[styles.toggle, notificationVibration && styles.toggleActive]}
                  onPress={() => setNotificationVibration(!notificationVibration)}
                >
                  <View style={[styles.toggleThumb, notificationVibration && styles.toggleThumbActive]} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* 通知間隔設定 */}
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>通知間隔（分）</Text>
            <View style={styles.optionContainer}>
              {[30, 60, 90, 120].map((interval) => (
                <TouchableOpacity
                  key={interval}
                  style={[
                    styles.optionButton,
                    notificationInterval === interval && styles.optionButtonSelected
                  ]}
                  onPress={() => setNotificationInterval(interval)}
                >
                  <Text style={[
                    styles.optionText,
                    notificationInterval === interval && styles.optionTextSelected
                  ]}>
                    {interval}分
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* カスタムメッセージ設定 */}
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>カスタムメッセージ</Text>
            <TextInput
              style={styles.textInput}
              value={customMessage}
              onChangeText={setCustomMessage}
              placeholder="例: 水分補給の時間です！"
              placeholderTextColor="#8E8E93"
              multiline
              numberOfLines={2}
            />
            <Text style={styles.helpText}>
              通知に表示するカスタムメッセージを設定できます
            </Text>
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
                <Text style={styles.closeButtonText}>閉じる</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.notificationList}>
              {scheduledNotifications.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateIcon}>📅</Text>
                  <Text style={styles.emptyStateTitle}>通知なし</Text>
                  <Text style={styles.emptyStateText}>
                    現在スケジュールされている通知はありません
                  </Text>
                </View>
              ) : (
                <View style={styles.notificationContainer}>
                  {scheduledNotifications.map((notification, index) => (
                    <View key={index} style={styles.notificationCard}>
                      <View style={styles.notificationHeader}>
                        <Text style={styles.notificationTime}>
                          {formatNotificationTime(notification)}
                        </Text>
                        <View style={styles.notificationType}>
                          <Text style={styles.notificationTypeText}>
                            {getNotificationType(notification)}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.notificationTitle}>
                        {notification.content.title}
                      </Text>
                      <Text style={styles.notificationBody}>
                        {notification.content.body}
                      </Text>
                    </View>
                  ))}
                </View>
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
    backgroundColor: '#E0F2FE',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  safeArea: {
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0369A1',
    letterSpacing: -0.5,
  },
  scrollView: {
    flex: 1,
  },
  placeholder: {
    width: 40,
  },
  content: {
    padding: 24,
    paddingBottom: 120,
    flexGrow: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0369A1',
    marginBottom: 16,
  },
  settingItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  settingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    minWidth: 90,
    minHeight: 44,
  },
  optionButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  optionText: {
    fontSize: 16,
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
    borderRadius: RADIUS.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // 生活リズムカード（シンプルで格好いい）
  lifeRhythmCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  lifeRhythmCardDisabled: {
    backgroundColor: '#F8F8F8',
    opacity: 0.6,
  },
  lifeRhythmHeader: {
    marginBottom: 12,
  },
  lifeRhythmTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  lifeRhythmTitleDisabled: {
    color: '#8E8E93',
  },
  timeInputsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  timeInputWrapper: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  timeLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8E8E93',
    marginBottom: 6,
  },
  timeLabelDisabled: {
    color: '#C7C7CC',
  },
  timeInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: RADIUS.sm,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    minWidth: 100,
    minHeight: 48,
  },
  timeInputDisabled: {
    backgroundColor: '#F2F2F7',
    color: '#C7C7CC',
    borderColor: '#E5E5EA',
  },
  timeInputError: {
    borderColor: '#FF3B30',
    backgroundColor: '#FFF5F5',
  },
  timeSeparator: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
  },
  timeSeparatorText: {
    fontSize: 20,
    color: '#C7C7CC',
    fontWeight: '600',
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: RADIUS.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 8,
  },
  timeIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  notificationCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: RADIUS.md,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  statusBadge: {
    backgroundColor: '#34C759',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: RADIUS.md,
  },
  statusBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadgeDisabled: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: RADIUS.md,
  },
  statusBadgeTextDisabled: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  notificationDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
    marginBottom: 4,
  },
  settingsButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: RADIUS.sm,
    marginTop: 16,
    alignSelf: 'flex-start',
  },
  settingsButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  // 無効化状態のスタイル
  settingItemDisabled: {
    opacity: 0.5,
  },
  settingLabelDisabled: {
    color: '#C7C7CC',
  },
  optionButtonDisabled: {
    backgroundColor: '#F2F2F7',
    borderColor: '#E5E5EA',
  },
  optionTextDisabled: {
    color: '#C7C7CC',
  },
  snoozeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    minWidth: 80,
  },
  snoozeButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  snoozeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  snoozeTextSelected: {
    color: '#007AFF',
  },
  snoozeButtonDisabled: {
    backgroundColor: '#F2F2F7',
    borderColor: '#E5E5EA',
  },
  snoozeTextDisabled: {
    color: '#C7C7CC',
  },
  optionDescriptionDisabled: {
    color: '#C7C7CC',
  },
  helpTextDisabled: {
    color: '#C7C7CC',
  },
  notificationTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    fontFamily: 'monospace',
  },
  notificationType: {
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.md,
  },
  notificationTypeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#007AFF',
  },
  notificationBody: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  // モーダルスタイル
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '92%',
    maxHeight: '85%',
    padding: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  closeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    backgroundColor: '#8E8E93',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  notificationList: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  // 空状態のスタイル
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // 通知一覧のスタイル
  notificationContainer: {
    paddingVertical: 8,
  },
  saveButtonContainer: {
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: RADIUS.md,
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
  // 新しい設定項目用のスタイル
  toggleContainer: {
    gap: 16,
  },
  toggleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0369A1',
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: '#0EA5E9',
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: RADIUS.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0369A1',
    backgroundColor: '#FFFFFF',
    textAlignVertical: 'top',
    minHeight: 60,
  },
});

