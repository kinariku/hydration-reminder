import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export {
  requestNotificationPermission,
  ensureNotificationsEnabled,
  checkNotificationStatus,
  openNotificationSettings,
} from './permissions';
export type { ScheduleNextReminderOptions } from './planning';
export { scheduleNextReminder } from './planning';
export type { SnoozeOptions, SnoozeResult } from './snooze';
export { scheduleSnoozeReminders, cancelSnoozeReminders } from './snooze';
export { scheduleButtonTriggeredReminders } from './button';
export {
  scheduleReminders,
  cancelScheduledReminders,
  getScheduledNotifications,
} from './legacy';
export { registerBackgroundFetch, sendTestNotification } from './background';
