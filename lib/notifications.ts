import * as BackgroundFetch from 'expo-background-fetch';
import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';
import { planNextReminder, ReminderPlanResult } from './reminderPlanner';

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

export interface ScheduleNextReminderOptions {
  wakeTime: string;
  sleepTime: string;
  targetMl: number;
  consumedMl: number;
  reminderCount?: number;
  userSnoozeMin?: number;
}

// 新しい仕様: 水を飲んだタイミングで次の通知をスケジュール
export const scheduleNextReminder = async (
  options: ScheduleNextReminderOptions
): Promise<ReminderPlanResult | null> => {
  try {
    if (Platform.OS === 'web') {
      console.warn('Notifications are not supported on web platforms');
      return null;
    }

    const { status } = await Notifications.getPermissionsAsync();
    let hasPermission = status === 'granted';

    if (!hasPermission) {
      hasPermission = await requestNotificationPermission();
    }

    if (!hasPermission) {
      console.warn('Notification permissions are not granted');
      return null;
    }

    const reminderCount = Math.max(options.reminderCount ?? 8, 1);
    const now = new Date();
    const { wake, sleep } = resolveDayAnchors(options.wakeTime, options.sleepTime, now);

    const plan = planNextReminder(
      {
        targetMl: options.targetMl,
        consumedMl: options.consumedMl,
        wake,
        sleep,
        now,
        reminderCount,
      },
      options.userSnoozeMin
    );

    console.log('Scheduling next reminder with plan:', {
      nextAt: plan.nextAt?.toISOString(),
      suggestMl: plan.suggestMl,
      pace: plan.pace.toFixed(2),
      paceCategory: plan.paceCategory,
      remainingMl: plan.remainMl,
      remainingMinutes: plan.remainMin,
    });

    await Notifications.cancelAllScheduledNotificationsAsync();
    await new Promise((resolve) => setTimeout(resolve, 200));

    if (!plan.nextAt) {
      console.log('No further reminders scheduled for today (target reached or day ended).');
      return plan;
    }

    const { title, body } = buildNotificationMessage(plan);

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        data: {
          suggestMl: plan.suggestMl,
          nextAt: plan.nextAt.toISOString(),
          paceCategory: plan.paceCategory,
        },
      },
      trigger: {
        type: SchedulableTriggerInputTypes.DATE,
        date: plan.nextAt,
        channelId: NOTIFICATION_CHANNEL_ID,
      },
    });

    console.log('Next reminder scheduled successfully at', plan.nextAt.toLocaleString());

    return plan;
  } catch (error) {
    console.warn('Failed to schedule next reminder:', error);
    return null;
  }
};

const resolveDayAnchors = (wakeTime: string, sleepTime: string, reference: Date) => {
  const wake = parseTimeToDate(wakeTime, reference);
  let sleep = parseTimeToDate(sleepTime, wake <= reference ? wake : reference);

  if (sleep <= wake) {
    sleep.setDate(sleep.getDate() + 1);
  }

  return { wake, sleep };
};

const parseTimeToDate = (time: string, reference: Date) => {
  const [hourStr, minuteStr] = time.split(':');
  const hours = Number.parseInt(hourStr ?? '0', 10);
  const minutes = Number.parseInt(minuteStr ?? '0', 10);
  const date = new Date(reference);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

const buildNotificationMessage = (plan: ReminderPlanResult) => {
  const intervalText = formatInterval(plan.nextIntervalMin);
  const nextTimeText = plan.nextAt ? formatTime(plan.nextAt) : '';

  let prefix = '';
  switch (plan.paceCategory) {
    case 'behind':
      prefix = 'ちょっとペース遅め。';
      break;
    case 'ahead':
      prefix = '今のペースなら少しゆっくりでOK。';
      break;
    default:
      prefix = 'いいペースです。';
  }

  const suggestion = `いま ${plan.suggestMl}ml いきますか？`;
  const nextInfo = `次は${intervalText}${nextTimeText ? `（${nextTimeText}頃）` : ''}を予定しています。`;

  return {
    title: '💧 水分補給リマインダー',
    body: `${prefix}${suggestion} ${nextInfo}`.trim(),
  };
};

const formatInterval = (minutes: number) => {
  const rounded = Math.max(1, Math.round(minutes));
  if (rounded < 60) {
    return `${rounded}分後`;
  }

  const hours = Math.floor(rounded / 60);
  const mins = rounded % 60;

  if (mins === 0) {
    return `${hours}時間後`;
  }

  return `${hours}時間${mins}分後`;
};

const formatTime = (date: Date) => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
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
