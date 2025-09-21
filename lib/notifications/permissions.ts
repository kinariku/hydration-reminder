import * as Notifications from 'expo-notifications';
import { Linking, Platform } from 'react-native';

type ExtendedNotificationPermissionsRequest = Notifications.NotificationPermissionsRequest & {
  ios?: Notifications.IosNotificationPermissionsRequest & {
    allowAnnouncements?: boolean;
  };
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    const request: ExtendedNotificationPermissionsRequest = {
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
        allowAnnouncements: true,
      },
    };

    const { status } = await Notifications.requestPermissionsAsync(request);
    return status === 'granted';
  } catch (error) {
    console.warn('Notification permission request failed:', error);
    return false;
  }
};

export const ensureNotificationsEnabled = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    console.warn('Notifications are not supported on web platforms');
    return false;
  }

  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status === 'granted') {
      return true;
    }

    const granted = await requestNotificationPermission();
    if (!granted) {
      console.warn('Notification permissions are not granted');
    }

    return granted;
  } catch (error) {
    console.warn('Failed to ensure notification permissions:', error);
    return false;
  }
};

export const checkNotificationStatus = async (): Promise<{
  isEnabled: boolean;
  canRequest: boolean;
  status: string;
}> => {
  try {
    if (Platform.OS === 'web') {
      return {
        isEnabled: false,
        canRequest: false,
        status: 'not_supported',
      };
    }

    const { status } = await Notifications.getPermissionsAsync();

    return {
      isEnabled: status === 'granted',
      canRequest: status !== 'denied',
      status,
    };
  } catch (error) {
    console.error('Failed to check notification status:', error);
    return {
      isEnabled: false,
      canRequest: false,
      status: 'error',
    };
  }
};

export const openNotificationSettings = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'ios') {
      const url = 'app-settings:';
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Failed to open notification settings:', error);
    return false;
  }
};
