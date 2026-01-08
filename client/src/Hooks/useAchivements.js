// useAchievements.js
import { useState, useEffect } from 'react';

export const useAchievements = (userId) => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newAchievements, setNewAchievements] = useState([]);

  useEffect(() => {
    const fetchAchievements = async () => {
      setLoading(true);
      try {
        // Mock achievements data
        const mockAchievements = [
          { id: 1, name: 'First Steps', earned: true, earnedDate: '2025-10-15' },
          { id: 2, name: 'Eco Warrior', earned: true, earnedDate: '2025-10-22' },
          { id: 3, name: 'Knowledge Seeker', earned: true, earnedDate: '2025-10-25' },
          { id: 4, name: 'Week Warrior', earned: true, earnedDate: '2025-10-28' },
          { id: 5, name: 'Climate Champion', earned: false, progress: '9/25' }
        ];
        setAchievements(mockAchievements);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching achievements:', error);
        setLoading(false);
      }
    };

    if (userId) {
      fetchAchievements();
    }
  }, [userId]);

  const unlockAchievement = (achievementId) => {
    setAchievements(prev =>
      prev.map(ach =>
        ach.id === achievementId
          ? { ...ach, earned: true, earnedDate: new Date().toISOString() }
          : ach
      )
    );
    
    const unlockedAchievement = achievements.find(a => a.id === achievementId);
    if (unlockedAchievement) {
      setNewAchievements(prev => [...prev, unlockedAchievement]);
      
      // Clear notification after 5 seconds
      setTimeout(() => {
        setNewAchievements(prev => prev.filter(a => a.id !== achievementId));
      }, 5000);
    }
  };

  const getEarnedCount = () => {
    return achievements.filter(a => a.earned).length;
  };

  return {
    achievements,
    loading,
    newAchievements,
    unlockAchievement,
    getEarnedCount
  };
};