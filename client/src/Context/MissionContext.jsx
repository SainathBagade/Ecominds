import React, { createContext, useState, useEffect } from 'react';
import { useAuth } from '@hooks/useAuth';
import api from '@services/api';

export const MissionContext = createContext();

export const MissionProvider = ({ children }) => {
  const { user } = useAuth();
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (user) {
      fetchMissions();
    } else {
      setMissions([]);
      setLoading(false);
    }
  }, [user, refreshKey]);

  const fetchMissions = async () => {
    setLoading(true);
    try {
      // Backend route is /api/missions, not /api/missions/today
      const response = await api.get('/missions');
      setMissions(response.data.data || []);
    } catch (error) {
      console.error('Error fetching missions:', error);
      setMissions([]);
    } finally {
      setLoading(false);
    }
  };

  const completeMission = async (missionId) => {
    try {
      const response = await api.post(`/missions/${missionId}/complete`);

      // Update local missions state
      setMissions(prevMissions =>
        prevMissions.map(mission =>
          mission._id === missionId
            ? { ...mission, status: 'completed', completedAt: new Date() }
            : mission
        )
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const submitMissionProof = async (missionId, file, description = '') => {
    try {
      const formData = new FormData();
      formData.append('proof', file);
      if (description) {
        formData.append('description', description);
      }

      const response = await api.post(`/missions/${missionId}/proof`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Refresh missions to get updated status
      fetchMissions();

      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const refreshMissions = () => {
    setRefreshKey(prev => prev + 1);
  };

  const getCompletedCount = () => {
    return missions.filter(m => m.status === 'completed').length;
  };

  const getTotalCount = () => {
    return missions.length;
  };

  const getCompletionRate = () => {
    if (missions.length === 0) return 0;
    return Math.round((getCompletedCount() / getTotalCount()) * 100);
  };

  const value = {
    missions,
    loading,
    completeMission,
    submitMissionProof,
    refreshMissions,
    getCompletedCount,
    getTotalCount,
    getCompletionRate,
  };

  return (
    <MissionContext.Provider value={value}>
      {children}
    </MissionContext.Provider>
  );
};