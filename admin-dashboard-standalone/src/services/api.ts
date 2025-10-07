import axios from 'axios';

const API_BASE_URL = 'https://ev-charging-platform-production.mks-alghafil.workers.dev';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (email: string, password: string, name: string) =>
    api.post('/auth/register', { email, password, name }),
  
  verify: () =>
    api.get('/auth/verify'),
};

// Stations API
export const stationsAPI = {
  getAll: (params?: { status?: string; location?: string }) =>
    api.get('/api/stations', { params }),
  
  getById: (id: string) =>
    api.get(`/api/stations/${id}`),
  
  getConnectors: (id: string) =>
    api.get(`/api/stations/${id}/connectors`),
  
  updateStatus: (id: string, status: string) =>
    api.patch(`/api/stations/${id}/status`, { status }),
  
  getStats: (id: string) =>
    api.get(`/api/stations/${id}/stats`),
};

// Users API
export const usersAPI = {
  getAll: (params?: { status?: string; search?: string }) =>
    api.get('/api/users', { params }),
  
  getById: (id: string) =>
    api.get(`/api/users/${id}`),
  
  updateStatus: (id: string, status: string) =>
    api.patch(`/api/users/${id}/status`, { status }),
  
  getStats: (id: string) =>
    api.get(`/api/users/${id}/stats`),
};

// Charging Sessions API
export const chargingAPI = {
  getAll: (params?: { 
    status?: string; 
    userId?: string; 
    stationId?: string; 
    startDate?: string; 
    endDate?: string 
  }) =>
    api.get('/api/charging/sessions', { params }),
  
  getById: (id: string) =>
    api.get(`/api/charging/sessions/${id}`),
  
  startSession: (data: {
    userId: string;
    stationId: string;
    connectorId: string;
    paymentMethod: string;
  }) =>
    api.post('/api/charging/sessions', data),
  
  endSession: (id: string) =>
    api.patch(`/api/charging/sessions/${id}/end`),
  
  getStats: () =>
    api.get('/api/charging/sessions/stats/overview'),
};

// Payments API
export const paymentsAPI = {
  getAll: (params?: { 
    status?: string; 
    userId?: string; 
    paymentMethod?: string; 
    startDate?: string; 
    endDate?: string 
  }) =>
    api.get('/api/payments', { params }),
  
  getById: (id: string) =>
    api.get(`/api/payments/${id}`),
  
  processPayment: (data: {
    sessionId: string;
    paymentMethod: string;
    amount: number;
  }) =>
    api.post('/api/payments/process', data),
  
  refundPayment: (id: string) =>
    api.post(`/api/payments/${id}/refund`),
  
  getStats: () =>
    api.get('/api/payments/stats/overview'),
};

// Analytics API
export const analyticsAPI = {
  getDashboard: () =>
    api.get('/api/analytics/dashboard'),
  
  getRevenue: (period?: string) =>
    api.get('/api/analytics/revenue', { params: { period } }),
  
  getUsage: () =>
    api.get('/api/analytics/usage'),
  
  getStationPerformance: () =>
    api.get('/api/analytics/stations/performance'),
  
  getUserBehavior: () =>
    api.get('/api/analytics/users/behavior'),
};

export default api;
