import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { NOTIFICATION_CHANNEL_ID } from './constants';

let channelSetupPromise: Promise<void> | null = null;

const createChannelIfNeeded = async (): Promise<void> => {
  const existingChannel = await Notifications.getNotificationChannelAsync(
    NOTIFICATION_CHANNEL_ID
  );

  if (existingChannel) {
    return;
  }

  await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
    name: 'Hydration Reminders',
    description: 'Water intake reminders and morning wake-up alerts.',
    importance: Notifications.AndroidImportance.HIGH,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    sound: 'default',
    enableLights: true,
    enableVibrate: true,
    vibrationPattern: [0, 250, 250, 250],
  });
};

export const ensureNotificationChannel = async (): Promise<void> => {
  if (Platform.OS !== 'android') {
    return;
  }

  if (!channelSetupPromise) {
    channelSetupPromise = createChannelIfNeeded();
  }

  try {
    await channelSetupPromise;
  } catch (error) {
    channelSetupPromise = null;
    console.warn('Failed to ensure notification channel:', error);
    throw error;
  }
};
