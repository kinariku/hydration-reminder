import * as BackgroundFetch from 'expo-background-fetch';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';

import { BACKGROUND_FETCH_TASK } from './constants';

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  return BackgroundFetch.BackgroundFetchResult.NewData;
});

export const registerBackgroundFetch = async () => {
  await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
    minimumInterval: 60 * 60 * 24,
    stopOnTerminate: false,
    startOnBoot: true,
  });
};

export const sendTestNotification = async () => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '💧 テスト通知',
        body: '通知機能が正常に動作しています！',
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null,
    });
    console.log('Test notification sent');
    return true;
  } catch (error) {
    console.warn('Failed to send test notification:', error);
    return false;
  }
};
