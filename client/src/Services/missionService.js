// / missionService.js
// import api from './api';

// class MissionService {
//   async getDailyMissions(userId) {
//     try {
//       const response = await api.get(`/missions/daily/${userId}`);
//       return response.missions;
//     } catch (error) {
//       throw new Error(error.message || 'Failed to fetch daily missions');
//     }
//   }

//   async getWeeklyMissions(userId) {
//     try {
//       const response = await api.get(`/missions/weekly/${userId}`);
//       return response.missions;
//     } catch (error) {
//       throw new Error(error.message || 'Failed to fetch weekly missions');
//     }
//   }

//   async completeMission(missionId, userId) {
//     try {
//       const response = await api.post(`/missions/${missionId}/complete`, { userId });
//       return response;
//     } catch (error) {
//       throw new Error(error.message || 'Failed to complete mission');
//     }
//   }

//   async updateMissionProgress(missionId, userId, progress) {
//     try {
//       const response = await api.patch(`/missions/${missionId}/progress`, {
//         userId,
//         progress
//       });
//       return response;
//     } catch (error) {
//       throw new Error(error.message || 'Failed to update mission progress');
//     }
//   }

//   async claimMissionReward(missionId, userId) {
//     try {
//       const response = await api.post(`/missions/${missionId}/claim-reward`, { userId });
//       return response;
//     } catch (error) {
//       throw new Error(error.message || 'Failed to claim reward');
//     }
//   }

//   async getMissionHistory(userId, limit = 30) {
//     try {
//       const response = await api.get(`/users/${userId}/mission-history`, { limit });
//       return response.history;
//     } catch (error) {
//       throw new Error(error.message || 'Failed to fetch mission history');
//     }
//   }

//   async getAvailableMissions(userId) {
//     try {
//       const response = await api.get(`/missions/available/${userId}`);
//       return response.missions;
//     } catch (error) {
//       throw new Error(error.message || 'Failed to fetch available missions');
//     }
//   }

//   getMissionResetTime() {
//     const now = new Date();
//     const tomorrow = new Date(now);
//     tomorrow.setDate(tomorrow.getDate() + 1);
//     tomorrow.setHours(0, 0, 0, 0);
//     return tomorrow;
//   }
// }

// export default new MissionService();

import api from './api';

const missionService = {
  // Get today's missions
  getTodaysMissions: async () => {
    try {
      const response = await api.get('/missions/today');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get mission by ID
  getMissionById: async (missionId) => {
    try {
      const response = await api.get(`/missions/${missionId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Complete mission
  completeMission: async (missionId) => {
    try {
      const response = await api.post(`/missions/${missionId}/complete`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Submit mission proof
  submitMissionProof: async (missionId, file) => {
    try {
      const formData = new FormData();
      formData.append('proof', file);

      const response = await api.post(`/missions/${missionId}/proof`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get mission history
  getMissionHistory: async (params = {}) => {
    try {
      const response = await api.get('/missions/history', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get mission statistics
  getMissionStats: async () => {
    try {
      const response = await api.get('/missions/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Generate new missions (admin/teacher only)
  generateMissions: async () => {
    try {
      const response = await api.post('/missions/generate');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get mission completion rate
  getCompletionRate: async () => {
    try {
      const response = await api.get('/missions/completion-rate');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default missionService;