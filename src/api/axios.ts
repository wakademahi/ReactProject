import axios from 'axios';
import { refreshApi } from './auth';

let refreshing: Promise<string> | null = null;

const BASE_URL = import.meta.env.VITE_API_URL ?? 'https://dummyjson.com';

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const isAuthCall =
      original?.url?.includes('/auth/login') || original?.url?.includes('/auth/refresh');

    // Try one silent token refresh before giving up
    if (status === 401 && !isAuthCall && !original._retry && localStorage.getItem('refreshToken')) {
      original._retry = true;
      try {
        refreshing ??= refreshApi().finally(() => {
          refreshing = null;
        });
        const newToken = await refreshing;
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        // refresh failed, fall through to logout
      }
    }

    // Log out only when refresh is impossible or failed
    if (status === 401 && !isAuthCall) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      if (window.location.pathname !== '/login') window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;