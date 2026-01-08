// useProgress.js
import { useState, useEffect } from 'react';

export const useProgress = (userId) => {
  const [progress, setProgress] = useState({
    totalLessons: 100,
    completedLessons: 48,
    totalModules: 4,
    completedModules: 1,
    currentStreak: 15,
    longestStreak: 23,
    totalPoints: 3450,
    level: 12
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching progress data
    const fetchProgress = async () => {
      setLoading(true);
      try {
        // In a real app, this would be an API call
        setTimeout(() => {
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching progress:', error);
        setLoading(false);
      }
    };

    if (userId) {
      fetchProgress();
    }
  }, [userId]);

  const updateProgress = (updates) => {
    setProgress(prev => ({ ...prev, ...updates }));
  };

  const completeLesson = (lessonId, points) => {
    setProgress(prev => ({
      ...prev,
      completedLessons: prev.completedLessons + 1,
      totalPoints: prev.totalPoints + points
    }));
  };

  const getProgressPercentage = () => {
    return Math.round((progress.completedLessons / progress.totalLessons) * 100);
  };

  return {
    progress,
    loading,
    updateProgress,
    completeLesson,
    getProgressPercentage
  };
};
