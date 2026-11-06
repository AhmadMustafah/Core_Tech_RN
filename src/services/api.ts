import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from '@/constants';
import { API_ENDPOINTS } from '@/constants/api';
import { tokenStorage } from '@/utils/storage';

let isRefreshing = false;
let failedQueue: {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

const isAuthSkipRefresh = (url?: string) =>
  Boolean(
    url &&
      (url.includes('/auth/login') ||
        url.includes('/auth/register') ||
        url.includes('/auth/refresh') ||
        url.includes('/auth/logout')),
  );

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const tokens = await tokenStorage.getTokens();
    if (tokens?.accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }
    return config;
  },
  error => Promise.reject(error),
);

apiClient.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthSkipRefresh(originalRequest.url)
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const tokens = await tokenStorage.getTokens();
        if (!tokens?.refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(
          `${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
          { refreshToken: tokens.refreshToken },
        );

        const payload = response.data?.data || {};
        const accessToken = payload.tokens?.accessToken || payload.accessToken;
        const refreshToken = payload.tokens?.refreshToken || payload.refreshToken;
        if (!accessToken || !refreshToken) {
          throw new Error('Invalid refresh response');
        }
        await tokenStorage.setTokens(accessToken, refreshToken);
        processQueue(null, accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await tokenStorage.clearTokens();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export const unwrapData = <T>(response: { data?: { data?: T } }): T => {
  return response.data?.data as T;
};

export const unwrapList = <T>(response: { data?: { data?: T[] } }): T[] => {
  const data = response.data?.data;
  return Array.isArray(data) ? data : [];
};

export type PagedResult<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

export const unwrapPaged = <T>(response: {
  data?: { data?: T[]; total?: number; page?: number; limit?: number };
}): PagedResult<T> => ({
  items: Array.isArray(response.data?.data) ? response.data.data : [],
  total: Number(response.data?.total ?? 0),
  page: Number(response.data?.page ?? 1),
  limit: Number(response.data?.limit ?? 50),
});

export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred'
    );
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};
