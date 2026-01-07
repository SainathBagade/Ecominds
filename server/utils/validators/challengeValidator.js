/**
 * Challenge Validator
 * Validation rules for challenge-related operations
 */

/**
 * Validate challenge creation data
 */
const validateChallengeCreate = (data) => {
  const errors = [];
  const { 
    title, 
    description, 
    type, 
    difficulty, 
    points, 
    duration, 
    startDate, 
    endDate,
    target 
  } = data;

  // Title validation
  if (!title || title.trim().length === 0) {
    errors.push({ field: 'title', message: 'Challenge title is required' });
  } else if (title.trim().length < 3) {
    errors.push({ field: 'title', message: 'Challenge title must be at least 3 characters' });
  } else if (title.trim().length > 100) {
    errors.push({ field: 'title', message: 'Challenge title must not exceed 100 characters' });
  }

  // Description validation
  if (description && description.length > 500) {
    errors.push({ field: 'description', message: 'Description must not exceed 500 characters' });
  }

  // Type validation
  const validTypes = ['daily', 'weekly', 'monthly', 'special', 'event'];
  if (type && !validTypes.includes(type)) {
    errors.push({ field: 'type', message: `Type must be one of: ${validTypes.join(', ')}` });
  }

  // Difficulty validation
  const validDifficulties = ['easy', 'medium', 'hard', 'expert'];
  if (difficulty && !validDifficulties.includes(difficulty)) {
    errors.push({ field: 'difficulty', message: `Difficulty must be one of: ${validDifficulties.join(', ')}` });
  }

  // Points validation
  if (points !== undefined) {
    if (typeof points !== 'number' || points < 0) {
      errors.push({ field: 'points', message: 'Points must be a positive number' });
    } else if (points > 10000) {
      errors.push({ field: 'points', message: 'Points must not exceed 10000' });
    }
  }

  // Duration validation (in days)
  if (duration !== undefined) {
    if (typeof duration !== 'number' || duration < 1 || duration > 365) {
      errors.push({ field: 'duration', message: 'Duration must be between 1 and 365 days' });
    }
  }

  // Date validation
  if (startDate && isNaN(Date.parse(startDate))) {
    errors.push({ field: 'startDate', message: 'Invalid start date format' });
  }

  if (endDate && isNaN(Date.parse(endDate))) {
    errors.push({ field: 'endDate', message: 'Invalid end date format' });
  }

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      errors.push({ field: 'endDate', message: 'End date must be after start date' });
    }
  }

  // Target validation
  if (target !== undefined) {
    if (typeof target !== 'number' || target < 1) {
      errors.push({ field: 'target', message: 'Target must be a positive number' });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate challenge participation
 */
const validateChallengeJoin = (data) => {
  const errors = [];
  const { userId, challengeId } = data;

  if (!userId) {
    errors.push({ field: 'userId', message: 'User ID is required' });
  } else if (!/^[0-9a-fA-F]{24}$/.test(userId)) {
    errors.push({ field: 'userId', message: 'Invalid user ID format' });
  }

  if (!challengeId) {
    errors.push({ field: 'challengeId', message: 'Challenge ID is required' });
  } else if (!/^[0-9a-fA-F]{24}$/.test(challengeId)) {
    errors.push({ field: 'challengeId', message: 'Invalid challenge ID format' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate challenge progress update
 */
const validateChallengeProgress = (data) => {
  const errors = [];
  const { userId, challengeId, progress, currentValue } = data;

  if (!userId) {
    errors.push({ field: 'userId', message: 'User ID is required' });
  }

  if (!challengeId) {
    errors.push({ field: 'challengeId', message: 'Challenge ID is required' });
  }

  if (progress !== undefined) {
    if (typeof progress !== 'number' || progress < 0 || progress > 100) {
      errors.push({ field: 'progress', message: 'Progress must be between 0 and 100' });
    }
  }

  if (currentValue !== undefined) {
    if (typeof currentValue !== 'number' || currentValue < 0) {
      errors.push({ field: 'currentValue', message: 'Current value must be a positive number' });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate challenge completion
 */
const validateChallengeComplete = (data) => {
  const errors = [];
  const { userId, challengeId, completedAt } = data;

  if (!userId) {
    errors.push({ field: 'userId', message: 'User ID is required' });
  }

  if (!challengeId) {
    errors.push({ field: 'challengeId', message: 'Challenge ID is required' });
  }

  if (completedAt && isNaN(Date.parse(completedAt))) {
    errors.push({ field: 'completedAt', message: 'Invalid completion date format' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate challenge update
 */
const validateChallengeUpdate = (data) => {
  const errors = [];
  const { title, points, difficulty, endDate } = data;

  if (title !== undefined) {
    if (title.trim().length < 3) {
      errors.push({ field: 'title', message: 'Challenge title must be at least 3 characters' });
    } else if (title.trim().length > 100) {
      errors.push({ field: 'title', message: 'Challenge title must not exceed 100 characters' });
    }
  }

  if (points !== undefined) {
    if (typeof points !== 'number' || points < 0 || points > 10000) {
      errors.push({ field: 'points', message: 'Points must be between 0 and 10000' });
    }
  }

  if (difficulty !== undefined) {
    const validDifficulties = ['easy', 'medium', 'hard', 'expert'];
    if (!validDifficulties.includes(difficulty)) {
      errors.push({ field: 'difficulty', message: `Difficulty must be one of: ${validDifficulties.join(', ')}` });
    }
  }

  if (endDate && isNaN(Date.parse(endDate))) {
    errors.push({ field: 'endDate', message: 'Invalid end date format' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  validateChallengeCreate,
  validateChallengeJoin,
  validateChallengeProgress,
  validateChallengeComplete,
  validateChallengeUpdate,
};