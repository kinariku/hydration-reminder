import { IntakeLog, LearningData, PersonalizedSettings } from '../types';

export const analyzeHourlyPatterns = (intakeLogs: IntakeLog[]): Record<string, number> => {
  const hourlyIntake: Record<string, number> = {};
  
  intakeLogs.forEach(log => {
    const hour = new Date(log.dateTime).getHours().toString().padStart(2, '0');
    hourlyIntake[hour] = (hourlyIntake[hour] || 0) + log.amountMl;
  });
  
  return hourlyIntake;
};

export const analyzeSuccessfulReminders = (intakeLogs: IntakeLog[]): string[] => {
  const hourlyCount: Record<string, number> = {};
  
  intakeLogs.forEach(log => {
    const hour = new Date(log.dateTime).getHours().toString().padStart(2, '0');
    hourlyCount[hour] = (hourlyCount[hour] || 0) + 1;
  });
  
  // 最も摂取回数が多い時間帯を返す
  return Object.entries(hourlyCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([hour]) => `${hour}:00`);
};

export const analyzeSkippedNotifications = (intakeLogs: IntakeLog[]): string[] => {
  // 通知が送信されたが、その時間帯に摂取がなかった時間帯を特定
  // これは実際の通知ログが必要だが、今回は簡易実装
  const allHours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const activeHours = new Set(
    intakeLogs.map(log => new Date(log.dateTime).getHours().toString().padStart(2, '0'))
  );
  
  return allHours.filter(hour => !activeHours.has(hour));
};

export const calculateOptimalFrequency = (hourlyIntake: Record<string, number>): 'low' | 'medium' | 'high' => {
  const totalIntake = Object.values(hourlyIntake).reduce((sum, amount) => sum + amount, 0);
  const activeHours = Object.keys(hourlyIntake).length;
  
  if (activeHours >= 8) return 'high';
  if (activeHours >= 5) return 'medium';
  return 'low';
};

export const learnUserPatterns = (intakeLogs: IntakeLog[]): Partial<LearningData> => {
  const hourlyIntake = analyzeHourlyPatterns(intakeLogs);
  const successfulTimes = analyzeSuccessfulReminders(intakeLogs);
  const skippedTimes = analyzeSkippedNotifications(intakeLogs);
  const optimalFrequency = calculateOptimalFrequency(hourlyIntake);
  
  return {
    mostActiveHours: successfulTimes,
    averageIntakeTimes: successfulTimes,
    skippedNotifications: skippedTimes,
    successfulReminders: successfulTimes,
    lastUpdated: new Date().toISOString(),
  };
};

export const adjustScheduleBasedOnLearning = (
  currentSettings: PersonalizedSettings,
  learningData: Partial<LearningData>
): PersonalizedSettings => {
  const updatedSettings = { ...currentSettings };
  
  if (learningData.successfulReminders && learningData.successfulReminders.length > 0) {
    // 成功した時間帯を優先的に使用
    updatedSettings.notificationPattern.preferredTimes = [
      ...learningData.successfulReminders,
      ...currentSettings.notificationPattern.preferredTimes
    ].slice(0, 8); // 最大8個まで
  }
  
  if (learningData.skippedNotifications && learningData.skippedNotifications.length > 0) {
    // スキップされがちな時間帯を静音時間に追加
    const newQuietHours = learningData.skippedNotifications.map(hour => ({
      start: `${hour}:00`,
      end: `${hour}:30`,
    }));
    
    updatedSettings.notificationPattern.quietHours = [
      ...currentSettings.notificationPattern.quietHours,
      ...newQuietHours
    ];
  }
  
  return updatedSettings;
};

export const improveSchedule = (
  currentSettings: PersonalizedSettings,
  dailyData: {
    successfulReminders: string[];
    failedReminders: string[];
  }
): PersonalizedSettings => {
  const updatedSettings = { ...currentSettings };
  
  // 成功した時間帯を強化
  if (dailyData.successfulReminders.length > 0) {
    const currentTimes = updatedSettings.notificationPattern.preferredTimes;
    const newTimes = dailyData.successfulReminders.filter(time => !currentTimes.includes(time));
    updatedSettings.notificationPattern.preferredTimes = [
      ...newTimes,
      ...currentTimes
    ].slice(0, 8);
  }
  
  // 失敗した時間帯を調整
  if (dailyData.failedReminders.length > 0) {
    const newQuietHours = dailyData.failedReminders.map(hour => ({
      start: `${hour}:00`,
      end: `${hour}:30`,
    }));
    
    updatedSettings.notificationPattern.quietHours = [
      ...currentSettings.notificationPattern.quietHours,
      ...newQuietHours
    ];
  }
  
  return updatedSettings;
};
