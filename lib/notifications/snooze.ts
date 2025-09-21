import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';

import { waitFor } from './helpers';
import { ensureNotificationsEnabled } from './permissions';

const SNOOZE_MESSAGES = [
  'まだ飲んでいませんね。今のうちに一杯どう？',
  '水分補給を忘れるとペースが遅れます。少しでも飲んでみましょう',
  '今日は残りの目標が気になりますよ。ここで200ml補給しませんか？',
  'そろそろ本気で飲まないと遅れます。軽くでも口を潤して！',
  'これが最後のリマインドです。今飲んでおくと今日が楽になります',
];

const SNOOZE_CONFIG = {
  maxSnoozes: 5,
  intervalMinutes: 10,
  maxIntervalMinutes: 30,
};

// 通知頻度に基づくスヌーズ設定
const getSnoozeConfigByFrequency = (frequency: 'low' | 'medium' | 'high') => {
  switch (frequency) {
    case 'low':
      return { maxSnoozes: 3, intervalMinutes: 15 };
    case 'medium':
      return { maxSnoozes: 5, intervalMinutes: 10 };
    case 'high':
      return { maxSnoozes: 7, intervalMinutes: 8 };
    default:
      return { maxSnoozes: 5, intervalMinutes: 10 };
  }
};

const SNOOZE_NOTIFICATION_CATEGORY = 'hydration_snooze';
const SNOOZE_NOTIFICATION_TYPES = new Set<string>(['initial', 'snooze']);

export interface SnoozeOptions {
  baseTime: Date;
  suggestMl: number;
  intervalMinutes?: number;
  maxSnoozes?: number;
  frequency?: 'low' | 'medium' | 'high';
}

export interface SnoozeResult {
  scheduledCount: number;
  nextSnoozeAt: Date | null;
}

export const scheduleSnoozeReminders = async (
  options: SnoozeOptions
): Promise<SnoozeResult> => {
  const hasPermission = await ensureNotificationsEnabled();
  if (!hasPermission) {
    return { scheduledCount: 0, nextSnoozeAt: null };
  }

  try {
    console.log('Scheduling snooze reminders...');

    await cancelSnoozeReminders();
    await waitFor(500);

    // 通知頻度に基づく設定を取得
    const frequencyConfig = getSnoozeConfigByFrequency(options.frequency || 'medium');
    
    const {
      baseTime,
      suggestMl,
      intervalMinutes = frequencyConfig.intervalMinutes,
      maxSnoozes = frequencyConfig.maxSnoozes,
    } = options;

    const actualInterval = Math.min(intervalMinutes, SNOOZE_CONFIG.maxIntervalMinutes);
    const totalNotifications = Math.min(maxSnoozes + 1, SNOOZE_CONFIG.maxSnoozes + 1);

    let scheduledCount = 0;
    let nextSnoozeAt: Date | null = null;
    const sequenceId = `snooze:${baseTime.getTime()}`;
    const baseTimeIso = baseTime.toISOString();

    // 最初のスヌーズ通知はメイン通知の5分後に登録
    const firstSnoozeTime = new Date(baseTime.getTime() + 5 * 60 * 1000);
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '💧 水分補給リマインダー',
        body: `水分補給の時間です！${suggestMl}ml どうですか？`,
        sound: true,
        data: {
          type: 'initial',
          category: SNOOZE_NOTIFICATION_CATEGORY,
          sequenceId,
          baseTime: baseTimeIso,
          suggestMl,
          snoozeCount: 0,
        },
      },
      trigger: {
        type: SchedulableTriggerInputTypes.DATE,
        date: firstSnoozeTime,
      },
    });
    scheduledCount++;

    for (let i = 0; i < totalNotifications - 1; i++) {
      // 最初のスヌーズ通知が5分後なので、2番目以降は5分 + 間隔 * (i+1) 分後
      const snoozeTime = new Date(baseTime.getTime() + (5 + (i + 1) * actualInterval) * 60000);
      const message = SNOOZE_MESSAGES[i] || SNOOZE_MESSAGES[SNOOZE_MESSAGES.length - 1];

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '💧 水分補給リマインダー',
          body: message,
          sound: true,
          data: {
            type: 'snooze',
            category: SNOOZE_NOTIFICATION_CATEGORY,
            sequenceId,
            baseTime: baseTimeIso,
            scheduledFor: snoozeTime.toISOString(),
            suggestMl,
            snoozeCount: i + 1,
          },
        },
        trigger: {
          type: SchedulableTriggerInputTypes.DATE,
          date: snoozeTime,
        },
      });
      scheduledCount++;

      if (i === 0) {
        nextSnoozeAt = snoozeTime;
      }
    }

    console.log(`Scheduled ${scheduledCount} snooze reminders (initial + ${totalNotifications - 1} snoozes)`);
    console.log(`Next snooze at: ${nextSnoozeAt?.toLocaleString()}`);

    return { scheduledCount, nextSnoozeAt };
  } catch (error) {
    console.warn('Failed to schedule snooze reminders:', error);
    return { scheduledCount: 0, nextSnoozeAt: null };
  }
};

export const cancelSnoozeReminders = async (): Promise<void> => {
  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

    const snoozeNotifications = scheduledNotifications.filter(notification => {
      const data = notification.content.data ?? {};
      const type = typeof data.type === 'string' ? data.type : undefined;
      const category = typeof data.category === 'string' ? data.category : undefined;

      if (category === SNOOZE_NOTIFICATION_CATEGORY) {
        return true;
      }

      if (type && SNOOZE_NOTIFICATION_TYPES.has(type)) {
        return true;
      }

      return false;
    });

    if (snoozeNotifications.length === 0) {
      console.log('No snooze reminders to cancel');
      return;
    }

    await Promise.all(
      snoozeNotifications.map(notification =>
        Notifications.cancelScheduledNotificationAsync(notification.identifier)
      )
    );

    console.log(`Cancelled ${snoozeNotifications.length} snooze reminders`);
  } catch (error) {
    console.warn('Failed to cancel snooze reminders:', error);
  }
};
