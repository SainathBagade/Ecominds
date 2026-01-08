
// // useLeaderboard.js
// import { useState, useEffect } from 'react';

// export const useLeaderboard = (timeframe = 'week') => {
//   const [leaderboard, setLeaderboard] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [userRank, setUserRank] = useState(null);

//   useEffect(() => {
//     const fetchLeaderboard = async () => {
//       setLoading(true);
//       try {
//         const mockLeaderboard = [
//           { rank: 1, name: 'Emma Johnson', points: 4520, lessons: 62, avatar: 'EJ' },
//           { rank: 2, name: 'Liam Smith', points: 4200, lessons: 58, avatar: 'LS' },
//           { rank: 3, name: 'Olivia Brown', points: 3890, lessons: 54, avatar: 'OB' },
//           { rank: 4, name: 'Eco Learner', points: 3450, lessons: 48, avatar: 'EL', isCurrentUser: true },
//           { rank: 5, name: 'Noah Davis', points: 3200, lessons: 45, avatar: 'ND' }
//         ];
        
//         setLeaderboard(mockLeaderboard);
        
//         const currentUser = mockLeaderboard.find(u => u.isCurrentUser);
//         if (currentUser) {
//           setUserRank(currentUser.rank);
//         }
        
//         setLoading(false);
//       } catch (error) {
//         console.error('Error fetching leaderboard:', error);
//         setLoading(false);
//       }
//     };

//     fetchLeaderboard();
//   }, [timeframe]);

//   return {
//     leaderboard,
//     loading,
//     userRank,
//     timeframe
//   };
// };




// // Export all hooks
// export default {
//   useAuth,
//   useProgress,
//   useStreak,
//   useAchievements,
//   useLessons,
//   usePoints,
//   useLocalStorage,
//   useDebounce,
//   useNotification,
//   useTimer,
//   useDailyMissions,
//   useLeaderboard
// };

import { useState, useEffect } from 'react';
import leaderboardService from '@services/leaderboardService';
import toast from 'react-hot-toast';

export const useLeaderboard = (type = 'weekly') => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
    fetchUserRank();
  }, [type]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await leaderboardService.getLeaderboard(type);
      setLeaderboard(data.leaderboard || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching leaderboard:', err);
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRank = async () => {
    try {
      const data = await leaderboardService.getUserRank(type);
      setUserRank(data.rank);
    } catch (err) {
      console.error('Error fetching user rank:', err);
    }
  };

  const refreshLeaderboard = () => {
    fetchLeaderboard();
    fetchUserRank();
  };

  const getTopUsers = (count = 10) => {
    return leaderboard.slice(0, count);
  };

  const getUserPosition = (userId) => {
    const index = leaderboard.findIndex(user => user._id === userId);
    return index !== -1 ? index + 1 : null;
  };

  return {
    leaderboard,
    userRank,
    loading,
    error,
    refreshLeaderboard,
    getTopUsers,
    getUserPosition,
  };
};