
// // progressService.js
// import api from './api';

// class ProgressService {
//   async getUserProgress(userId) {
//     try {
//       const response = await api.get(`/users/${userId}/progress`);
//       return response.progress;
//     } catch (error) {
//       throw new Error(error.message || 'Failed to fetch user progress');
//     }
//   }

//   async updateProgress(userId, progressData) {
//     try {
//       const response = await api.put(`/users/${userId}/progress`, progressData);
//       return response.progress;
//     } catch (error) {
//       throw new Error(error.message || 'Failed to update progress');
//     }
//   }

//   async getModuleProgress(userId, moduleId) {
//     try {
//       const response = await api.get(`/users/${userId}/modules/${moduleId}/progress`);
//       return response.progress;
//     } catch (error) {
//       throw new Error(error.message || 'Failed to fetch module progress');
//     }
//   }

//   async completeLesson(userId, lessonId) {
//     try {
//       const response = await api.post(`/users/${userId}/lessons/${lessonId}/complete`);
//       return response;
//     } catch (error) {
//       throw new Error(error.message || 'Failed to complete lesson');
//     }
//   }

//   async updateLessonProgress(userId, lessonId, progress) {
//     try {
//       const response = await api.patch(`/users/${userId}/lessons/${lessonId}/progress`, {
//         progress
//       });
//       return response;
//     } catch (error) {
//       throw new Error(error.message || 'Failed to update lesson progress');
//     }
//   }

//   async getProgressStats(userId) {
//     try {
//       const response = await api.get(`/users/${userId}/progress/stats`);
//       return response.stats;
//     } catch (error) {
//       throw new Error(error.message || 'Failed to fetch progress stats');
//     }
//   }

//   async getProgressHistory(userId, days = 30) {
//     try {
//       const response = await api.get(`/users/${userId}/progress/history`, { days });
//       return response.history;
//     } catch (error) {
//       throw new Error(error.message || 'Failed to fetch progress history');
//     }
//   }

//   async getLearningTime(userId, timeframe = 'week') {
//     try {
//       const response = await api.get(`/users/${userId}/learning-time`, { timeframe });
//       return response.time;
//     } catch (error) {
//       throw new Error(error.message || 'Failed to fetch learning time');
//     }
//   }

//   calculateProgressPercentage(completed, total) {
//     if (total === 0) return 0;
//     return Math.round((completed / total) * 100);
//   }

//   async getModuleList(userId) {
//     try {
//       const response = await api.get(`/users/${userId}/modules`);
//       return response.modules;
//     } catch (error) {
//       throw new Error(error.message || 'Failed to fetch modules');
//     }
//   }
// }

// export default new ProgressService();

import api from './api';

const progressService = {
  // Get overall progress
  getOverallProgress: async () => {
    try {
      const response = await api.get('/progress/overall');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get module progress
  getModuleProgress: async (moduleId) => {
    try {
      const response = await api.get(`/progress/module/${moduleId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update lesson progress
  updateLessonProgress: async (lessonId, data) => {
    try {
      const response = await api.post(`/progress/lesson/${lessonId}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get lesson progress
  getLessonProgress: async (lessonId) => {
    try {
      const response = await api.get(`/progress/lesson/${lessonId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get progress summary
  getProgressSummary: async () => {
    try {
      const response = await api.get('/progress/summary');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all modules progress
  getAllModulesProgress: async () => {
    try {
      const response = await api.get('/progress/modules');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Mark lesson as started
  startLesson: async (lessonId) => {
    try {
      const response = await api.post(`/progress/lesson/${lessonId}/start`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Mark lesson as completed
  completeLesson: async (lessonId, data = {}) => {
    try {
      const response = await api.post(`/progress/lesson/${lessonId}/complete`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user statistics
  getUserStats: async () => {
    try {
      const response = await api.get('/progress/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get learning time
  getLearningTime: async (params = {}) => {
    try {
      const response = await api.get('/progress/learning-time', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default progressService;