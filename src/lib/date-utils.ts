import { format, isToday as fnsIsToday, isThisWeek as fnsIsThisWeek, parseISO, addDays, startOfWeek, endOfWeek, isValid, formatISO } from 'date-fns';

export const formatDatePretty = (dateString?: string, dateFormat: string = 'MMM dd, yyyy'): string => {
  if (!dateString) return 'No due date';
  try {
    const parsedDate = parseISO(dateString);
    if (!isValid(parsedDate)) return "Invalid date";
    return format(parsedDate, dateFormat);
  } catch (error) {
    // console.error("Error formatting date:", dateString, error);
    return "Invalid date";
  }
};

export const formatDateYyyyMmDd = (date?: Date | string): string | undefined => {
  if (!date) return undefined;
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(d)) return undefined;
    return format(d, 'yyyy-MM-dd');
  } catch {
    return undefined;
  }
}

export const isDateToday = (dateString?: string): boolean => {
  if (!dateString) return false;
  try {
    const parsedDate = parseISO(dateString);
    return isValid(parsedDate) && fnsIsToday(parsedDate);
  } catch { return false; }
};

export const isDateThisWeek = (dateString?: string): boolean => {
  if (!dateString) return false;
  try {
    const parsedDate = parseISO(dateString);
    // Ensure week starts on Monday for consistency.
    return isValid(parsedDate) && fnsIsThisWeek(parsedDate, { weekStartsOn: 1 });
  } catch { return false; }
};

export const isDateUpcoming = (dateString?: string): boolean => {
  if (!dateString) return false;
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return false;

    const today = new Date();
    today.setHours(0,0,0,0); 
    
    // A date is upcoming if it's after the end of this week
    // And not today, and not this week (already covered by other functions if needed)
    const endOfThisCurrentWeek = endOfWeek(today, { weekStartsOn: 1 });
    return date > endOfThisCurrentWeek;

  } catch { return false; }
};

export const getTodayDateString = (): string => {
    return format(new Date(), 'yyyy-MM-dd');
};

export const getTomorrowDateString = (): string => {
    return format(addDays(new Date(), 1), 'yyyy-MM-dd');
};

export const getNextWeekDateString = (): string => {
    return format(addDays(new Date(), 7), 'yyyy-MM-dd');
};

export const getCurrentIsoDateTime = (): string => {
  return formatISO(new Date());
}