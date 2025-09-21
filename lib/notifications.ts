import * as BackgroundFetch from 'expo-background-fetch';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';

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

export const scheduleReminders = async (
  wakeTime: string,
  sleepTime: string,
  targetMl: number,
  reminderCount: number = 8
) => {
  try {
    // Check if notifications are supported (remove isAvailableAsync as it doesn't exist)
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
      
      // 今日の日付でスケジュール
      const today = new Date();
      const [hours, minutes] = time.split(':').map(Number);
      const scheduledTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes);
      
      // 過去の時間の場合は翌日に設定
      if (scheduledTime <= new Date()) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }
      
      console.log(`Scheduling notification ${i + 1} for ${hours}:${minutes.toString().padStart(2, '0')} (repeats daily)`);
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '💧 水分補給の時間です！',
          body: `約${amountPerReminder}mlの水分を摂取しましょう`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          hour: hours,
          minute: minutes,
          repeats: true,
          channelId: NOTIFICATION_CHANNEL_ID,
        },
      });
    }
    
    console.log(`Scheduled ${maxNotifications} notifications`);
  } catch (error) {
    console.warn('Failed to schedule notifications:', error);
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
