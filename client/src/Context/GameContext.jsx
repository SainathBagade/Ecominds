import React, { createContext, useState, useEffect } from 'react';
import { useAuth } from '@hooks/useAuth';
import api from '@services/api';

export const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const { user } = useAuth();
  const [games, setGames] = useState([]);
  const [currentGame, setCurrentGame] = useState(null);
  const [gameScore, setGameScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchGames();
    } else {
      setGames([]);
      setLoading(false);
    }
  }, [user]);

  const fetchGames = async () => {
    setLoading(true);
    try {
      const response = await api.get('/games');
      setGames(response.data.games || []);
    } catch (error) {
      console.error('Error fetching games:', error);
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  const startGame = (game) => {
    setCurrentGame(game);
    setGameScore(0);
  };

  const endGame = async () => {
    if (!currentGame) return;

    try {
      // Submit score to backend
      await api.post(`/games/${currentGame._id}/score`, {
        score: gameScore,
      });

      // Reset game state
      setCurrentGame(null);
      setGameScore(0);

      return true;
    } catch (error) {
      console.error('Error submitting game score:', error);
      throw error;
    }
  };

  const updateScore = (points) => {
    setGameScore(prevScore => prevScore + points);
  };

  const resetScore = () => {
    setGameScore(0);
  };

  const getGameById = (gameId) => {
    return games.find(game => game._id === gameId);
  };

  const getUserHighScore = async (gameId) => {
    try {
      const response = await api.get(`/games/${gameId}/high-score`);
      return response.data.highScore || 0;
    } catch (error) {
      console.error('Error fetching high score:', error);
      return 0;
    }
  };

  const getGameLeaderboard = async (gameId) => {
    try {
      const response = await api.get(`/games/${gameId}/leaderboard`);
      return response.data.leaderboard || [];
    } catch (error) {
      console.error('Error fetching game leaderboard:', error);
      return [];
    }
  };

  const value = {
    games,
    currentGame,
    gameScore,
    loading,
    startGame,
    endGame,
    updateScore,
    resetScore,
    getGameById,
    getUserHighScore,
    getGameLeaderboard,
    fetchGames,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};