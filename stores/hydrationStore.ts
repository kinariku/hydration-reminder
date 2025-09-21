import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { getLocalDateString } from '../lib/date';
import { adjustScheduleBasedOnLearning, learnUserPatterns } from '../lib/learningEngine';
import { getDefaultPersonalizedSettings } from '../lib/lifestyleTemplates';
import { AppState, DailyGoal, IntakeLog, PersonalizedSettings, Settings, UserProfile } from '../types';

interface HydrationStore extends AppState {
  // Actions
  setUserProfile: (profile: UserProfile) => void;
  setDailyGoal: (goal: DailyGoal) => void;
  setTodayIntake: (logs: IntakeLog[]) => void;
  addIntakeLog: (log: IntakeLog) => void;
  updateIntakeLog: (id: string, log: Partial<IntakeLog>) => void;
  deleteIntakeLog: (id: string) => void;
  setSettings: (settings: Partial<Settings>) => void;
  setPersonalizedSettings: (settings: PersonalizedSettings) => void;
  setOnboarded: (onboarded: boolean) => void;
  setNotificationPermission: (permission: boolean) => void;
  calculateDailyGoal: (profile: UserProfile) => DailyGoal;
  getTodayIntake: () => IntakeLog[];
  getTodayTotal: () => number;
  getTodayProgress: () => number;
  initializePersonalizedSettings: (workType?: string) => void;
  updateLearningData: () => void;
}

export const useHydrationStore = create<HydrationStore>()(
  persist(
    (set, get) => ({
      // Initial state
      userProfile: null,
      dailyGoal: null,
      todayIntake: [],
      settings: {
        units: 'ml',
        presetMl: [100, 200, 300, 500],
        snoozeMinutes: 15,
        quietHours: [],
        analyticsOptIn: false,
        language: 'ja',
        theme: 'system',
      },
      personalizedSettings: null,
      isOnboarded: false,
      notificationPermission: false,

      // Actions
      setUserProfile: (profile) => {
        set({ userProfile: profile });
        const goal = get().calculateDailyGoal(profile);
        set({ dailyGoal: goal });
      },

      setDailyGoal: (goal) => set({ dailyGoal: goal }),

      setTodayIntake: (logs) => {
        const todayKey = getLocalDateString();
        set({
          todayIntake: logs.filter(
            (log) => getLocalDateString(new Date(log.dateTime)) === todayKey
          ),
        });
      },

      addIntakeLog: (log) => {
        set((state) => {
          const todayKey = getLocalDateString();
          const logKey = getLocalDateString(new Date(log.dateTime));
          if (logKey !== todayKey || state.todayIntake.some((item) => item.id === log.id)) {
            return { todayIntake: state.todayIntake };
          }

          return {
            todayIntake: [...state.todayIntake, log],
          };
        });
      },

      updateIntakeLog: (id, log) => {
        set((state) => ({
          todayIntake: state.todayIntake.map((item) =>
            item.id === id ? { ...item, ...log } : item
          ),
        }));
      },

      deleteIntakeLog: (id) => {
        set((state) => ({
          todayIntake: state.todayIntake.filter((item) => item.id !== id),
        }));
      },

      setSettings: (settings) => {
        set((state) => ({
          settings: { ...state.settings, ...settings },
        }));
      },

      setPersonalizedSettings: (settings) => {
        set({ personalizedSettings: settings });
      },

      initializePersonalizedSettings: (workType = 'deskWorker') => {
        const defaultSettings = getDefaultPersonalizedSettings(workType);
        set({ personalizedSettings: defaultSettings });
      },

      updateLearningData: () => {
        const state = get();
        if (!state.personalizedSettings || state.todayIntake.length === 0) return;

        const learningData = learnUserPatterns(state.todayIntake);
        const updatedSettings = adjustScheduleBasedOnLearning(
          state.personalizedSettings,
          learningData
        );

        set({ personalizedSettings: updatedSettings });
      },

      setOnboarded: (onboarded) => set({ isOnboarded: onboarded }),

      setNotificationPermission: (permission) =>
        set({ notificationPermission: permission }),

      calculateDailyGoal: (profile) => {
        const baseAmount = profile.weightKg * 35;
        let activityBonus = 0;
        
        switch (profile.activityLevel) {
          case 'low':
            activityBonus = 0;
            break;
          case 'medium':
            activityBonus = 500;
            break;
          case 'high':
            activityBonus = 1000;
            break;
        }

        const totalAmount = baseAmount + activityBonus;
        const clampedAmount = Math.max(1200, Math.min(5000, totalAmount));

        return {
          date: getLocalDateString(),
          targetMl: clampedAmount,
          algorithm: 'v1',
          manualOverride: false,
        };
      },

      getTodayIntake: () => {
        const today = getLocalDateString();
        return get().todayIntake.filter(
          (log) => getLocalDateString(new Date(log.dateTime)) === today
        );
      },

      getTodayTotal: () => {
        return get().getTodayIntake().reduce((sum, log) => sum + log.amountMl, 0);
      },

      getTodayProgress: () => {
        const total = get().getTodayTotal();
        const goal = get().dailyGoal?.targetMl || 0;
        return goal > 0 ? Math.min(total / goal, 1) : 0;
      },
    }),
    {
      name: 'hydration-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
