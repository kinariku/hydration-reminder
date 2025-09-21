import * as BackgroundFetch from 'expo-background-fetch';
import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';

const BACKGROUND_FETCH_TASK = 'background-fetch-task';
const NOTIFICATION_CHANNEL_ID = 'hydration_reminders';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
        allowAnnouncements: true,
      },
    });
    return status === 'granted';
  } catch (error) {
    console.warn('Notification permission request failed:', error);
    return false;
  }
};

// 新しい仕様: 水を飲んだタイミングで次の通知をスケジュール
export const scheduleNextReminder = async (
  wakeTime: string,
  sleepTime: string,
  targetMl: number,
  reminderCount: number = 8
) => {
  try {
    if (Platform.OS === 'web') {
      console.warn('Notifications are not supported on web platforms');
      return;
    }

    const { status } = await Notifications.getPermissionsAsync();
    let hasPermission = status === 'granted';

    if (!hasPermission) {
      hasPermission = await requestNotificationPermission();
    }

    if (!hasPermission) {
      console.warn('Notification permissions are not granted');
      return;
    }

    console.log('Scheduling next reminder...');

    // Cancel existing notifications
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    // 通知のキャンセルを確実にするため少し待つ
    await new Promise(resolve => setTimeout(resolve, 500));

    // Calculate reminder times
    const times = calculateReminderTimes(wakeTime, sleepTime, reminderCount);
    const amountPerReminder = Math.round(targetMl / reminderCount);
    
    // 現在時刻から次の適切な時間を計算
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    
    // 現在時刻以降の最初の時間を見つける
    let nextTimeIndex = -1;
    for (let i = 0; i < times.length; i++) {
      const [hours, minutes] = times[i].split(':').map(Number);
      const timeInMinutes = hours * 60 + minutes;
      
      if (timeInMinutes > currentTimeInMinutes) {
        nextTimeIndex = i;
        break;
      }
    }
    
    // 今日中に見つからない場合は、翌日の最初の時間
    if (nextTimeIndex === -1) {
      nextTimeIndex = 0;
    }
    
    const nextTime = times[nextTimeIndex];
    const [hours, minutes] = nextTime.split(':').map(Number);
    
    // 次の通知時間を計算（今日の日付で）
    let scheduledTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
    
    // 今日中に見つからない場合は翌日
    if (nextTimeIndex === 0 && scheduledTime <= now) {
      scheduledTime = new Date(scheduledTime.getTime() + 24 * 60 * 60 * 1000);
    }
    
    // さらに安全のため、過去の時間の場合は翌日に設定
    if (scheduledTime <= now) {
      scheduledTime = new Date(scheduledTime.getTime() + 24 * 60 * 60 * 1000);
    }
    
    console.log(`Scheduling next reminder for ${hours}:${minutes.toString().padStart(2, '0')}`);
    console.log(`Scheduled time: ${scheduledTime.toLocaleString()}`);
    console.log(`Current time: ${now.toLocaleString()}`);
    console.log(`Time difference (minutes): ${Math.round((scheduledTime.getTime() - now.getTime()) / (1000 * 60))}`);
    
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '💧 水分補給の時間です！',
          body: `約${amountPerReminder}mlの水分を摂取しましょう`,
          sound: true,
        },
        trigger: {
          type: SchedulableTriggerInputTypes.DATE,
          date: scheduledTime,
        },
      });
      
      console.log('Next reminder scheduled successfully');
      
      // スケジュールされた通知を確認
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      console.log(`Total scheduled notifications: ${scheduled.length}`);
      
      if (scheduled.length === 0) {
        console.warn('No notifications were scheduled. This might be due to Expo Go limitations.');
        console.warn('Try using a development build for full notification functionality.');
      }
    } catch (scheduleError) {
      console.error('Failed to schedule notification:', scheduleError);
      throw scheduleError;
    }
  } catch (error) {
    console.warn('Failed to schedule next reminder:', error);
  }
};

// 従来の仕様（全通知をスケジュール）は残しておく
export const scheduleReminders = async (
  wakeTime: string,
  sleepTime: string,
  targetMl: number,
  reminderCount: number = 8
) => {
  try {
    if (Platform.OS === 'web') {
      console.warn('Notifications are not supported on web platforms');
      return;
    }

    const { status } = await Notifications.getPermissionsAsync();
    let hasPermission = status === 'granted';

    if (!hasPermission) {
      hasPermission = await requestNotificationPermission();
    }

    if (!hasPermission) {
      console.warn('Notification permissions are not granted');
      return;
    }

    console.log('Scheduling notifications...');

    // Cancel existing notifications
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    // 通知のキャンセルを確実にするため少し待つ
    await new Promise(resolve => setTimeout(resolve, 500));

    // Calculate reminder times
    const times = calculateReminderTimes(wakeTime, sleepTime, reminderCount);
    
    // Schedule notifications (limit to 64 for iOS)
    const maxNotifications = Math.min(times.length, 64);
    
    for (let i = 0; i < maxNotifications; i++) {
      const time = times[i];
      const amountPerReminder = Math.round(targetMl / reminderCount);
      
      const [hours, minutes] = time.split(':').map(Number);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
      
      // 過去の時間の場合は翌日に設定
      let scheduledTime = today;
      if (today <= now) {
        scheduledTime = new Date(today.getTime() + 24 * 60 * 60 * 1000); // 翌日
      }
      
      console.log(`Scheduling notification ${i + 1} for ${hours}:${minutes.toString().padStart(2, '0')} (repeats daily)`);
      console.log(`Scheduled time: ${scheduledTime.toLocaleString()}`);
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '💧 水分補給の時間です！',
          body: `約${amountPerReminder}mlの水分を摂取しましょう`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          type: SchedulableTriggerInputTypes.DATE,
          date: scheduledTime,
          channelId: NOTIFICATION_CHANNEL_ID,
        },
      });
    }
    
    console.log(`Scheduled ${maxNotifications} notifications`);
  } catch (error) {
    console.warn('Failed to schedule notifications:', error);
  }
};

export const cancelScheduledReminders = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.warn('Failed to cancel scheduled notifications:', error);
    throw error;
  }
};

// スケジュールされた通知の一覧を取得
export const getScheduledNotifications = async () => {
  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    console.log(`Found ${scheduledNotifications.length} scheduled notifications`);
    return scheduledNotifications;
  } catch (error) {
    console.warn('Failed to get scheduled notifications:', error);
    return [];
  }
};

const calculateReminderTimes = (
  wakeTime: string,
  sleepTime: string,
  count: number
): string[] => {
  const wake = new Date(`2000-01-01T${wakeTime}:00`);
  const sleep = new Date(`2000-01-01T${sleepTime}:00`);
  
  // Handle case where sleep time is next day
  if (sleep <= wake) {
    sleep.setDate(sleep.getDate() + 1);
  }
  
  const interval = (sleep.getTime() - wake.getTime()) / count;
  const times: string[] = [];
  
  for (let i = 0; i < count; i++) {
    const time = new Date(wake.getTime() + interval * i);
    times.push(
      `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`
    );
  }
  
  return times;
};

// Background fetch task
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  // Reschedule notifications for today
  // This will be called periodically to ensure notifications are up to date
  return BackgroundFetch.BackgroundFetchResult.NewData;
});

export const registerBackgroundFetch = async () => {
  await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
    minimumInterval: 60 * 60 * 24, // 24 hours
    stopOnTerminate: false,
    startOnBoot: true,
  });
};

// Test notification function
export const sendTestNotification = async () => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '💧 テスト通知',
        body: '通知機能が正常に動作しています！',
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // Send immediately
    });
    console.log('Test notification sent');
    return true;
  } catch (error) {
    console.warn('Failed to send test notification:', error);
    return false;
  }
};
