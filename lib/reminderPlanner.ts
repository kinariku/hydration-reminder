export type PaceCategory = 'behind' | 'onTrack' | 'ahead';

export interface ReminderPlanContext {
  targetMl: number;
  consumedMl: number;
  wake: Date;
  sleep: Date;
  now: Date;
  reminderCount: number;
}

export interface ReminderPlanResult {
  nextAt: Date | null;
  suggestMl: number;
  pace: number;
  paceCategory: PaceCategory;
  nextIntervalMin: number;
  remainMl: number;
  remainMin: number;
}

export const planNextReminder = (
  ctx: ReminderPlanContext,
  userSnoozeMin?: number
): ReminderPlanResult => {
  const effectiveNow = ctx.now < ctx.wake ? new Date(ctx.wake) : ctx.now;

  const totalMin = Math.max((ctx.sleep.getTime() - ctx.wake.getTime()) / 60000, 1);
  const elapsedMin = Math.max((effectiveNow.getTime() - ctx.wake.getTime()) / 60000, 0);
  const remainMin = Math.max((ctx.sleep.getTime() - effectiveNow.getTime()) / 60000, 0);

  const remainMl = Math.max(ctx.targetMl - ctx.consumedMl, 0);
  if (remainMl === 0 || remainMin === 0) {
    return {
      nextAt: null,
      suggestMl: 0,
      pace: 1,
      paceCategory: 'onTrack',
      nextIntervalMin: 0,
      remainMl,
      remainMin,
    };
  }

  const baseInt = clamp(Math.floor(totalMin / ctx.reminderCount), 45, 150);
  const expectedMl = ctx.targetMl * (elapsedMin / totalMin);
  const pace = expectedMl === 0 ? 1 : ctx.consumedMl / expectedMl;

  let nextInt = baseInt;
  let paceCategory: PaceCategory = 'onTrack';

  if (pace < 0.8) {
    nextInt = Math.max(30, Math.floor(baseInt * 0.7));
    paceCategory = 'behind';
  } else if (pace > 1.2) {
    nextInt = Math.min(180, Math.floor(baseInt * 1.3));
    paceCategory = 'ahead';
  }

  // 夜間は静かめに
  if (remainMin <= 60) {
    nextInt = Math.min(180, Math.floor(nextInt * 1.1));
  }

  if (userSnoozeMin !== undefined) {
    nextInt = Math.max(5, userSnoozeMin);
  }

  const nextIntervalMin = Math.max(1, nextInt);
  const notificationsLeft = Math.max(1, Math.ceil(remainMin / nextIntervalMin));
  const dynamicUpperBound = pace < 0.7 ? 400 : 350;
  const isLateNight = remainMin <= 60;
  const upperBound = isLateNight ? Math.min(dynamicUpperBound, 250) : dynamicUpperBound;

  let suggestMl = Math.round(remainMl / notificationsLeft);
  suggestMl = clamp(suggestMl, remainMl < 120 ? remainMl : 120, upperBound);
  suggestMl = Math.min(suggestMl, remainMl);

  const nextAt = new Date(effectiveNow.getTime() + nextIntervalMin * 60000);
  if (nextAt >= ctx.sleep) {
    return {
      nextAt: null,
      suggestMl: remainMl,
      pace,
      paceCategory,
      nextIntervalMin: 0,
      remainMl,
      remainMin,
    };
  }

  return {
    nextAt,
    suggestMl,
    pace,
    paceCategory,
    nextIntervalMin,
    remainMl,
    remainMin,
  };
};

const clamp = (value: number, min: number, max: number) => {
  if (min > max) {
    return min;
  }
  return Math.min(Math.max(value, min), max);
};
