
// // challengeService.js
// import api from './api';

// class ChallengeService {
//   async getChallenges(filters = {}) {
//     try {
//       const response = await api.get('/challenges', filters);
//       return response.challenges;
//     } catch (error) {
//       throw new Error(error.message || 'Failed to fetch challenges');
//     }
//   }

//   async getChallengeById(challengeId) {
//     try {
//       const response = await api.get(`/challenges/${challengeId}`);
//       return response.challenge;
//     } catch (error) {
//       throw new Error(error.message || 'Failed to fetch challenge');
//     }
//   }

//   async joinChallenge(challengeId, userId) {
//     try {
//       const response = await api.post(`/challenges/${challengeId}/join`, { userId });
//       return response;
//     } catch (error) {
//       throw new Error(error.message || 'Failed to join challenge');
//     }
//   }

//   async leaveChallenge(challengeId, userId) {
//     try {
//       const response = await api.post(`/challenges/${challengeId}/leave`, { userId });
//       return response;
//     } catch (error) {
//       throw new Error(error.message || 'Failed to leave challenge');
//     }
//   }

//   async updateChallengeProgress(challengeId, userId, progress) {
//     try {
//       const response = await api.patch(`/challenges/${challengeId}/progress`, {
//         userId,
//         progress
//       });
//       return response;
//     } catch (error) {
//       throw new Error(error.message || 'Failed to update progress');
//     }
//   }

//   async getUserChallenges(userId) {
//     try {
//       const response = await api.get(`/users/${userId}/challenges`);
//       return response.challenges;
//     } catch (error) {
//       throw new Error(error.message || 'Failed to fetch user challenges');
//     }
//   }

//   async completeChallenge(challengeId, userId) {
//     try {
//       const response = await api.post(`/challenges/${challengeId}/complete`, { userId });
//       return response;
//     } catch (error) {
//       throw new Error(error.message || 'Failed to complete challenge');
//     }
//   }

//   async createChallenge(challengeData) {
//     try {
//       const response = await api.post('/challenges', challengeData);
//       return response.challenge;
//     } catch (error) {
//       throw new Error(error.message || 'Failed to create challenge');
//     }
//   }

//   async deleteChallenge(challengeId) {
//     try {
//       await api.delete(`/challenges/${challengeId}`);
//     } catch (error) {
//       throw new Error(error.message || 'Failed to delete challenge');
//     }
//   }
// }

// export default new ChallengeService();

import api from './api';

const challengeService = {
  // Get all challenges
  getAllChallenges: async (params = {}) => {
    try {
      const response = await api.get('/challenges', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get challenge by ID
  getChallengeById: async (challengeId) => {
    try {
      const response = await api.get(`/challenges/${challengeId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Submit challenge with proof
  submitChallenge: async (challengeId, file, data = {}) => {
    try {
      const formData = new FormData();
      formData.append('proof', file);
      
      // Add any additional data
      Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
      });

      const response = await api.post(`/challenges/${challengeId}/submit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user's challenge submissions
  getMyChallenges: async (params = {}) => {
    try {
      const response = await api.get('/challenges/my-challenges', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get challenge submission status
  getSubmissionStatus: async (challengeId) => {
    try {
      const response = await api.get(`/challenges/${challengeId}/status`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get challenge statistics
  getChallengeStats: async () => {
    try {
      const response = await api.get('/challenges/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user's challenge statistics
  getMyStats: async () => {
    try {
      const response = await api.get('/challenges/my-stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get challenges by difficulty
  getChallengesByDifficulty: async (difficulty) => {
    try {
      const response = await api.get('/challenges', {
        params: { difficulty }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create challenge (teacher only)
  createChallenge: async (challengeData) => {
    try {
      const response = await api.post('/challenges', challengeData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update challenge (teacher only)
  updateChallenge: async (challengeId, challengeData) => {
    try {
      const response = await api.put(`/challenges/${challengeId}`, challengeData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete challenge (teacher only)
  deleteChallenge: async (challengeId) => {
    try {
      const response = await api.delete(`/challenges/${challengeId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Grade challenge submission (teacher only)
  gradeSubmission: async (submissionId, points, feedback) => {
    try {
      const response = await api.post(`/challenges/${submissionId}/grade`, {
        points,
        feedback
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default challengeService;