import axios from 'axios';

// Create an Axios instance
const api = axios.create({
  // Use the environment variable for the base URL.
  // Fallback to localhost if not defined.
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000, // 30 seconds timeout to handle Azure Serverless DB delays
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: Add a request interceptor to include auth tokens
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

// Optional: Add a response interceptor to handle common errors (e.g., 401 Unauthorized)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // if (error.response && error.response.status === 401) {
    //   // Handle logout or token refresh
    // }
    return Promise.reject(error);
  }
);

export const certificateAPI = {
  generate: (data) => api.post('/certificates', data),
  getHistory: () => api.get('/certificates/history'),
  verify: (id) => api.get(`/certificates/verify/${id}`)
};

export const tournamentResultsAPI = {
  saveResults: (tournamentId, results) => api.post(`/tournaments/${tournamentId}/results`, { results }),
  getResults: (tournamentId) => api.get(`/tournaments/${tournamentId}/results`)
};

export default api;
