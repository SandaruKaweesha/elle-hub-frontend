import axios from 'axios';

// Create an Axios instance for XAMPP / PHP backend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost/elle-hub-backend',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth tokens
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

// Add response interceptor for handling common errors
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export const certificateAPI = {
  generate: (tournamentId) => api.post(`/tournament/${tournamentId}/certificates/generate`),
  getTournamentCertificates: (tournamentId) => api.get(`/tournament/${tournamentId}/certificates`),
  getHistory: () => api.get('/certificates/history'),
  verify: (token) => api.get(`/api/certificates/verify/${token}`)
};

export const tournamentResultsAPI = {
  saveResults: (tournamentId, results) => api.post(`/tournament/${tournamentId}/results`, { results }),
  getResults: (tournamentId) => api.get(`/tournament/${tournamentId}/results`)
};

export default api;
