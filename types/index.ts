export interface UserProfile {
  id: string;
  weightKg: number;
  sex: 'male' | 'female' | 'other';
  heightCm?: number;
  activityLevel: 'low' | 'medium' | 'high';
  wakeTime: string; // HH:mm format
  sleepTime: string; // HH:mm format
  timezone: string;
}

export interface DailyGoal {
  date: string; // YYYY-MM-DD format
  targetMl: number;
  algorithm: 'v1' | 'manual';
  manualOverride: boolean;
}

export interface IntakeLog {
  id: string;
  dateTime: string; // ISO string
  amountMl: number;
  source: 'quick' | 'custom';
  note?: string;
}

export interface ReminderPlan {
  date: string; // YYYY-MM-DD format
  times: string[]; // HH:mm format
  lastResponse?: 'drank' | 'snooze' | 'ignored';
  lastSuggestMl?: number;
}

export interface Settings {
  units: 'ml' | 'oz';
  presetMl: number[];
  snoozeMinutes: number;
  quietHours: { start: string; end: string }[];
  analyticsOptIn: boolean;
  language: 'ja' | 'en';
  theme: 'light' | 'dark' | 'system';
}

export interface Lifestyle {
  workType: 'desk' | 'active' | 'mixed' | 'student' | 'freelance';
  workHours: { start: string; end: string };
  breakTimes: string[];
  mealTimes: { breakfast: string; lunch: string; dinner: string };
  weekendMode: boolean;
}

export interface NotificationPattern {
  frequency: 'low' | 'medium' | 'high';
  preferredTimes: string[];
  quietHours: { start: string; end: string }[];
  weekendMode: boolean;
  adaptiveMode: boolean;
}

export interface LearningData {
  mostActiveHours: string[];
  averageIntakeTimes: string[];
  skippedNotifications: string[];
  successfulReminders: string[];
  lastUpdated: string;
}

export interface PersonalizedSettings {
  lifestyle: Lifestyle;
  notificationPattern: NotificationPattern;
  learningData: LearningData;
}

export interface AppState {
  userProfile: UserProfile | null;
  dailyGoal: DailyGoal | null;
  todayIntake: IntakeLog[];
  settings: Settings;
  personalizedSettings: PersonalizedSettings | null;
  isOnboarded: boolean;
  notificationPermission: boolean;
}
