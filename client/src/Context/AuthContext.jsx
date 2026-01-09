import React, { createContext, useState, useEffect } from 'react';
import api from '@services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const fetchUser = React.useCallback(async () => {
    try {
      // Decode token to get user ID
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Decode JWT token (simple base64 decode)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.id;

        // Fetch user by ID
        const response = await api.get(`/users/${userId}`);
        setUser(response.data);
      } catch (decodeError) {
        console.error('Error decoding token:', decodeError);
        logout();
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check if user is already logged in
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token, fetchUser]);

  const login = async (email, password) => {
    try {
      const response = await api.post('/users/login', { email, password });
      const userData = response.data;
      const { token } = userData;

      localStorage.setItem('token', token);
      setToken(token);
      setUser(userData);

      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/users/register', userData);
      const responseData = response.data;
      const { token } = responseData;

      localStorage.setItem('token', token);
      setToken(token);
      setUser(responseData);

      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    fetchUser,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};