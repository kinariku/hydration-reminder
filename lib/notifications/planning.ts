import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';

import { planNextReminder, ReminderPlanResult } from '../reminderPlanner';
import { NOTIFICATION_CHANNEL_ID } from './constants';
import { parseTimeToDate } from './helpers';
import { ensureNotificationsEnabled } from './permissions';

export interface ScheduleNextReminderOptions {
  wakeTime: string;
  sleepTime: string;
  targetMl: number;
  consumedMl: number;
  reminderCount?: number;
  userSnoozeMin?: number;
}

export const scheduleNextReminderInternal = async (
  options: ScheduleNextReminderOptions
): Promise<ReminderPlanResult | null> => {
  const reminderCount = Math.max(options.reminderCount ?? 8, 1);
  const now = new Date();
  const { wake, sleep } = resolveDayAnchors(options.wakeTime, options.sleepTime, now);

  const plan = planNextReminder(
    {
      targetMl: options.targetMl,
      consumedMl: options.consumedMl,
      wake,
      sleep,
      now,
      reminderCount,
    },
    options.userSnoozeMin
  );

  console.log('Scheduling next reminder with plan:', {
    nextAt: plan.nextAt?.toISOString(),
    suggestMl: plan.suggestMl,
    pace: plan.pace.toFixed(2),
    paceCategory: plan.paceCategory,
    remainingMl: plan.remainMl,
    remainingMinutes: plan.remainMin,
  });

  if (!plan.nextAt) {
    console.log('No further reminders scheduled for today (target reached or day ended).');
    return plan;
  }

  const { title, body } = buildNotificationMessage(plan);

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
      data: {
        suggestMl: plan.suggestMl,
        nextAt: plan.nextAt.toISOString(),
        paceCategory: plan.paceCategory,
      },
    },
    trigger: {
      type: SchedulableTriggerInputTypes.DATE,
      date: plan.nextAt,
      channelId: NOTIFICATION_CHANNEL_ID,
    },
  });

  console.log('Next reminder scheduled successfully at', plan.nextAt.toLocaleString());

  return plan;
};

export const scheduleNextReminder = async (
  options: ScheduleNextReminderOptions
): Promise<ReminderPlanResult | null> => {
  const hasPermission = await ensureNotificationsEnabled();
  if (!hasPermission) {
    return null;
  }

  try {
    return await scheduleNextReminderInternal(options);
  } catch (error) {
    console.warn('Failed to schedule next reminder:', error);
    return null;
  }
};

const resolveDayAnchors = (wakeTime: string, sleepTime: string, reference: Date) => {
  const wake = parseTimeToDate(wakeTime, reference);
  let sleep = parseTimeToDate(sleepTime, wake <= reference ? wake : reference);

  if (sleep <= wake) {
    sleep.setDate(sleep.getDate() + 1);
  }

  return { wake, sleep };
};

const buildNotificationMessage = (plan: ReminderPlanResult) => {
  const intervalText = formatInterval(plan.nextIntervalMin);
  const nextTimeText = plan.nextAt ? formatTime(plan.nextAt) : '';

  let prefix = '';
  switch (plan.paceCategory) {
    case 'behind':
      prefix = 'ちょっとペース遅め。';
      break;
    case 'ahead':
      prefix = '今のペースなら少しゆっくりでOK。';
      break;
    default:
      prefix = 'いいペースです。';
  }

  const suggestion = `いま ${plan.suggestMl}ml いきますか？`;
  const nextInfo = `次は${intervalText}${nextTimeText ? `（${nextTimeText}頃）` : ''}を予定しています。`;

  return {
    title: '💧 水分補給マインダー',
    body: `${prefix}${suggestion} ${nextInfo}`.trim(),
  };
};

const formatInterval = (minutes: number) => {
  const rounded = Math.max(1, Math.round(minutes));
  if (rounded < 60) {
    return `${rounded}分後`;
  }

  const hours = Math.floor(rounded / 60);
  const mins = rounded % 60;

  if (mins === 0) {
    return `${hours}時間後`;
  }

  return `${hours}時間${mins}分後`;
};

const formatTime = (date: Date) => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};
