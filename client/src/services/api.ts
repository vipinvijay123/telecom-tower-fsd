import axios from 'axios';
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// ─── Request Interceptor — attach JWT token ────────────────────────────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('ttms_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor — handle 401 ────────────────────────────────────────
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ttms_token');
      localStorage.removeItem('ttms_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// ─── API Service Functions ─────────────────────────────────────────────────────

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (name: string, email: string, password: string, role?: string) =>
    api.post('/auth/register', { name, email, password, role }),
  getMe: () => api.get('/auth/me'),
  getUsers: () => api.get('/auth/users'),
};

// Dashboard
export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  getRecent: () => api.get('/dashboard/recent'),
};

// Towers
export const towersApi = {
  getAll: (params?: Record<string, string>) => api.get('/towers', { params }),
  getById: (id: string) => api.get(`/towers/${id}`),
  create: (data: unknown) => api.post('/towers', data),
  update: (id: string, data: unknown) => api.put(`/towers/${id}`, data),
  delete: (id: string) => api.delete(`/towers/${id}`),
};

// Assets
export const assetsApi = {
  getAll: (params?: Record<string, string>) => api.get('/assets', { params }),
  getById: (id: string) => api.get(`/assets/${id}`),
  create: (data: unknown) => api.post('/assets', data),
  update: (id: string, data: unknown) => api.put(`/assets/${id}`, data),
  delete: (id: string) => api.delete(`/assets/${id}`),
};

// Power Systems
export const powerSystemsApi = {
  getAll: (params?: Record<string, string>) => api.get('/power-systems', { params }),
  getById: (id: string) => api.get(`/power-systems/${id}`),
  create: (data: unknown) => api.post('/power-systems', data),
  update: (id: string, data: unknown) => api.put(`/power-systems/${id}`, data),
  delete: (id: string) => api.delete(`/power-systems/${id}`),
};

// Batteries
export const batteriesApi = {
  getAll: (params?: Record<string, string>) => api.get('/batteries', { params }),
  getById: (id: string) => api.get(`/batteries/${id}`),
  create: (data: unknown) => api.post('/batteries', data),
  update: (id: string, data: unknown) => api.put(`/batteries/${id}`, data),
  delete: (id: string) => api.delete(`/batteries/${id}`),
};

// Inspections
export const inspectionsApi = {
  getAll: (params?: Record<string, string>) => api.get('/inspections', { params }),
  getById: (id: string) => api.get(`/inspections/${id}`),
  create: (data: unknown) => api.post('/inspections', data),
  update: (id: string, data: unknown) => api.put(`/inspections/${id}`, data),
  delete: (id: string) => api.delete(`/inspections/${id}`),
};

// Maintenance
export const maintenanceApi = {
  getAll: (params?: Record<string, string>) => api.get('/maintenance', { params }),
  getById: (id: string) => api.get(`/maintenance/${id}`),
  create: (data: unknown) => api.post('/maintenance', data),
  update: (id: string, data: unknown) => api.put(`/maintenance/${id}`, data),
  delete: (id: string) => api.delete(`/maintenance/${id}`),
};

// Outages
export const outagesApi = {
  getAll: (params?: Record<string, string>) => api.get('/outages', { params }),
  getById: (id: string) => api.get(`/outages/${id}`),
  create: (data: unknown) => api.post('/outages', data),
  update: (id: string, data: unknown) => api.put(`/outages/${id}`, data),
  delete: (id: string) => api.delete(`/outages/${id}`),
};

// Alerts
export const alertsApi = {
  getAll: (params?: Record<string, string>) => api.get('/alerts', { params }),
  getById: (id: string) => api.get(`/alerts/${id}`),
  create: (data: unknown) => api.post('/alerts', data),
  update: (id: string, data: unknown) => api.put(`/alerts/${id}`, data),
  delete: (id: string) => api.delete(`/alerts/${id}`),
};

// Technicians
export const techniciansApi = {
  getAll: (params?: Record<string, string>) => api.get('/technicians', { params }),
  getById: (id: string) => api.get(`/technicians/${id}`),
  create: (data: unknown) => api.post('/technicians', data),
  update: (id: string, data: unknown) => api.put(`/technicians/${id}`, data),
  delete: (id: string) => api.delete(`/technicians/${id}`),
};
