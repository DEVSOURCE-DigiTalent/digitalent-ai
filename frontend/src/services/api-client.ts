import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { getLoginPath } from '../features/auth/auth-redirect';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Frontend-first: with VITE_USE_MOCK=true the REST calls are answered by the mock server (services/mock/server)
// instead of the network, so every service and page works unchanged. The check is inline so that a production
// build drops the import together with all the mock data.
if (import.meta.env.VITE_USE_MOCK === 'true') {
  apiClient.defaults.adapter = (config) => import('./mock/server/mock-adapter').then((module) => module.mockAdapter(config));
}

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface RetryableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let refreshRequest: Promise<string> | null = null;

function clearSessionAndRedirect() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  if (window.location.pathname !== '/login') {
    window.location.href = getLoginPath(window.location.pathname, window.location.search);
  }
}

async function refreshAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) throw new Error('No refresh token is available.');

  const response = await apiClient.post('/auth/refresh', { refreshToken }, { headers: { Authorization: undefined } });
  const tokens = response.data?.data;
  if (!tokens?.accessToken || !tokens?.refreshToken) throw new Error('The refresh response is incomplete.');
  localStorage.setItem('accessToken', tokens.accessToken);
  localStorage.setItem('refreshToken', tokens.refreshToken);
  return tokens.accessToken as string;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const request = error.config as RetryableRequest | undefined;
    const isRefreshRequest = request?.url === '/auth/refresh';
    const isLoginRequest = request?.url === '/auth/login';
    const hasRefreshToken = Boolean(localStorage.getItem('refreshToken'));
    if (error.response?.status === 401 && isLoginRequest) return Promise.reject(error);
    if (error.response?.status === 401 && !hasRefreshToken && !isRefreshRequest) {
      clearSessionAndRedirect();
      return Promise.reject(error);
    }
    if (error.response?.status !== 401 || !request || request._retry || isRefreshRequest) {
      if (error.response?.status === 401 && isRefreshRequest) clearSessionAndRedirect();
      return Promise.reject(error);
    }

    request._retry = true;
    try {
      refreshRequest ??= refreshAccessToken().finally(() => {
        refreshRequest = null;
      });
      const accessToken = await refreshRequest;
      request.headers.Authorization = `Bearer ${accessToken}`;
      return apiClient(request);
    } catch (refreshError) {
      clearSessionAndRedirect();
      return Promise.reject(refreshError);
    }
  }
);

export default apiClient;
