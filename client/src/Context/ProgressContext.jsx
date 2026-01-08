import React, { createContext, useState, useEffect } from 'react';
import { useAuth } from '@hooks/useAuth';
import api from '@services/api';

export const ProgressContext = createContext();

export const ProgressProvider = ({ children }) => {
  const { user } = useAuth();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (user) {
      fetchProgress();
    } else {
      setProgress(null);
      setLoading(false);
    }
  }, [user, refreshKey]);

  const fetchProgress = async () => {
    setLoading(true);
    try {
      const response = await api.get('/progress');
      setProgress(response.data.data || null);
    } catch (error) {
      console.error('Error fetching progress:', error);
      setProgress(null);
    } finally {
      setLoading(false);
    }
  };

  const updateLessonProgress = async (lessonId, data) => {
    try {
      const response = await api.post(`/progress/lesson/${lessonId}`, data);

      // Refresh progress data
      fetchProgress();

      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const getModuleProgress = async (moduleId) => {
    try {
      const response = await api.get(`/progress/module/${moduleId}`);
      return response.data.progress;
    } catch (error) {
      console.error('Error fetching module progress:', error);
      return null;
    }
  };

  const refreshProgress = () => {
    setRefreshKey(prev => prev + 1);
  };

  const getOverallCompletion = () => {
    if (!progress) return 0;
    return progress.overallProgress || 0;
  };

  const getTotalLessonsCompleted = () => {
    if (!progress) return 0;
    return progress.totalLessonsCompleted || 0;
  };

  const getTotalModulesCompleted = () => {
    if (!progress) return 0;
    return progress.totalModulesCompleted || 0;
  };

  const getTotalTimeSpent = () => {
    if (!progress) return 0;
    return progress.totalTimeSpent || 0;
  };

  const getCurrentLevel = () => {
    if (!progress) return 1;
    return progress.currentLevel || 1;
  };

  const getPointsToNextLevel = () => {
    if (!progress) return 100;
    return progress.pointsToNextLevel || 100;
  };

  const value = {
    progress,
    loading,
    updateLessonProgress,
    getModuleProgress,
    refreshProgress,
    getOverallCompletion,
    getTotalLessonsCompleted,
    getTotalModulesCompleted,
    getTotalTimeSpent,
    getCurrentLevel,
    getPointsToNextLevel,
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
};