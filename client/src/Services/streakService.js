
// // streakService.js
// import api from './api';

// class StreakService {
//   async getUserStreak(userId) {
//     try {
//       const response = await api.get(`/users/${userId}/streak`);
//       return response.streak;
//     } catch (error) {
//       throw new Error(error.message || 'Failed to fetch streak');
//     }
//   }

//   async updateStreak(userId) {
//     try {
//       const response = await api.post(`/users/${userId}/streak/update`);
//       return response.streak;
//     } catch (error) {
//       throw new Error(error.message || 'Failed to update streak');
//     }
//   }

//   async getStreakCalendar(userId, days = 30) {
//     try {
//       const response = await api.get(`/users/${userId}/streak/calendar`, { days });
//       return response.calendar;
//     } catch (error) {
//       throw new Error(error.message || 'Failed to fetch streak calendar');
//     }
//   }

//   async claimStreakReward(userId) {
//     try {
//       const response = await api.post(`/users/${userId}/streak/claim-reward`);
//       return response;
//     } catch (error) {
//       throw new Error(error.message || 'Failed to claim streak reward');
//     }
//   }

//   async getStreakMilestones() {
//     try {
//       const response = await api.get('/streak/milestones');
//       return response.milestones;
//     } catch (error) {
//       throw new Error(error.message || 'Failed to fetch milestones');
//     }
//   }

//   checkStreakStatus(lastActiveDate) {
//     const lastActive = new Date(lastActiveDate);
//     const now = new Date();
//     const hoursDiff = (now - lastActive) / (1000 * 60 * 60);

//     if (hoursDiff > 48) {
//       return { status: 'broken', message: 'Your streak has ended' };
//     } else if (hoursDiff > 24) {
//       return { status: 'at-risk', message: 'Complete an activity to save your streak!' };
//     }
//     return { status: 'active', message: 'Keep up the great work!' };
//   }

//   getNextMilestone(currentStreak, milestones = [7, 14, 30, 60, 100, 365]) {
//     return milestones.find(m => m > currentStreak) || null;
//   }

//   generateStreakCalendar(days, currentStreak) {
//     const calendar = [];
//     const today = new Date();
    
//     for (let i = days - 1; i >= 0; i--) {
//       const date = new Date(today);
//       date.setDate(date.getDate() - i);
//       calendar.push({
//         date: date.toISOString().split('T')[0],
//         active: i < currentStreak,
//         isToday: i === 0
//       });
//     }
    
//     return calendar;
//   }
// }

// export default new StreakService();




// // Export all services
// export {
//   ApiService,
//   AuthService,
//   ChallengeService,
//   CompetitionService,
//   LeaderboardService,
//   MissionService,
//   ProgressService,
//   QuizService,
//   StreakService
// };

import api from './api';

const streakService = {
  // Get current streak
  getCurrentStreak: async () => {
    try {
      const response = await api.get('/streaks/current');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update streak (usually auto-called on login)
  updateStreak: async () => {
    try {
      const response = await api.post('/streaks/update');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get streak history
  getStreakHistory: async (params = {}) => {
    try {
      const response = await api.get('/streaks/history', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Use streak freeze
  useStreakFreeze: async () => {
    try {
      const response = await api.post('/streaks/freeze');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get streak statistics
  getStreakStats: async () => {
    try {
      const response = await api.get('/streaks/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get streak milestones
  getStreakMilestones: async () => {
    try {
      const response = await api.get('/streaks/milestones');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Check if streak is maintained
  checkStreakStatus: async () => {
    try {
      const response = await api.get('/streaks/status');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user's longest streak
  getLongestStreak: async () => {
    try {
      const response = await api.get('/streaks/longest');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default streakService;