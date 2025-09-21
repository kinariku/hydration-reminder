export const getLocalDateString = (date: Date = new Date()): string => {
  const tzOffset = date.getTimezoneOffset() * 60000;
  const local = new Date(date.getTime() - tzOffset);
  return local.toISOString().split('T')[0];
};

export const isSameLocalDate = (a: Date | string, b: Date | string): boolean => {
  const dateA = typeof a === 'string' ? new Date(a) : a;
  const dateB = typeof b === 'string' ? new Date(b) : b;
  return getLocalDateString(dateA) === getLocalDateString(dateB);
};
