import { format, formatDistanceToNow, differenceInDays, differenceInHours, isToday, isYesterday, parseISO } from 'date-fns';

// Format date to readable string
export const formatDate = (date, formatStr = 'MMM dd, yyyy') => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

// Format date and time
export const formatDateTime = (date) => {
  return formatDate(date, 'MMM dd, yyyy HH:mm');
};

// Format time only
export const formatTime = (date) => {
  return formatDate(date, 'HH:mm');
};

// Get relative time (e.g., "2 hours ago")
export const timeAgo = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch (error) {
    console.error('Error calculating time ago:', error);
    return '';
  }
};

// Get days difference between two dates
export const getDaysDifference = (date1, date2 = new Date()) => {
  try {
    const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
    const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
    return differenceInDays(d2, d1);
  } catch (error) {
    console.error('Error calculating days difference:', error);
    return 0;
  }
};

// Get hours difference between two dates
export const getHoursDifference = (date1, date2 = new Date()) => {
  try {
    const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
    const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
    return differenceInHours(d2, d1);
  } catch (error) {
    console.error('Error calculating hours difference:', error);
    return 0;
  }
};

// Check if date is today
export const isDateToday = (date) => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isToday(dateObj);
  } catch (error) {
    console.error('Error checking if date is today:', error);
    return false;
  }
};

// Check if date is yesterday
export const isDateYesterday = (date) => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isYesterday(dateObj);
  } catch (error) {
    console.error('Error checking if date is yesterday:', error);
    return false;
  }
};

// Get smart date label (Today, Yesterday, or date)
export const getSmartDateLabel = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    if (isToday(dateObj)) {
      return 'Today';
    } else if (isYesterday(dateObj)) {
      return 'Yesterday';
    } else {
      return formatDate(dateObj, 'MMM dd, yyyy');
    }
  } catch (error) {
    console.error('Error getting smart date label:', error);
    return '';
  }
};

// Format duration (minutes to readable format)
export const formatDuration = (minutes) => {
  if (!minutes || minutes === 0) return '0 min';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins} min`;
  } else if (mins === 0) {
    return `${hours} hr`;
  } else {
    return `${hours} hr ${mins} min`;
  }
};

// Convert seconds to MM:SS format
export const formatTimeMMSS = (seconds) => {
  if (!seconds || seconds < 0) return '00:00';
  
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Get time remaining until a date
export const getTimeRemaining = (endDate) => {
  try {
    const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
    const now = new Date();
    const diff = end - now;
    
    if (diff <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        expired: true
      };
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return {
      days,
      hours,
      minutes,
      seconds,
      expired: false
    };
  } catch (error) {
    console.error('Error calculating time remaining:', error);
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      expired: true
    };
  }
};

// Format time remaining as string
export const formatTimeRemaining = (endDate) => {
  const remaining = getTimeRemaining(endDate);
  
  if (remaining.expired) {
    return 'Expired';
  }
  
  if (remaining.days > 0) {
    return `${remaining.days}d ${remaining.hours}h`;
  } else if (remaining.hours > 0) {
    return `${remaining.hours}h ${remaining.minutes}m`;
  } else if (remaining.minutes > 0) {
    return `${remaining.minutes}m ${remaining.seconds}s`;
  } else {
    return `${remaining.seconds}s`;
  }
};

// Get start and end of day
export const getStartOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const getEndOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

// Check if within time range
export const isWithinTimeRange = (date, startDate, endDate) => {
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
    const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
    
    return d >= start && d <= end;
  } catch (error) {
    console.error('Error checking time range:', error);
    return false;
  }
};