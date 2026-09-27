import axios, { AxiosError } from 'axios';
import { getLoginPath } from '../features/auth/auth-redirect';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Backend chưa có refresh token: token hết hạn / sai (401) → xóa token và về trang đăng nhập.
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      if (window.location.pathname !== '/login') {
        window.location.href = getLoginPath(window.location.pathname, window.location.search);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
