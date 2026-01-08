// / useDailyMissions.js
// import { useState, useEffect } from 'react';

// export const useDailyMissions = (userId) => {
//   const [missions, setMissions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [resetTime, setResetTime] = useState(null);

//   useEffect(() => {
//     const fetchMissions = async () => {
//       setLoading(true);
//       try {
//         const mockMissions = [
//           {
//             id: 1,
//             title: 'Complete a lesson',
//             description: 'Finish any video or interactive lesson',
//             points: 50,
//             completed: false,
//             progress: 0,
//             total: 1
//           },
//           {
//             id: 2,
//             title: 'Earn 100 points',
//             description: 'Collect points from any activity',
//             points: 75,
//             completed: false,
//             progress: 45,
//             total: 100
//           },
//           {
//             id: 3,
//             title: 'Watch a video',
//             description: 'Complete a video lesson',
//             points: 30,
//             completed: true,
//             progress: 1,
//             total: 1
//           }
//         ];
        
//         setMissions(mockMissions);
        
//         // Calculate time until reset (midnight)
//         const now = new Date();
//         const tomorrow = new Date(now);
//         tomorrow.setDate(tomorrow.getDate() + 1);
//         tomorrow.setHours(0, 0, 0, 0);
//         setResetTime(tomorrow);
        
//         setLoading(false);
//       } catch (error) {
//         console.error('Error fetching missions:', error);
//         setLoading(false);
//       }
//     };

//     if (userId) {
//       fetchMissions();
//     }
//   }, [userId]);

//   const completeMission = (missionId) => {
//     setMissions(prev =>
//       prev.map(mission =>
//         mission.id === missionId
//           ? { ...mission, completed: true, progress: mission.total }
//           : mission
//       )
//     );
//   };

//   const updateProgress = (missionId, progress) => {
//     setMissions(prev =>
//       prev.map(mission => {
//         if (mission.id === missionId) {
//           const completed = progress >= mission.total;
//           return { ...mission, progress, completed };
//         }
//         return mission;
//       })
//     );
//   };

//   const getCompletedCount = () => {
//     return missions.filter(m => m.completed).length;
//   };

//   const getTotalPoints = () => {
//     return missions.filter(m => m.completed).reduce((sum, m) => sum + m.points, 0);
//   };

//   return {
//     missions,
//     loading,
//     resetTime,
//     completeMission,
//     updateProgress,
//     getCompletedCount,
//     getTotalPoints
//   };
// };


import { useContext } from 'react';
import { MissionContext } from '@context/MissionContext';

export const useDailyMissions = () => {
  const context = useContext(MissionContext);
  
  if (!context) {
    throw new Error('useDailyMissions must be used within a MissionProvider');
  }
  
  return context;
};

// Alternative export as useMission
export const useMission = useDailyMissions;