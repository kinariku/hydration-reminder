import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';

import { NOTIFICATION_CHANNEL_ID } from './constants';
import { ensureNotificationChannel } from './channels';
import { waitFor } from './helpers';
import { ensureNotificationsEnabled } from './permissions';

export const scheduleReminders = async (
  wakeTime: string,
  sleepTime: string,
  targetMl: number,
  reminderCount: number = 8
) => {
  const hasPermission = await ensureNotificationsEnabled();
  if (!hasPermission) {
    return;
  }

  try {
    console.log('Scheduling notifications...');

    await Notifications.cancelAllScheduledNotificationsAsync();
    await waitFor(500);

    await ensureNotificationChannel();

    const times = calculateReminderTimes(wakeTime, sleepTime, reminderCount);
    const maxNotifications = Math.min(times.length, 64);

    for (let i = 0; i < maxNotifications; i++) {
      const time = times[i];
      const amountPerReminder = Math.round(targetMl / reminderCount);

      const [hours, minutes] = time.split(':').map(Number);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);

      let scheduledTime = today;
      if (today <= now) {
        scheduledTime = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      }

      console.log(
        `Scheduling notification ${i + 1} for ${hours}:${minutes.toString().padStart(2, '0')} (repeats daily)`
      );
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
