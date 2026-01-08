
// // useStreak.js
// import { useState, useEffect } from 'react';

// export const useStreak = (userId) => {
//   const [streak, setStreak] = useState({
//     current: 15,
//     longest: 23,
//     lastActive: new Date().toISOString(),
//     calendar: []
//   });
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchStreak = async () => {
//       setLoading(true);
//       try {
//         // Generate calendar data for last 30 days
//         const calendar = generateStreakCalendar(30, streak.current);
//         setStreak(prev => ({ ...prev, calendar }));
//         setLoading(false);
//       } catch (error) {
//         console.error('Error fetching streak:', error);
//         setLoading(false);
//       }
//     };

//     if (userId) {
//       fetchStreak();
//     }
//   }, [userId, streak.current]);

//   const generateStreakCalendar = (days, currentStreak) => {
//     const calendar = [];
//     const today = new Date();
    
//     for (let i = days - 1; i >= 0; i--) {
//       const date = new Date(today);
//       date.setDate(date.getDate() - i);
//       calendar.push({
//         date: date.toISOString(),
//         active: i < currentStreak
//       });
//     }
    
//     return calendar;
//   };

//   const incrementStreak = () => {
//     setStreak(prev => {
//       const newCurrent = prev.current + 1;
//       return {
//         ...prev,
//         current: newCurrent,
//         longest: Math.max(newCurrent, prev.longest),
//         lastActive: new Date().toISOString()
//       };
//     });
//   };

//   const checkStreakStatus = () => {
//     const lastActive = new Date(streak.lastActive);
//     const now = new Date();
//     const hoursDiff = (now - lastActive) / (1000 * 60 * 60);
    
//     if (hoursDiff > 48) {
//       // Streak broken
//       return 'broken';
//     } else if (hoursDiff > 24) {
//       // At risk
//       return 'at-risk';
//     }
//     return 'active';
//   };

//   return {
//     streak,
//     loading,
//     incrementStreak,
//     checkStreakStatus
//   };
// };

import { useState, useEffect } from 'react';
import streakService from '@services/streakService';
import toast from 'react-hot-toast';

export const useStreak = () => {
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStreak();
  }, []);

  const fetchStreak = async () => {
    setLoading(true);
    try {
      const data = await streakService.getCurrentStreak();
      setStreak(data.streak);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching streak:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStreak = async () => {
    try {
      const data = await streakService.updateStreak();
      setStreak(data.streak);
      return data;
    } catch (err) {
      toast.error('Failed to update streak');
      throw err;
    }
  };

  const useFreeze = async () => {
    try {
      const data = await streakService.useStreakFreeze();
      setStreak(data.streak);
      toast.success('🛡️ Streak freeze activated!');
      return data;
    } catch (err) {
      toast.error('Failed to use streak freeze');
      throw err;
    }
  };

  const getStreakHistory = async (params = {}) => {
    try {
      const data = await streakService.getStreakHistory(params);
      return data.history;
    } catch (err) {
      toast.error('Failed to load streak history');
      throw err;
    }
  };

  const refreshStreak = () => {
    fetchStreak();
  };

  return {
    streak,
    loading,
    error,
    updateStreak,
    useFreeze,
    getStreakHistory,
    refreshStreak,
    currentStreak: streak?.currentStreak || 0,
    longestStreak: streak?.longestStreak || 0,
    freezesAvailable: streak?.freezesAvailable || 0,
  };
};