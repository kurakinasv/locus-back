import { toZonedTime } from 'date-fns-tz';

/**
 * @param date date with the relevant UTC time (eg., `toISOString()`)
 */
export const toUTC = (date: string | Date): Date => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const utcDate = toZonedTime(date, timezone);
  console.log('toUTC:', date, utcDate, utcDate.toISOString());

  return utcDate;
};

/** Date stores in `2024-05-01T23:59:59.999Z` format */
export const setEndOfDay = (date: string): Date => {
  const endOfDayUTC = new Date(new Date(date).setUTCHours(23, 59, 59, 999));
  console.log('setEndOfDay', date, endOfDayUTC, toUTC(endOfDayUTC));

  return endOfDayUTC;
};

/** Date stores in `2024-05-01T00:00:00.0Z` format */
export const setStartOfDay = (date: string): Date => {
  const startOfDayUTC = new Date(new Date(date).setUTCHours(0, 0, 0, 0));
  console.log('setStartOfDay', date, startOfDayUTC, toUTC(startOfDayUTC));

  return startOfDayUTC;
};
