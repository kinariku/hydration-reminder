import { SettingSection } from '../types/settings';
import { getUnitLabel } from './unitConverter';

export const createSettingsData = (
  userProfile: any,
  settings: any,
  notificationStatus: any
): SettingSection[] => {
  return [
    {
      id: 'profile',
      title: 'プロフィール設定',
      items: [
        {
          id: 'weight',
          icon: 'weight',
          label: '体重',
          value: `${userProfile?.weightKg || '未設定'}kg`,
          route: '/settings/weight',
        },
        {
          id: 'height',
          icon: 'ruler-vertical',
          label: '身長',
          value: `${userProfile?.heightCm || '未設定'}cm`,
          route: '/settings/height',
        },
        {
          id: 'sex',
          icon: 'user',
          label: '性別',
          value: userProfile?.sex === 'male' ? '男性' : 
                 userProfile?.sex === 'female' ? '女性' : 
                 userProfile?.sex === 'other' ? 'その他' : '未設定',
          route: '/settings/sex',
        },
        {
          id: 'activity',
          icon: 'running',
          label: '活動レベル',
          value: userProfile?.activityLevel === 'low' ? '低い' :
                 userProfile?.activityLevel === 'medium' ? '中程度' :
                 userProfile?.activityLevel === 'high' ? '高い' : '未設定',
          route: '/settings/activity',
        },
        {
          id: 'sleep-schedule',
          icon: 'bed',
          label: '睡眠時間',
          value: `${userProfile?.wakeTime || '07:00'} - ${userProfile?.sleepTime || '23:00'}`,
          route: '/settings/sleep-schedule',
          isLast: true,
        },
      ],
    },
    {
      id: 'notification',
      title: '通知設定',
      items: !notificationStatus.isEnabled ? [
        {
          id: 'enable-notifications',
          icon: 'bell',
          label: '通知を有効にする',
          route: '/settings/notifications',
          isLast: true,
        },
      ] : [
        {
          id: 'notification-frequency',
          icon: 'bell',
          label: '通知頻度',
          value: settings.notificationFrequency === 'high' ? '高頻度' :
                 settings.notificationFrequency === 'medium' ? '中頻度' :
                 settings.notificationFrequency === 'low' ? '低頻度' : '中頻度',
          route: '/settings/notification-frequency',
        },
        {
          id: 'snooze',
          icon: 'clock',
          label: 'スヌーズ時間',
          value: `${settings.snoozeMinutes || 15}分`,
          route: '/settings/snooze',
        },
        {
          id: 'notification-sound',
          icon: 'volume-up',
          label: '通知音・振動',
          route: '/settings/notification-sound',
          isLast: true,
        },
      ],
    },
    {
      id: 'app',
      title: 'アプリ設定',
      items: [
        {
          id: 'unit-settings',
          icon: 'ruler',
          label: '単位設定',
          value: getUnitLabel(settings.units),
          route: '/settings/unit',
        },
        {
          id: 'preset-settings',
          icon: 'tint',
          label: 'プリセット量',
          value: `${settings.presetMl?.length || 0}個設定済み`,
          route: '/settings/preset-settings',
          isLast: true,
        },
      ],
    },
    {
      id: 'info',
      title: 'アプリ情報',
      items: [
        {
          id: 'version',
          icon: 'info-circle',
          label: 'バージョン',
          value: '1.0.0',
          route: '',
          isLast: true,
        },
      ],
    },
  ];
};
