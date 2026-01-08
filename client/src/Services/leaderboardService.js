
// // leaderboardService.js
// import api from './api';

// class LeaderboardService {
//   async getGlobalLeaderboard(timeframe = 'all', limit = 50) {
//     try {
//       const response = await api.get('/leaderboard/global', { timeframe, limit });
//       return response.leaderboard;
//     } catch (error) {
//       throw new Error(error.message || 'Failed to fetch leaderboard');
//     }
//   }

//   async getClassLeaderboard(classId, timeframe = 'week', limit = 50) {
//     try {
//       const response = await api.get(`/leaderboard/class/${classId}`, { timeframe, limit });
//       return response.leaderboard;
//     } catch (error) {
//       throw new Error(error.message || 'Failed to fetch class leaderboard');
//     }
//   }

//   async getSchoolLeaderboard(schoolId, timeframe = 'month', limit = 50) {
//     try {
//       const response = await api.get(`/leaderboard/school/${schoolId}`, { timeframe, limit });
//       return response.leaderboard;
//     } catch (error) {
//       throw new Error(error.message || 'Failed to fetch school leaderboard');
//     }
//   }

//   async getUserRank(userId, scope = 'global', timeframe = 'all') {
//     try {
//       const response = await api.get(`/leaderboard/rank/${userId}`, { scope, timeframe });
//       return response.rank;
//     } catch (error) {
//       throw new Error(error.message || 'Failed to fetch user rank');
//     }
//   }

//   async getTopPerformers(category = 'points', limit = 10) {
//     try {
//       const response = await api.get('/leaderboard/top-performers', { category, limit });
//       return response.performers;
//     } catch (error) {
//       throw new Error(error.message || 'Failed to fetch top performers');
//     }
//   }

//   async getFriendsLeaderboard(userId, limit = 20) {
//     try {
//       const response = await api.get(`/leaderboard/friends/${userId}`, { limit });
//       return response.leaderboard;
//     } catch (error) {
//       throw new Error(error.message || 'Failed to fetch friends leaderboard');
//     }
//   }
// }

// export default new LeaderboardService();

import api from './api';

const leaderboardService = {
  // Get leaderboard by type (weekly, monthly, alltime)
  getLeaderboard: async (type = 'weekly') => {
    try {
      const response = await api.get('/leaderboard', {
        params: { type }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user's rank
  getUserRank: async (type = 'weekly') => {
    try {
      const response = await api.get('/leaderboard/my-rank', {
        params: { type }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get class leaderboard
  getClassLeaderboard: async (type = 'weekly') => {
    try {
      const response = await api.get('/leaderboard/class', {
        params: { type }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get competition leaderboard
  getCompetitionLeaderboard: async (type = 'weekly') => {
    try {
      const response = await api.get('/leaderboard/competition', {
        params: { type }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get leaderboard by grade
  getLeaderboardByGrade: async (grade, type = 'weekly') => {
    try {
      const response = await api.get('/leaderboard/grade', {
        params: { grade, type }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get top performers
  getTopPerformers: async (limit = 10) => {
    try {
      const response = await api.get('/leaderboard/top', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get leaderboard statistics
  getLeaderboardStats: async () => {
    try {
      const response = await api.get('/leaderboard/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user's position change
  getPositionChange: async (type = 'weekly') => {
    try {
      const response = await api.get('/leaderboard/position-change', {
        params: { type }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get nearby users on leaderboard
  getNearbyUsers: async (type = 'weekly', range = 5) => {
    try {
      const response = await api.get('/leaderboard/nearby', {
        params: { type, range }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default leaderboardService;