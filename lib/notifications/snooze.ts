import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import { ensureNotificationChannel } from './channels';
import { NOTIFICATION_CHANNEL_ID } from './constants';

import { waitFor } from './helpers';
import { ensureNotificationsEnabled } from './permissions';

const SNOOZE_MESSAGES = [
  '喉が乾いていませんか？冷たい水が美味しそう...',
  'ちょっと一息つきませんか？水分補給タイムです✨',
  '今なら美味しく飲めそうです。一口だけでもいかが？',
  'お疲れ様！水分補給でリフレッシュしませんか？',
  '最後のチャンス！今飲むと気分がスッキリしますよ💧',
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
  targetMl?: number;
  consumedMl?: number;
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

    // Android の通知チャネルを保証
    await ensureNotificationChannel();

    // 初回は baseTime で通知
    const firstSnoozeTime = new Date(baseTime.getTime());
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '水分補給リマインダー',
        body: `水分補給の時間です！${suggestMl}ml どうですか？${
          typeof options.consumedMl === 'number' && typeof options.targetMl === 'number'
            ? ` 現在: ${options.consumedMl}ml / 目標: ${options.targetMl}ml`
            : ''
        }`,
        sound: true,
        data: {
          type: 'initial',
          category: SNOOZE_NOTIFICATION_CATEGORY,
          sequenceId,
          baseTime: baseTimeIso,
          suggestMl,
          targetMl: options.targetMl,
          consumedMl: options.consumedMl,
          snoozeCount: 0,
        },
      },
      trigger: {
        type: SchedulableTriggerInputTypes.DATE,
        date: firstSnoozeTime,
        channelId: NOTIFICATION_CHANNEL_ID,
      },
    });
    scheduledCount++;

    // 漸増スヌーズ: ユーザー/頻度ベースの間隔から少しずつ広げる
    const computeIncrementStep = (base: number): number => {
      switch (options.frequency || 'medium') {
        case 'high':
          return Math.max(1, Math.floor(base * 0.25)); // 25%相当
        case 'low':
          return Math.max(3, Math.floor(base * 0.33)); // 33%相当
        case 'medium':
        default:
          return Math.max(2, Math.floor(base * 0.3)); // 30%相当
      }
    };

    const incrementStep = computeIncrementStep(actualInterval);
    let cumulativeMinutes = 0;

    for (let i = 0; i < totalNotifications - 1; i++) {
      // 各スヌーズの実間隔: base + i*step（上限でクランプ）
      const thisInterval = Math.min(
        SNOOZE_CONFIG.maxIntervalMinutes,
        actualInterval + i * incrementStep
      );
      cumulativeMinutes += thisInterval;
      const snoozeTime = new Date(baseTime.getTime() + cumulativeMinutes * 60000);
      const message = SNOOZE_MESSAGES[i] || SNOOZE_MESSAGES[SNOOZE_MESSAGES.length - 1];

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '水分補給リマインダー',
          body: `${message} ${
            typeof options.consumedMl === 'number' && typeof options.targetMl === 'number'
              ? `現在: ${options.consumedMl}ml / 目標: ${options.targetMl}ml`
              : ''
          }`.trim(),
          sound: true,
          data: {
            type: 'snooze',
            category: SNOOZE_NOTIFICATION_CATEGORY,
            sequenceId,
            baseTime: baseTimeIso,
            scheduledFor: snoozeTime.toISOString(),
            suggestMl,
            targetMl: options.targetMl,
            consumedMl: options.consumedMl,
            snoozeCount: i + 1,
          },
        },
        trigger: {
          type: SchedulableTriggerInputTypes.DATE,
          date: snoozeTime,
          channelId: NOTIFICATION_CHANNEL_ID,
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
