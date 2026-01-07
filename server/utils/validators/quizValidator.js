/**
 * Quiz Validator
 * Validation rules for quiz-related operations
 */

/**
 * Validate quiz creation data
 */
const validateQuizCreate = (data) => {
  const errors = [];
  const { title, lesson, timeLimit, passingScore, attemptsAllowed } = data;

  // Title validation
  if (!title || title.trim().length === 0) {
    errors.push({ field: 'title', message: 'Quiz title is required' });
  } else if (title.trim().length < 3) {
    errors.push({ field: 'title', message: 'Quiz title must be at least 3 characters' });
  } else if (title.trim().length > 200) {
    errors.push({ field: 'title', message: 'Quiz title must not exceed 200 characters' });
  }

  // Lesson validation
  if (!lesson) {
    errors.push({ field: 'lesson', message: 'Lesson ID is required' });
  } else if (!/^[0-9a-fA-F]{24}$/.test(lesson)) {
    errors.push({ field: 'lesson', message: 'Invalid lesson ID format' });
  }

  // Time limit validation
  if (timeLimit !== undefined) {
    if (typeof timeLimit !== 'number' || timeLimit < 60) {
      errors.push({ field: 'timeLimit', message: 'Time limit must be at least 60 seconds' });
    } else if (timeLimit > 7200) {
      errors.push({ field: 'timeLimit', message: 'Time limit must not exceed 7200 seconds (2 hours)' });
    }
  }

  // Passing score validation
  if (passingScore !== undefined) {
    if (typeof passingScore !== 'number' || passingScore < 0 || passingScore > 100) {
      errors.push({ field: 'passingScore', message: 'Passing score must be between 0 and 100' });
    }
  }

  // Attempts allowed validation
  if (attemptsAllowed !== undefined) {
    if (typeof attemptsAllowed !== 'number' || attemptsAllowed < 1 || attemptsAllowed > 10) {
      errors.push({ field: 'attemptsAllowed', message: 'Attempts allowed must be between 1 and 10' });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate question creation data
 */
const validateQuestionCreate = (data) => {
  const errors = [];
  const { quiz, text, type, options, correctAnswer, points } = data;

  // Quiz validation
  if (!quiz) {
    errors.push({ field: 'quiz', message: 'Quiz ID is required' });
  } else if (!/^[0-9a-fA-F]{24}$/.test(quiz)) {
    errors.push({ field: 'quiz', message: 'Invalid quiz ID format' });
  }

  // Text validation
  if (!text || text.trim().length === 0) {
    errors.push({ field: 'text', message: 'Question text is required' });
  } else if (text.trim().length < 5) {
    errors.push({ field: 'text', message: 'Question text must be at least 5 characters' });
  } else if (text.trim().length > 500) {
    errors.push({ field: 'text', message: 'Question text must not exceed 500 characters' });
  }

  // Type validation
  const validTypes = ['multiple-choice', 'true-false', 'short-answer'];
  if (!type) {
    errors.push({ field: 'type', message: 'Question type is required' });
  } else if (!validTypes.includes(type)) {
    errors.push({ field: 'type', message: `Question type must be one of: ${validTypes.join(', ')}` });
  }

  // Options validation
  if (type === 'multiple-choice' || type === 'true-false') {
    if (!options || !Array.isArray(options)) {
      errors.push({ field: 'options', message: 'Options must be an array' });
    } else if (options.length < 2) {
      errors.push({ field: 'options', message: 'At least 2 options are required' });
    } else {
      // Validate each option
      options.forEach((option, index) => {
        if (!option.text || option.text.trim().length === 0) {
          errors.push({ field: `options[${index}].text`, message: 'Option text is required' });
        }
      });

      // Check for duplicate options
      const optionTexts = options.map(o => o.text?.trim().toLowerCase());
      const duplicates = optionTexts.filter((item, index) => optionTexts.indexOf(item) !== index);
      if (duplicates.length > 0) {
        errors.push({ field: 'options', message: 'Duplicate options are not allowed' });
      }
    }
  }

  // Correct answer validation
  if (!correctAnswer || correctAnswer.trim().length === 0) {
    errors.push({ field: 'correctAnswer', message: 'Correct answer is required' });
  }

  // Points validation
  if (points !== undefined) {
    if (typeof points !== 'number' || points < 1 || points > 100) {
      errors.push({ field: 'points', message: 'Points must be between 1 and 100' });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate quiz submission data
 */
const validateQuizSubmission = (data) => {
  const errors = [];
  const { submissionId, answers } = data;

  // Submission ID validation
  if (!submissionId) {
    errors.push({ field: 'submissionId', message: 'Submission ID is required' });
  } else if (!/^[0-9a-fA-F]{24}$/.test(submissionId)) {
    errors.push({ field: 'submissionId', message: 'Invalid submission ID format' });
  }

  // Answers validation
  if (!answers || !Array.isArray(answers)) {
    errors.push({ field: 'answers', message: 'Answers must be an array' });
  } else if (answers.length === 0) {
    errors.push({ field: 'answers', message: 'At least one answer is required' });
  } else {
    // Validate each answer
    answers.forEach((answer, index) => {
      if (!answer.questionId) {
        errors.push({ field: `answers[${index}].questionId`, message: 'Question ID is required' });
      } else if (!/^[0-9a-fA-F]{24}$/.test(answer.questionId)) {
        errors.push({ field: `answers[${index}].questionId`, message: 'Invalid question ID format' });
      }

      if (answer.selectedAnswer === undefined || answer.selectedAnswer === null || answer.selectedAnswer === '') {
        errors.push({ field: `answers[${index}].selectedAnswer`, message: 'Selected answer is required' });
      }

      if (answer.timeSpent !== undefined && (typeof answer.timeSpent !== 'number' || answer.timeSpent < 0)) {
        errors.push({ field: `answers[${index}].timeSpent`, message: 'Time spent must be a positive number' });
      }
    });

    // Check for duplicate question IDs
    const questionIds = answers.map(a => a.questionId);
    const duplicates = questionIds.filter((item, index) => questionIds.indexOf(item) !== index);
    if (duplicates.length > 0) {
      errors.push({ field: 'answers', message: 'Duplicate question answers are not allowed' });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate start quiz attempt data
 */
const validateStartQuiz = (data) => {
  const errors = [];
  const { userId, quizId } = data;

  if (!userId) {
    errors.push({ field: 'userId', message: 'User ID is required' });
  } else if (!/^[0-9a-fA-F]{24}$/.test(userId)) {
    errors.push({ field: 'userId', message: 'Invalid user ID format' });
  }

  if (!quizId) {
    errors.push({ field: 'quizId', message: 'Quiz ID is required' });
  } else if (!/^[0-9a-fA-F]{24}$/.test(quizId)) {
    errors.push({ field: 'quizId', message: 'Invalid quiz ID format' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate quiz update data
 */
const validateQuizUpdate = (data) => {
  const errors = [];
  const { title, timeLimit, passingScore, attemptsAllowed } = data;

  if (title !== undefined) {
    if (title.trim().length < 3) {
      errors.push({ field: 'title', message: 'Quiz title must be at least 3 characters' });
    } else if (title.trim().length > 200) {
      errors.push({ field: 'title', message: 'Quiz title must not exceed 200 characters' });
    }
  }

  if (timeLimit !== undefined) {
    if (typeof timeLimit !== 'number' || timeLimit < 60) {
      errors.push({ field: 'timeLimit', message: 'Time limit must be at least 60 seconds' });
    } else if (timeLimit > 7200) {
      errors.push({ field: 'timeLimit', message: 'Time limit must not exceed 7200 seconds' });
    }
  }

  if (passingScore !== undefined) {
    if (typeof passingScore !== 'number' || passingScore < 0 || passingScore > 100) {
      errors.push({ field: 'passingScore', message: 'Passing score must be between 0 and 100' });
    }
  }

  if (attemptsAllowed !== undefined) {
    if (typeof attemptsAllowed !== 'number' || attemptsAllowed < 1 || attemptsAllowed > 10) {
      errors.push({ field: 'attemptsAllowed', message: 'Attempts allowed must be between 1 and 10' });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  validateQuizCreate,
  validateQuestionCreate,
  validateQuizSubmission,
  validateStartQuiz,
  validateQuizUpdate,
};