import { UserProfile } from '../types';

const isValidNumber = (value: string): boolean => {
  if (!value.trim()) {
    return false;
  }

  const parsed = Number(value);
  return !Number.isNaN(parsed) && parsed > 0;
};

const parseOptionalNumber = (value: string): number | undefined => {
  if (!value.trim()) {
    return undefined;
  }

  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return undefined;
  }

  return parsed;
};

export const buildUserProfile = (
  weight: string,
  height: string
): UserProfile | null => {
  if (!isValidNumber(weight)) {
    return null;
  }

  const weightKg = Number(weight);
  const heightCm = parseOptionalNumber(height);

  return {
    id: Date.now().toString(),
    weightKg,
    sex: 'male',
    heightCm,
    activityLevel: 'medium',
    wakeTime: '07:00',
    sleepTime: '23:00',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
};
