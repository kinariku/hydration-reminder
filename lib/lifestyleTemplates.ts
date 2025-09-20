import { Lifestyle, NotificationPattern } from '../types';

export const lifestyleTemplates: Record<string, { lifestyle: Lifestyle; notificationPattern: NotificationPattern }> = {
  deskWorker: {
    lifestyle: {
      workType: 'desk',
      workHours: { start: '09:00', end: '18:00' },
      breakTimes: ['10:00', '15:00'],
      mealTimes: { breakfast: '08:00', lunch: '12:00', dinner: '19:00' },
      weekendMode: true,
    },
    notificationPattern: {
      frequency: 'medium',
      preferredTimes: ['10:00', '12:00', '15:00', '17:00'],
      quietHours: [{ start: '12:00', end: '13:00' }],
      weekendMode: true,
      adaptiveMode: true,
    },
  },

  student: {
    lifestyle: {
      workType: 'student',
      workHours: { start: '09:00', end: '17:00' },
      breakTimes: ['10:00', '14:00'],
      mealTimes: { breakfast: '08:00', lunch: '12:00', dinner: '18:00' },
      weekendMode: true,
    },
    notificationPattern: {
      frequency: 'high',
      preferredTimes: ['09:00', '11:00', '13:00', '15:00', '17:00'],
      quietHours: [{ start: '12:00', end: '13:00' }],
      weekendMode: true,
      adaptiveMode: true,
    },
  },

  activeWorker: {
    lifestyle: {
      workType: 'active',
      workHours: { start: '08:00', end: '17:00' },
      breakTimes: ['10:00', '14:00'],
      mealTimes: { breakfast: '07:00', lunch: '12:00', dinner: '19:00' },
      weekendMode: true,
    },
    notificationPattern: {
      frequency: 'high',
      preferredTimes: ['08:00', '10:00', '12:00', '14:00', '16:00'],
      quietHours: [{ start: '12:00', end: '13:00' }],
      weekendMode: true,
      adaptiveMode: true,
    },
  },

  freelance: {
    lifestyle: {
      workType: 'freelance',
      workHours: { start: '10:00', end: '19:00' },
      breakTimes: ['12:00', '16:00'],
      mealTimes: { breakfast: '09:00', lunch: '13:00', dinner: '20:00' },
      weekendMode: false,
    },
    notificationPattern: {
      frequency: 'medium',
      preferredTimes: ['10:00', '12:00', '14:00', '16:00', '18:00'],
      quietHours: [{ start: '13:00', end: '14:00' }],
      weekendMode: false,
      adaptiveMode: true,
    },
  },

  mixed: {
    lifestyle: {
      workType: 'mixed',
      workHours: { start: '09:00', end: '18:00' },
      breakTimes: ['10:00', '15:00'],
      mealTimes: { breakfast: '08:00', lunch: '12:00', dinner: '19:00' },
      weekendMode: true,
    },
    notificationPattern: {
      frequency: 'medium',
      preferredTimes: ['09:00', '11:00', '13:00', '15:00', '17:00'],
      quietHours: [{ start: '12:00', end: '13:00' }],
      weekendMode: true,
      adaptiveMode: true,
    },
  },
};

export const getDefaultPersonalizedSettings = (workType: string = 'deskWorker') => {
  const template = lifestyleTemplates[workType] || lifestyleTemplates.deskWorker;
  
  return {
    lifestyle: template.lifestyle,
    notificationPattern: template.notificationPattern,
    learningData: {
      mostActiveHours: [],
      averageIntakeTimes: [],
      skippedNotifications: [],
      successfulReminders: [],
      lastUpdated: new Date().toISOString(),
    },
  };
};
