
// // competitionService.js
// import api from './api';

// class CompetitionService {
//   async getActiveCompetitions() {
//     try {
//       const response = await api.get('/competitions/active');
//       return response.competitions;
//     } catch (error) {
//       throw new Error(error.message || 'Failed to fetch competitions');
//     }
//   }

//   async getCompetitionById(competitionId) {
//     try {
//       const response = await api.get(`/competitions/${competitionId}`);
//       return response.competition;
//     } catch (error) {
//       throw new Error(error.message || 'Failed to fetch competition');
//     }
//   }

//   async joinCompetition(competitionId, userId) {
//     try {
//       const response = await api.post(`/competitions/${competitionId}/join`, { userId });
//       return response;
//     } catch (error) {
//       throw new Error(error.message || 'Failed to join competition');
//     }
//   }

//   async getCompetitionLeaderboard(competitionId, limit = 100) {
//     try {
//       const response = await api.get(`/competitions/${competitionId}/leaderboard`, { limit });
//       return response.leaderboard;
//     } catch (error) {
//       throw new Error(error.message || 'Failed to fetch leaderboard');
//     }
//   }

//   async getCompetitionRankings(competitionId, userId) {
//     try {
//       const response = await api.get(`/competitions/${competitionId}/rankings/${userId}`);
//       return response.ranking;
//     } catch (error) {
//       throw new Error(error.message || 'Failed to fetch ranking');
//     }
//   }

//   async submitCompetitionEntry(competitionId, userId, entryData) {
//     try {
//       const response = await api.post(`/competitions/${competitionId}/submit`, {
//         userId,
//         ...entryData
//       });
//       return response;
//     } catch (error) {
//       throw new Error(error.message || 'Failed to submit entry');
//     }
//   }

//   async getUserCompetitions(userId) {
//     try {
//       const response = await api.get(`/users/${userId}/competitions`);
//       return response.competitions;
//     } catch (error) {
//       throw new Error(error.message || 'Failed to fetch user competitions');
//     }
//   }
// }

// export default new CompetitionService();

import api from './api';

const competitionService = {
  // Get all competitions
  getAllCompetitions: async (params = {}) => {
    try {
      const response = await api.get('/competitions', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get competition by ID
  getCompetitionById: async (competitionId) => {
    try {
      const response = await api.get(`/competitions/${competitionId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Join competition
  joinCompetition: async (competitionId) => {
    try {
      const response = await api.post(`/competitions/${competitionId}/join`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Submit competition round
  submitRound: async (competitionId, roundNumber, answers) => {
    try {
      const response = await api.post(`/competitions/${competitionId}/round/${roundNumber}`, {
        answers
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get competition results
  getCompetitionResults: async (competitionId) => {
    try {
      const response = await api.get(`/competitions/${competitionId}/results`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user's competition history
  getMyCompetitions: async (params = {}) => {
    try {
      const response = await api.get('/competitions/my-competitions', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get competition leaderboard
  getCompetitionLeaderboard: async (competitionId) => {
    try {
      const response = await api.get(`/competitions/${competitionId}/leaderboard`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get competition statistics
  getCompetitionStats: async () => {
    try {
      const response = await api.get('/competitions/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user's competition statistics
  getMyStats: async () => {
    try {
      const response = await api.get('/competitions/my-stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Check if user can participate
  canParticipate: async (competitionId) => {
    try {
      const response = await api.get(`/competitions/${competitionId}/can-participate`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get current round
  getCurrentRound: async (competitionId) => {
    try {
      const response = await api.get(`/competitions/${competitionId}/current-round`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get upcoming competitions
  getUpcomingCompetitions: async () => {
    try {
      const response = await api.get('/competitions', {
        params: { status: 'upcoming' }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get ongoing competitions
  getOngoingCompetitions: async () => {
    try {
      const response = await api.get('/competitions', {
        params: { status: 'ongoing' }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get completed competitions
  getCompletedCompetitions: async () => {
    try {
      const response = await api.get('/competitions', {
        params: { status: 'completed' }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create competition (teacher only)
  createCompetition: async (competitionData) => {
    try {
      const response = await api.post('/competitions', competitionData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default competitionService;