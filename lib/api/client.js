import axios from 'axios';
import { clearSession, getToken } from '../session';

const api = axios.create({
  baseURL: 'https://dummyjson.com',
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') clearSession();
    const message = error.response?.data?.message || error.response?.data?.error || error.message || 'Something went wrong.';
    return Promise.reject(new Error(message));
  },
);

export default api;
