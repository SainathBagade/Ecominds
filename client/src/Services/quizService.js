
// // quizService.js
// import api from './api';

// class QuizService {
//   async getQuizById(quizId) {
//     try {
//       const response = await api.get(`/quizzes/${quizId}`);
//       return response.quiz;
//     } catch (error) {
//       throw new Error(error.message || 'Failed to fetch quiz');
//     }
//   }

//   async getQuizzesByModule(moduleId) {
//     try {
//       const response = await api.get(`/modules/${moduleId}/quizzes`);
//       return response.quizzes;
//     } catch (error) {
//       throw new Error(error.message || 'Failed to fetch quizzes');
//     }
//   }

//   async startQuiz(quizId, userId) {
//     try {
//       const response = await api.post(`/quizzes/${quizId}/start`, { userId });
//       return response.attempt;
//     } catch (error) {
//       throw new Error(error.message || 'Failed to start quiz');
//     }
//   }

//   async submitQuizAnswer(attemptId, questionId, answer) {
//     try {
//       const response = await api.post(`/quiz-attempts/${attemptId}/answers`, {
//         questionId,
//         answer
//       });
//       return response;
//     } catch (error) {
//       throw new Error(error.message || 'Failed to submit answer');
//     }
//   }

//   async completeQuiz(attemptId) {
//     try {
//       const response = await api.post(`/quiz-attempts/${attemptId}/complete`);
//       return response.result;
//     } catch (error) {
//       throw new Error(error.message || 'Failed to complete quiz');
//     }
//   }

//   async getQuizResults(attemptId) {
//     try {
//       const response = await api.get(`/quiz-attempts/${attemptId}/results`);
//       return response.results;
//     } catch (error) {
//       throw new Error(error.message || 'Failed to fetch quiz results');
//     }
//   }

//   async getUserQuizHistory(userId, limit = 20) {
//     try {
//       const response = await api.get(`/users/${userId}/quiz-history`, { limit });
//       return response.history;
//     } catch (error) {
//       throw new Error(error.message || 'Failed to fetch quiz history');
//     }
//   }

//   async getQuizLeaderboard(quizId, limit = 10) {
//     try {
//       const response = await api.get(`/quizzes/${quizId}/leaderboard`, { limit });
//       return response.leaderboard;
//     } catch (error) {
//       throw new Error(error.message || 'Failed to fetch quiz leaderboard');
//     }
//   }

//   calculateScore(correctAnswers, totalQuestions) {
//     if (totalQuestions === 0) return 0;
//     return Math.round((correctAnswers / totalQuestions) * 100);
//   }

//   determineGrade(score) {
//     if (score >= 90) return 'A';
//     if (score >= 80) return 'B';
//     if (score >= 70) return 'C';
//     if (score >= 60) return 'D';
//     return 'F';
//   }
// }

// export default new QuizService();

import api from './api';

const quizService = {
  // Get all quizzes
  getAllQuizzes: async (params = {}) => {
    try {
      const response = await api.get('/quizzes', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get quiz by ID
  getQuizById: async (quizId) => {
    try {
      const response = await api.get(`/quizzes/${quizId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Submit quiz answers
  submitQuiz: async (quizId, answers) => {
    try {
      const response = await api.post(`/quizzes/${quizId}/submit`, { answers });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get quiz results
  getQuizResults: async (submissionId) => {
    try {
      const response = await api.get(`/quizzes/results/${submissionId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user's quiz history
  getQuizHistory: async (params = {}) => {
    try {
      const response = await api.get('/quizzes/history', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get quiz by lesson
  getQuizByLesson: async (lessonId) => {
    try {
      const response = await api.get(`/quizzes/lesson/${lessonId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get quiz statistics
  getQuizStats: async () => {
    try {
      const response = await api.get('/quizzes/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Check if quiz can be retaken
  canRetakeQuiz: async (quizId) => {
    try {
      const response = await api.get(`/quizzes/${quizId}/can-retake`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user's best score for quiz
  getBestScore: async (quizId) => {
    try {
      const response = await api.get(`/quizzes/${quizId}/best-score`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get quiz leaderboard
  getQuizLeaderboard: async (quizId) => {
    try {
      const response = await api.get(`/quizzes/${quizId}/leaderboard`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default quizService;