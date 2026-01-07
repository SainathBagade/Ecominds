/**
 * Date Helper Utility
 * Handles date formatting, timezone conversions, and date calculations
 */

/**
 * Format date to readable string
 * @param {Date|string} date - Date to format
 * @param {string} format - Format type
 * @returns {string} - Formatted date
 */
const formatDate = (date, format = 'full') => {
  const d = new Date(date);
  
  if (isNaN(d.getTime())) {
    return 'Invalid Date';
  }

  const options = {
    full: { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    },
    short: { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    },
    date: { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    },
    time: { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    },
    relative: null, // Special case
  };

  if (format === 'relative') {
    return getRelativeTime(d);
  }

  return d.toLocaleString('en-US', options[format] || options.full);
};

/**
 * Get relative time (e.g., "2 hours ago", "just now")
 * @param {Date|string} date - Date to compare
 * @returns {string} - Relative time string
 */
const getRelativeTime = (date) => {
  const d = new Date(date);
  const now = new Date();
  const seconds = Math.floor((now - d) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)} weeks ago`;
  if (seconds < 31536000) return `${Math.floor(seconds / 2592000)} months ago`;
  return `${Math.floor(seconds / 31536000)} years ago`;
};

/**
 * Convert date to specific timezone
 * @param {Date|string} date - Date to convert
 * @param {string} timezone - Target timezone (e.g., 'Asia/Kolkata')
 * @returns {string} - Formatted date in timezone
 */
const convertToTimezone = (date, timezone = 'UTC') => {
  const d = new Date(date);
  
  try {
    return d.toLocaleString('en-US', { 
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch (error) {
    return d.toISOString();
  }
};

/**
 * Get start of day
 * @param {Date|string} date - Date
 * @returns {Date} - Start of day
 */
const getStartOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Get end of day
 * @param {Date|string} date - Date
 * @returns {Date} - End of day
 */
const getEndOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

/**
 * Check if date is today
 * @param {Date|string} date - Date to check
 * @returns {boolean} - True if today
 */
const isToday = (date) => {
  const d = new Date(date);
  const today = new Date();
  return d.toDateString() === today.toDateString();
};

/**
 * Check if date is yesterday
 * @param {Date|string} date - Date to check
 * @returns {boolean} - True if yesterday
 */
const isYesterday = (date) => {
  const d = new Date(date);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return d.toDateString() === yesterday.toDateString();
};

/**
 * Calculate difference between two dates
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date
 * @param {string} unit - Unit (days, hours, minutes, seconds)
 * @returns {number} - Difference in specified unit
 */
const dateDifference = (date1, date2, unit = 'days') => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diff = Math.abs(d2 - d1);

  const units = {
    seconds: 1000,
    minutes: 60 * 1000,
    hours: 60 * 60 * 1000,
    days: 24 * 60 * 60 * 1000,
    weeks: 7 * 24 * 60 * 60 * 1000,
  };

  return Math.floor(diff / (units[unit] || units.days));
};

/**
 * Add days to date
 * @param {Date|string} date - Starting date
 * @param {number} days - Days to add
 * @returns {Date} - New date
 */
const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

/**
 * Add hours to date
 * @param {Date|string} date - Starting date
 * @param {number} hours - Hours to add
 * @returns {Date} - New date
 */
const addHours = (date, hours) => {
  const d = new Date(date);
  d.setHours(d.getHours() + hours);
  return d;
};

/**
 * Check if date is in range
 * @param {Date|string} date - Date to check
 * @param {Date|string} startDate - Range start
 * @param {Date|string} endDate - Range end
 * @returns {boolean} - True if in range
 */
const isDateInRange = (date, startDate, endDate) => {
  const d = new Date(date);
  const start = new Date(startDate);
  const end = new Date(endDate);
  return d >= start && d <= end;
};

/**
 * Format duration in seconds to readable string
 * @param {number} seconds - Duration in seconds
 * @returns {string} - Formatted duration
 */
const formatDuration = (seconds) => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  }
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${mins}m`;
};

/**
 * Get date range for filter (today, week, month, year)
 * @param {string} range - Range type
 * @returns {Object} - Start and end dates
 */
const getDateRange = (range = 'today') => {
  const now = new Date();
  let startDate, endDate;

  switch (range) {
    case 'today':
      startDate = getStartOfDay(now);
      endDate = getEndOfDay(now);
      break;
    case 'week':
      startDate = new Date(now.setDate(now.getDate() - 7));
      endDate = new Date();
      break;
    case 'month':
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      endDate = new Date();
      break;
    case 'year':
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      endDate = new Date();
      break;
    default:
      startDate = getStartOfDay(now);
      endDate = getEndOfDay(now);
  }

  return { startDate, endDate };
};

/**
 * Check if user's last login was yesterday (for streak)
 * @param {Date|string} lastLogin - Last login date
 * @returns {boolean} - True if yesterday
 */
const wasYesterday = (lastLogin) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const lastLoginDate = new Date(lastLogin);
  
  return lastLoginDate.toDateString() === yesterday.toDateString();
};

/**
 * Get ISO string in local timezone
 * @param {Date|string} date - Date
 * @returns {string} - ISO string
 */
const toISOLocal = (date = new Date()) => {
  const d = new Date(date);
  const offset = d.getTimezoneOffset();
  const localDate = new Date(d.getTime() - offset * 60 * 1000);
  return localDate.toISOString().split('T')[0];
};

module.exports = {
  formatDate,
  getRelativeTime,
  convertToTimezone,
  getStartOfDay,
  getEndOfDay,
  isToday,
  isYesterday,
  wasYesterday,
  dateDifference,
  addDays,
  addHours,
  isDateInRange,
  formatDuration,
  getDateRange,
  toISOLocal,
};