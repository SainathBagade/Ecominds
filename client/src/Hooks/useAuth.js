// // useAuth.js
// import { useState, useEffect, useCallback } from 'react';

// export const useAuth = () => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     // Simulate checking for existing session
//     const checkAuth = async () => {
//       try {
//         const storedUser = localStorage.getItem('ecoMindsUser');
//         if (storedUser) {
//           setUser(JSON.parse(storedUser));
//         }
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     checkAuth();
//   }, []);

//   const login = useCallback(async (email, password) => {
//     setLoading(true);
//     setError(null);
//     try {
//       // Simulate API call
//       const mockUser = {
//         id: '1',
//         email,
//         name: 'Eco Learner',
//         role: 'student',
//         level: 12,
//         points: 3450
//       };
//       localStorage.setItem('ecoMindsUser', JSON.stringify(mockUser));
//       setUser(mockUser);
//       return mockUser;
//     } catch (err) {
//       setError(err.message);
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   const logout = useCallback(() => {
//     localStorage.removeItem('ecoMindsUser');
//     setUser(null);
//   }, []);

//   const updateProfile = useCallback((updates) => {
//     const updatedUser = { ...user, ...updates };
//     localStorage.setItem('ecoMindsUser', JSON.stringify(updatedUser));
//     setUser(updatedUser);
//   }, [user]);

//   return {
//     user,
//     loading,
//     error,
//     login,
//     logout,
//     updateProfile,
//     isAuthenticated: !!user
//   };
// };


import { useContext } from 'react';
import { AuthContext } from '@context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};