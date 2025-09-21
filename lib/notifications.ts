import * as BackgroundFetch from 'expo-background-fetch';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';

const BACKGROUND_FETCH_TASK = 'background-fetch-task';
const NOTIFICATION_CHANNEL_ID = 'hydration_reminders';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
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

    // Cancel existing notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Calculate reminder times
    const times = calculateReminderTimes(wakeTime, sleepTime, reminderCount);
    
    // Schedule notifications (limit to 64 for iOS)
    const maxNotifications = Math.min(times.length, 64);
    
    for (let i = 0; i < maxNotifications; i++) {
      const time = times[i];
      const amountPerReminder = Math.round(targetMl / reminderCount);
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '💧 水分補給の時間です！',
          body: `約${amountPerReminder}mlの水分を摂取しましょう`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          hour: parseInt(time.split(':')[0]),
          minute: parseInt(time.split(':')[1]),
          repeats: true,
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
