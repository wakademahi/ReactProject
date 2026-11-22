import api from './axios';
import type { LoginResponse } from '../types';
import axios from 'axios';

export const loginApi = async (username: string, password: string) => {
  const { data } = await api.post<LoginResponse>('/auth/login', {
    username,
    password,
    expiresInMins: 60, // short expiry so you can test refresh quickly; use 60 later
  });
  return data;
};

export const refreshApi = async () => {
  const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
    refreshToken: localStorage.getItem('refreshToken'),
    expiresInMins: 60,
  });
  localStorage.setItem('token', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  return data.accessToken as string;
};

export const getMe = async () => (await api.get('/auth/me')).data;