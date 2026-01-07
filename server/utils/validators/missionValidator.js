/**
 * Mission Validator
 * Validation rules for mission-related operations
 */

/**
 * Validate mission creation data
 */
const validateMissionCreate = (data) => {
  const errors = [];
  const { 
    title, 
    description, 
    type, 
    category, 
    points, 
    requirements,
    deadline,
    maxParticipants 
  } = data;

  // Title validation
  if (!title || title.trim().length === 0) {
    errors.push({ field: 'title', message: 'Mission title is required' });
  } else if (title.trim().length < 5) {
    errors.push({ field: 'title', message: 'Mission title must be at least 5 characters' });
  } else if (title.trim().length > 150) {
    errors.push({ field: 'title', message: 'Mission title must not exceed 150 characters' });
  }

  // Description validation
  if (!description || description.trim().length === 0) {
    errors.push({ field: 'description', message: 'Mission description is required' });
  } else if (description.length > 1000) {
    errors.push({ field: 'description', message: 'Description must not exceed 1000 characters' });
  }

  // Type validation
  const validTypes = [
    'eco_action',
    'learning',
    'community',
    'recycling',
    'conservation',
    'awareness',
    'research',
    'volunteer'
  ];
  if (type && !validTypes.includes(type)) {
    errors.push({ field: 'type', message: `Type must be one of: ${validTypes.join(', ')}` });
  }

  // Category validation
  const validCategories = [
    'water',
    'energy',
    'waste',
    'biodiversity',
    'air',
    'climate',
    'pollution',
    'sustainability'
  ];
  if (category && !validCategories.includes(category)) {
    errors.push({ field: 'category', message: `Category must be one of: ${validCategories.join(', ')}` });
  }

/**
 * Mission Validator
 * Validation rules for mission-related operations
 */

/**
 * Validate mission creation data
 */
const validateMissionCreate = (data) => {
  const errors = [];
  const { 
    title, 
    description, 
    type, 
    category, 
    points, 
    requirements,
    deadline,
    maxParticipants 
  } = data;

  // Title validation
  if (!title || title.trim().length === 0) {
    errors.push({ field: 'title', message: 'Mission title is required' });
  } else if (title.trim().length < 5) {
    errors.push({ field: 'title', message: 'Mission title must be at least 5 characters' });
  } else if (title.trim().length > 150) {
    errors.push({ field: 'title', message: 'Mission title must not exceed 150 characters' });
  }

  // Description validation
  if (!description || description.trim().length === 0) {
    errors.push({ field: 'description', message: 'Mission description is required' });
  } else if (description.length > 1000) {
    errors.push({ field: 'description', message: 'Description must not exceed 1000 characters' });
  }

  // Type validation
  const validTypes = [
    'eco_action',
    'learning',
    'community',
    'recycling',
    'conservation',
    'awareness',
    'research',
    'volunteer'
  ];
  if (type && !validTypes.includes(type)) {
    errors.push({ field: 'type', message: `Type must be one of: ${validTypes.join(', ')}` });
  }

  // Category validation
  const validCategories = [
    'water',
    'energy',
    'waste',
    'biodiversity',
    'air',
    'climate',
    'pollution',
    'sustainability'
  ];
  if (category && !validCategories.includes(category)) {
    errors.push({ field: 'category', message: `Category must be one of: ${validCategories.join(', ')}` });
  }

  // Points validation
  if (points !== undefined) {
    if (typeof points !== 'number' || points < 0) {
      errors.push({ field: 'points', message: 'Points must be a positive number' });
    } else if (points > 5000) {
      errors.push({ field: 'points', message: 'Points must not exceed 5000' });
    }
  }

  // Requirements validation
  if (requirements && !Array.isArray(requirements)) {
    errors.push({ field: 'requirements', message: 'Requirements must be an array' });
  } else if (requirements && requirements.length === 0) {
    errors.push({ field: 'requirements', message: 'At least one requirement is needed' });
  }

  // Deadline validation
  if (deadline) {
    if (isNaN(Date.parse(deadline))) {
      errors.push({ field: 'deadline', message: 'Invalid deadline date format' });
    } else {
      const deadlineDate = new Date(deadline);
      const now = new Date();
      if (deadlineDate <= now) {
        errors.push({ field: 'deadline', message: 'Deadline must be in the future' });
      }
    }
  }

  // Max participants validation
  if (maxParticipants !== undefined) {
    if (typeof maxParticipants !== 'number' || maxParticipants < 1) {
      errors.push({ field: 'maxParticipants', message: 'Max participants must be at least 1' });
    } else if (maxParticipants > 10000) {
      errors.push({ field: 'maxParticipants', message: 'Max participants must not exceed 10000' });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate mission enrollment
 */
const validateMissionEnroll = (data) => {
  const errors = [];
  const { userId, missionId } = data;

  if (!userId) {
    errors.push({ field: 'userId', message: 'User ID is required' });
  } else if (!/^[0-9a-fA-F]{24}$/.test(userId)) {
    errors.push({ field: 'userId', message: 'Invalid user ID format' });
  }

  if (!missionId) {
    errors.push({ field: 'missionId', message: 'Mission ID is required' });
  } else if (!/^[0-9a-fA-F]{24}$/.test(missionId)) {
    errors.push({ field: 'missionId', message: 'Invalid mission ID format' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate mission progress submission
 */
const validateMissionProgress = (data) => {
  const errors = [];
  const { userId, missionId, evidence, notes, completionPercentage } = data;

  if (!userId) {
    errors.push({ field: 'userId', message: 'User ID is required' });
  }

  if (!missionId) {
    errors.push({ field: 'missionId', message: 'Mission ID is required' });
  }

  if (completionPercentage !== undefined) {
    if (typeof completionPercentage !== 'number' || completionPercentage < 0 || completionPercentage > 100) {
      errors.push({ field: 'completionPercentage', message: 'Completion percentage must be between 0 and 100' });
    }
  }

  if (evidence && typeof evidence !== 'string') {
    errors.push({ field: 'evidence', message: 'Evidence must be a string (URL or description)' });
  }

  if (notes && notes.length > 500) {
    errors.push({ field: 'notes', message: 'Notes must not exceed 500 characters' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate mission completion
 */
const validateMissionComplete = (data) => {
  const errors = [];
  const { userId, missionId, proof, verificationStatus } = data;

  if (!userId) {
    errors.push({ field: 'userId', message: 'User ID is required' });
  }

  if (!missionId) {
    errors.push({ field: 'missionId', message: 'Mission ID is required' });
  }

  if (!proof || proof.trim().length === 0) {
    errors.push({ field: 'proof', message: 'Proof of completion is required' });
  } else if (proof.length > 1000) {
    errors.push({ field: 'proof', message: 'Proof must not exceed 1000 characters' });
  }

  if (verificationStatus) {
    const validStatuses = ['pending', 'approved', 'rejected'];
    if (!validStatuses.includes(verificationStatus)) {
      errors.push({ field: 'verificationStatus', message: `Status must be one of: ${validStatuses.join(', ')}` });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate mission update
 */
const validateMissionUpdate = (data) => {
  const errors = [];
  const { title, points, deadline, maxParticipants } = data;

  if (title !== undefined) {
    if (title.trim().length < 5) {
      errors.push({ field: 'title', message: 'Mission title must be at least 5 characters' });
    } else if (title.trim().length > 150) {
      errors.push({ field: 'title', message: 'Mission title must not exceed 150 characters' });
    }
  }

  if (points !== undefined) {
    if (typeof points !== 'number' || points < 0 || points > 5000) {
      errors.push({ field: 'points', message: 'Points must be between 0 and 5000' });
    }
  }

  if (deadline && isNaN(Date.parse(deadline))) {
    errors.push({ field: 'deadline', message: 'Invalid deadline date format' });
  }

  if (maxParticipants !== undefined) {
    if (typeof maxParticipants !== 'number' || maxParticipants < 1 || maxParticipants > 10000) {
      errors.push({ field: 'maxParticipants', message: 'Max participants must be between 1 and 10000' });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate mission verification
 */
const validateMissionVerification = (data) => {
  const errors = [];
  const { missionId, userId, status, reviewerNotes } = data;

  if (!missionId) {
    errors.push({ field: 'missionId', message: 'Mission ID is required' });
  }

  if (!userId) {
    errors.push({ field: 'userId', message: 'User ID is required' });
  }

  const validStatuses = ['approved', 'rejected'];
  if (!status) {
    errors.push({ field: 'status', message: 'Verification status is required' });
  } else if (!validStatuses.includes(status)) {
    errors.push({ field: 'status', message: `Status must be one of: ${validStatuses.join(', ')}` });
  }

  if (status === 'rejected' && (!reviewerNotes || reviewerNotes.trim().length === 0)) {
    errors.push({ field: 'reviewerNotes', message: 'Reviewer notes are required when rejecting' });
  }

  if (reviewerNotes && reviewerNotes.length > 500) {
    errors.push({ field: 'reviewerNotes', message: 'Reviewer notes must not exceed 500 characters' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  validateMissionCreate,
  validateMissionEnroll,
  validateMissionProgress,
  validateMissionComplete,
  validateMissionUpdate,
  validateMissionVerification,
};