import * as Notifications from 'expo-notifications';
import { getSettings } from '../database';

// 通知ハンドラーを動的に設定
const setupNotificationHandler = async () => {
  try {
    const settings = await getSettings();
    const notificationSound = settings?.notificationSound ?? true;
    const notificationVibration = settings?.notificationVibration ?? true;

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: notificationSound,
        shouldSetBadge: false,
      }),
    });
  } catch (error) {
    console.error('Error setting up notification handler:', error);
    // デフォルト設定でフォールバック
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }
};

// 初期化時に通知ハンドラーを設定
setupNotificationHandler();

// 通知ハンドラーを更新する関数をエクスポート
export const updateNotificationHandler = async () => {
  await setupNotificationHandler();
};

export { registerBackgroundFetch, sendTestNotification } from './background';
export { scheduleButtonTriggeredReminders } from './button';
export {
    cancelScheduledReminders,
    getScheduledNotifications, scheduleReminders
} from './legacy';
export {
    checkNotificationStatus, ensureNotificationsEnabled, openNotificationSettings, requestNotificationPermission
} from './permissions';
export { scheduleNextReminder } from './planning';
export type { ScheduleNextReminderOptions } from './planning';
export { cancelSnoozeReminders, scheduleSnoozeReminders } from './snooze';
export type { SnoozeOptions, SnoozeResult } from './snooze';

