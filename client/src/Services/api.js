// // api.js
// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// class ApiService {
//   constructor() {
//     this.baseURL = API_BASE_URL;
//     this.token = null;
//   }

//   setToken(token) {
//     this.token = token;
//     if (token) {
//       localStorage.setItem('ecoMindsToken', token);
//     } else {
//       localStorage.removeItem('ecoMindsToken');
//     }
//   }

//   getToken() {
//     if (!this.token) {
//       this.token = localStorage.getItem('ecoMindsToken');
//     }
//     return this.token;
//   }

//   async request(endpoint, options = {}) {
//     const url = `${this.baseURL}${endpoint}`;
//     const token = this.getToken();

//     const config = {
//       ...options,
//       headers: {
//         'Content-Type': 'application/json',
//         ...(token && { Authorization: `Bearer ${token}` }),
//         ...options.headers,
//       },
//     };

//     try {
//       const response = await fetch(url, config);
      
//       if (!response.ok) {
//         const error = await response.json().catch(() => ({}));
//         throw new Error(error.message || `HTTP error! status: ${response.status}`);
//       }

//       return await response.json();
//     } catch (error) {
//       console.error('API request failed:', error);
//       throw error;
//     }
//   }

//   async get(endpoint, params = {}) {
//     const queryString = new URLSearchParams(params).toString();
//     const url = queryString ? `${endpoint}?${queryString}` : endpoint;
//     return this.request(url, { method: 'GET' });
//   }

//   async post(endpoint, data) {
//     return this.request(endpoint, {
//       method: 'POST',
//       body: JSON.stringify(data),
//     });
//   }

//   async put(endpoint, data) {
//     return this.request(endpoint, {
//       method: 'PUT',
//       body: JSON.stringify(data),
//     });
//   }

//   async delete(endpoint) {
//     return this.request(endpoint, { method: 'DELETE' });
//   }

//   async patch(endpoint, data) {
//     return this.request(endpoint, {
//       method: 'PATCH',
//       body: JSON.stringify(data),
//     });
//   }
// }

// export default new ApiService();


import axios from 'axios';
import { API_BASE_URL } from '@utils/constants';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    // Handle 403 Forbidden - Insufficient permissions
    if (error.response?.status === 403) {
      console.error('Access denied');
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      console.error('Resource not found');
    }

    // Handle 500 Server Error
    if (error.response?.status === 500) {
      console.error('Server error');
    }

    return Promise.reject(error);
  }
);

export default api;