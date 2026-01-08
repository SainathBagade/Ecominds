
// // authService.js
// import api from './api';

// class AuthService {
//   async login(email, password) {
//     try {
//       const response = await api.post('/auth/login', { email, password });

//       if (response.token) {
//         api.setToken(response.token);
//         localStorage.setItem('ecoMindsUser', JSON.stringify(response.user));
//       }

//       return response;
//     } catch (error) {
//       throw new Error(error.message || 'Login failed');
//     }
//   }

//   async register(userData) {
//     try {
//       const response = await api.post('/auth/register', userData);

//       if (response.token) {
//         api.setToken(response.token);
//         localStorage.setItem('ecoMindsUser', JSON.stringify(response.user));
//       }

//       return response;
//     } catch (error) {
//       throw new Error(error.message || 'Registration failed');
//     }
//   }

//   async logout() {
//     try {
//       await api.post('/auth/logout');
//     } catch (error) {
//       console.error('Logout error:', error);
//     } finally {
//       api.setToken(null);
//       localStorage.removeItem('ecoMindsUser');
//       localStorage.removeItem('ecoMindsToken');
//     }
//   }

//   async getCurrentUser() {
//     try {
//       const response = await api.get('/auth/me');
//       localStorage.setItem('ecoMindsUser', JSON.stringify(response.user));
//       return response.user;
//     } catch (error) {
//       this.logout();
//       throw error;
//     }
//   }

//   async updateProfile(userId, updates) {
//     try {
//       const response = await api.put(`/users/${userId}`, updates);
//       localStorage.setItem('ecoMindsUser', JSON.stringify(response.user));
//       return response.user;
//     } catch (error) {
//       throw new Error(error.message || 'Profile update failed');
//     }
//   }

//   async changePassword(userId, currentPassword, newPassword) {
//     try {
//       const response = await api.post(`/users/${userId}/change-password`, {
//         currentPassword,
//         newPassword
//       });
//       return response;
//     } catch (error) {
//       throw new Error(error.message || 'Password change failed');
//     }
//   }

//   async resetPassword(email) {
//     try {
//       const response = await api.post('/auth/reset-password', { email });
//       return response;
//     } catch (error) {
//       throw new Error(error.message || 'Password reset failed');
//     }
//   }

//   async verifyResetToken(token) {
//     try {
//       const response = await api.post('/auth/verify-reset-token', { token });
//       return response;
//     } catch (error) {
//       throw new Error(error.message || 'Token verification failed');
//     }
//   }

//   isAuthenticated() {
//     return !!api.getToken();
//   }

//   getStoredUser() {
//     const userStr = localStorage.getItem('ecoMindsUser');
//     return userStr ? JSON.parse(userStr) : null;
//   }
// }

// export default new AuthService();

import api from './api';

const authService = {
  // Login user
  login: async (email, password) => {
    try {
      const response = await api.post('/users/login', { email, password });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Register user
  register: async (userData) => {
    try {
      const response = await api.post('/users/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    try {
      // Backend doesn't have logout route yet, just clear client state
      // await api.post('/users/logout');
      localStorage.removeItem('token');
      return true;
    } catch (error) {
      localStorage.removeItem('token');
      throw error;
    }
  },

  // Get current user profile
  getProfile: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (userId, userData) => {
    try {
      const response = await api.post(`/users/${userId}`, userData); // Note: Backend uses POST for update based on route file comments
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/users/forgotpassword', { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    try {
      const response = await api.put(`/users/resetpassword/${token}`, {
        password: newPassword,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Verify token
  verifyToken: async (token) => {
    try {
      const response = await api.post('/auth/verify-token', { token });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default authService;