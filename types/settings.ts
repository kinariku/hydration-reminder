export interface SettingItem {
  id: string;
  icon: string;
  label: string;
  value?: string;
  route?: string;
  isLast?: boolean;
}

export interface SettingSection {
  id: string;
  title: string;
  items: SettingItem[];
}

export interface NotificationStatus {
  isEnabled: boolean;
  canRequest: boolean;
  status: string;
}


