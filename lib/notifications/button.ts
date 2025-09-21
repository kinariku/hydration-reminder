import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';

import { parseTimeToDate, waitFor } from './helpers';
import { ensureNotificationsEnabled } from './permissions';
import { ScheduleNextReminderOptions } from './planning';
import { scheduleSnoozeReminders } from './snooze';

export const scheduleButtonTriggeredReminders = async (
  options: ScheduleNextReminderOptions
): Promise<void> => {
  const hasPermission = await ensureNotificationsEnabled();
  if (!hasPermission) {
    return;
  }

  try {
    console.log('Scheduling button-triggered reminders...');

    const {
      wakeTime,
      sleepTime,
      targetMl,
      consumedMl,
      reminderCount = 8,
      userSnoozeMin,
      frequency = 'medium',
    } = options;

    await Notifications.cancelAllScheduledNotificationsAsync();
    await waitFor(500);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const todayWake = parseTimeToDate(wakeTime, today);
    const todaySleep = parseTimeToDate(sleepTime, today);
    if (todaySleep <= todayWake) {
      todaySleep.setDate(todaySleep.getDate() + 1);
    }

    // メインの通知機能を削除し、スヌーズ通知のみをスケジュール
    if (now < todaySleep && consumedMl < targetMl) {
      console.log('Scheduling snooze reminders only...');
      
      // 次の通知時間を計算（現在時刻から1時間後）
      const nextNotificationTime = new Date(now.getTime() + 60 * 60 * 1000);
      const suggestMl = Math.max(200, Math.min(500, Math.round(targetMl * 0.1))); // 目標の10%、200-500mlの範囲
      
      const snoozeInterval = Math.max(5, userSnoozeMin ?? 10);
      await scheduleSnoozeReminders({
        baseTime: nextNotificationTime,
        suggestMl: suggestMl,
        intervalMinutes: snoozeInterval,
        maxSnoozes: 5,
        frequency: frequency,
      });
      console.log("Snooze reminders scheduled");
    } else {
      console.log('No further reminders scheduled for today (target reached or day ended).');
    }

    const existingNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const existingMorningNotifications = existingNotifications.filter(
      n => n.content.data?.type === 'morning_wakeup'
    );

    for (let dayOffset = 1; dayOffset <= 7; dayOffset++) {
      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() + dayOffset);

      const dayWake = parseTimeToDate(wakeTime, targetDate);

      const alreadyScheduled = existingMorningNotifications.some(n => {
        const trigger = n.trigger as { date?: string | number | Date } | null;
        const notificationDate = trigger?.date ? new Date(trigger.date) : null;
        return notificationDate?.toDateString() === dayWake.toDateString();
      });

      if (!alreadyScheduled) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '🌅 おはようございます！',
            body: `今日も水分補給を始めましょう！${targetMl}mlの目標に向けて頑張りましょう`,
            sound: true,
            data: {
              type: 'morning_wakeup',
              dayOffset,
              targetMl,
            },
          },
          trigger: {
            type: SchedulableTriggerInputTypes.DATE,
            date: dayWake,
          },
        });

        console.log(
          `Day ${dayOffset} morning wakeup scheduled for ${dayWake.toLocaleDateString()} at ${dayWake.toLocaleTimeString()}`
        );
      } else {
        console.log(`Day ${dayOffset} morning wakeup already scheduled, skipping`);
      }
    }

    console.log('Button-triggered reminders scheduled successfully');
  } catch (error) {
    console.warn('Failed to schedule button-triggered reminders:', error);
  }
};
