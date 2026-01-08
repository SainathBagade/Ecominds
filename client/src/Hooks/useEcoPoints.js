// // usePoints.js
// import { useState, useEffect } from 'react';

// export const usePoints = (userId) => {
//   const [points, setPoints] = useState({
//     total: 3450,
//     history: []
//   });
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchPoints = async () => {
//       setLoading(true);
//       try {
//         const mockHistory = [
//           { 
//             id: 1, 
//             action: 'Completed "Solar Energy Basics"',
//             points: 75,
//             date: new Date().toISOString(),
//             type: 'lesson'
//           },
//           { 
//             id: 2, 
//             action: 'Daily Mission Completed',
//             points: 50,
//             date: new Date(Date.now() - 86400000).toISOString(),
//             type: 'mission'
//           }
//         ];
//         setPoints(prev => ({ ...prev, history: mockHistory }));
//         setLoading(false);
//       } catch (error) {
//         console.error('Error fetching points:', error);
//         setLoading(false);
//       }
//     };

//     if (userId) {
//       fetchPoints();
//     }
//   }, [userId]);

//   const addPoints = (amount, action, type = 'other') => {
//     const newEntry = {
//       id: Date.now(),
//       action,
//       points: amount,
//       date: new Date().toISOString(),
//       type
//     };

//     setPoints(prev => ({
//       total: prev.total + amount,
//       history: [newEntry, ...prev.history]
//     }));
//   };

//   const getPointsByType = (type) => {
//     return points.history
//       .filter(entry => entry.type === type)
//       .reduce((sum, entry) => sum + entry.points, 0);
//   };

//   return {
//     points,
//     loading,
//     addPoints,
//     getPointsByType
//   };
// };

import { useState, useEffect } from 'react';
import api from '@services/api';
import toast from 'react-hot-toast';

export const useEcoPoints = () => {
  const [points, setPoints] = useState(0);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPoints();
    fetchHistory();
  }, []);

  const fetchPoints = async () => {
    setLoading(true);
    try {
      const response = await api.get('/ecopoints/balance');
      setPoints(response.data.balance || 0);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching points:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (params = {}) => {
    try {
      const response = await api.get('/ecopoints/history', { params });
      setHistory(response.data.history || []);
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  const refreshPoints = () => {
    fetchPoints();
    fetchHistory();
  };

  const getPointsBySource = (source) => {
    return history
      .filter(item => item.source === source)
      .reduce((sum, item) => sum + item.amount, 0);
  };

  const getTotalPointsEarned = () => {
    return history
      .filter(item => item.amount > 0)
      .reduce((sum, item) => sum + item.amount, 0);
  };

  const getTotalPointsSpent = () => {
    return history
      .filter(item => item.amount < 0)
      .reduce((sum, item) => sum + Math.abs(item.amount), 0);
  };

  return {
    points,
    history,
    loading,
    error,
    refreshPoints,
    getPointsBySource,
    getTotalPointsEarned,
    getTotalPointsSpent,
  };
};