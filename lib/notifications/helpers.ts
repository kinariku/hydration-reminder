export const waitFor = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

export const parseTimeToDate = (time: string, reference: Date): Date => {
  const [hourStr, minuteStr] = time.split(':');
  const hours = Number.parseInt(hourStr ?? '0', 10);
  const minutes = Number.parseInt(minuteStr ?? '0', 10);
  const date = new Date(reference);
  date.setHours(hours, minutes, 0, 0);
  return date;
};
