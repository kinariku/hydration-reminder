import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { checkNotificationStatus, openNotificationSettings } from '../lib/notifications';
import { NotificationStatus } from '../types/settings';

export function useNotificationStatus() {
  const [notificationStatus, setNotificationStatus] = useState<NotificationStatus>({
    isEnabled: false,
    canRequest: false,
    status: 'unknown',
  });

  const loadNotificationStatus = async () => {
    const status = await checkNotificationStatus();
    console.log('Settings: Notification status loaded:', status);
    setNotificationStatus(status);
  };

  const handleNotificationSetup = async () => {
    await openNotificationSettings();
  };

  useEffect(() => {
    loadNotificationStatus();

    // AppStateのイベントリスナーを追加
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        // アプリがフォアグラウンドに戻ったときに通知ステータスを再チェック
        loadNotificationStatus();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return {
    notificationStatus,
    loadNotificationStatus,
    handleNotificationSetup,
  };
}
