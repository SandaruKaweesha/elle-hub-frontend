import axios from 'axios';

const getBaseURL = () => {
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return `${window.location.protocol}//${window.location.hostname}/elle-hub-backend`;
  }
  return import.meta.env.VITE_API_URL || 'https://quick-ways-shop.loca.lt/elle-hub-backend';
};

// Create an Axios instance for XAMPP / PHP backend
const api = axios.create({
  baseURL: getBaseURL(),
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
