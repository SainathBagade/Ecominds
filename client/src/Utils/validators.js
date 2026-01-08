// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
export const validatePassword = (password) => {
  // At least 6 characters
  if (password.length < 6) {
    return {
      isValid: false,
      message: 'Password must be at least 6 characters long'
    };
  }
  
  return {
    isValid: true,
    message: 'Password is valid'
  };
};

// Strong password validation
export const validateStrongPassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const minLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  
  if (!minLength) {
    return {
      isValid: false,
      message: 'Password must be at least 8 characters long'
    };
  }
  
  if (!hasUppercase || !hasLowercase) {
    return {
      isValid: false,
      message: 'Password must contain uppercase and lowercase letters'
    };
  }
  
  if (!hasNumber) {
    return {
      isValid: false,
      message: 'Password must contain at least one number'
    };
  }
  
  return {
    isValid: true,
    message: 'Password is strong'
  };
};

// Name validation
export const validateName = (name) => {
  if (!name || name.trim().length < 2) {
    return {
      isValid: false,
      message: 'Name must be at least 2 characters long'
    };
  }
  
  if (name.trim().length > 50) {
    return {
      isValid: false,
      message: 'Name must be less than 50 characters'
    };
  }
  
  return {
    isValid: true,
    message: 'Name is valid'
  };
};

// Phone validation (optional)
export const validatePhone = (phone) => {
  if (!phone) return { isValid: true, message: 'Phone is optional' };
  
  const phoneRegex = /^[0-9]{10}$/;
  return {
    isValid: phoneRegex.test(phone.replace(/\D/g, '')),
    message: phoneRegex.test(phone.replace(/\D/g, '')) 
      ? 'Phone is valid' 
      : 'Phone must be 10 digits'
  };
};

// URL validation
export const validateURL = (url) => {
  try {
    new URL(url);
    return { isValid: true, message: 'URL is valid' };
  } catch (error) {
    return { isValid: false, message: 'Invalid URL format' };
  }
};

// Grade validation
export const validateGrade = (grade) => {
  const gradeNum = parseInt(grade);
  if (isNaN(gradeNum) || gradeNum < 1 || gradeNum > 10) {
    return {
      isValid: false,
      message: 'Grade must be between 1 and 10'
    };
  }
  
  return {
    isValid: true,
    message: 'Grade is valid'
  };
};

// File validation
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
  } = options;
  
  if (!file) {
    return {
      isValid: false,
      message: 'No file selected'
    };
  }
  
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      message: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`
    };
  }
  
  // Check file size
  if (file.size > maxSize) {
    return {
      isValid: false,
      message: `File size must be less than ${(maxSize / (1024 * 1024)).toFixed(0)}MB`
    };
  }
  
  return {
    isValid: true,
    message: 'File is valid'
  };
};

// Quiz answer validation
export const validateQuizAnswers = (answers, questions) => {
  if (!answers || answers.length === 0) {
    return {
      isValid: false,
      message: 'Please answer all questions'
    };
  }
  
  if (answers.length !== questions.length) {
    return {
      isValid: false,
      message: 'Please answer all questions'
    };
  }
  
  // Check if all answers are provided
  const unanswered = answers.filter(a => a.answer === null || a.answer === undefined);
  if (unanswered.length > 0) {
    return {
      isValid: false,
      message: `${unanswered.length} question(s) not answered`
    };
  }
  
  return {
    isValid: true,
    message: 'All answers provided'
  };
};

// Form validation helper
export const validateForm = (formData, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const rule = rules[field];
    const value = formData[field];
    
    // Required field
    if (rule.required && (!value || value.toString().trim() === '')) {
      errors[field] = `${field} is required`;
      return;
    }
    
    // Custom validation function
    if (rule.validate && typeof rule.validate === 'function') {
      const result = rule.validate(value);
      if (!result.isValid) {
        errors[field] = result.message;
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Sanitize input (basic XSS prevention)
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};