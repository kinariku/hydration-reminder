import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';

import { ensureNotificationChannel } from './channels';
import { NOTIFICATION_CHANNEL_ID } from './constants';
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

    // メイン通知は使わず、頻度に応じた基準時刻・提案量でスヌーズを開始
    if (now < todaySleep && consumedMl < targetMl) {
      console.log('Scheduling snooze reminders with frequency-aware logic...');

      // 頻度別の基準間隔（分）
      const baseIntervalMin = ((): number => {
        switch (frequency) {
          case 'high':
            return 30; // 表示: 30分おき
          case 'medium':
            return 60; // 表示: 1時間おき
          case 'low':
          default:
            return 90; // 表示: 90分おき
        }
      })();

      // 次の通知時間 = 現在 + 基準間隔
      const nextNotificationTime = new Date(now.getTime() + baseIntervalMin * 60000);

      // 残量に基づき、頻度でスケールした提案量を算出
      const remainMl = Math.max(targetMl - consumedMl, 0);
      const rawFraction = ((): number => {
        switch (frequency) {
          case 'high':
            return 0.07; // 7%
          case 'low':
            return 0.13; // 13%
          case 'medium':
          default:
            return 0.10; // 10%
        }
      })();
      const fractionAmount = Math.round(targetMl * rawFraction);
      const clamped = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
      const bounds = ((): { min: number; max: number } => {
        switch (frequency) {
          case 'high':
            return { min: 150, max: 300 };
          case 'low':
            return { min: 250, max: 500 };
          case 'medium':
          default:
            return { min: 200, max: 400 };
        }
      })();
      let suggestMl = clamped(fractionAmount, bounds.min, bounds.max);
      suggestMl = Math.min(suggestMl, remainMl);

      // スヌーズの間隔は頻度のデフォルト or ユーザー設定
      const snoozeInterval = Math.max(5, userSnoozeMin ?? (frequency === 'high' ? 8 : frequency === 'low' ? 15 : 10));

      await scheduleSnoozeReminders({
        baseTime: nextNotificationTime,
        suggestMl,
        intervalMinutes: snoozeInterval,
        maxSnoozes: frequency === 'high' ? 7 : frequency === 'low' ? 3 : 5,
        frequency,
        targetMl,
        consumedMl,
      });
      console.log('Snooze reminders scheduled');
    } else {
      console.log('No further reminders scheduled for today (target reached or day ended).');
    }

    // Android の通知チャネルを保証
    await ensureNotificationChannel();

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
            title: 'おはようございます',
            body: `今日も水分補給を始めましょう。目標は ${targetMl}ml です。`,
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
            channelId: NOTIFICATION_CHANNEL_ID,
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
