import { API_CONFIG } from '@/constants';
import { API_ENDPOINTS } from '@/constants/api';
import type { AuthTokens, LoginRequest, RegisterRequest, User } from '@/types';
import { storage } from '@/utils/storage';
import { STORAGE_KEYS } from '@/constants';
import { apiClient, getErrorMessage } from './api';
import {
  MOCK_CREDENTIALS,
  MOCK_OTP,
  mockUser,
} from './mockData';

const delay = (ms = 500): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

const mockTokens: AuthTokens = {
  accessToken: 'mock_access_token_' + Date.now(),
  refreshToken: 'mock_refresh_token_' + Date.now(),
};

export const authService = {
  async login(credentials: LoginRequest): Promise<{ user: User; tokens: AuthTokens }> {
    if (API_CONFIG.USE_MOCK) {
      await delay();
      if (
        credentials.email !== MOCK_CREDENTIALS.email ||
        credentials.password !== MOCK_CREDENTIALS.password
      ) {
        throw new Error('Invalid email or password');
      }
      return { user: mockUser, tokens: mockTokens };
    }
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    return response.data.data;
  },

  async register(data: RegisterRequest): Promise<{ user: User; tokens: AuthTokens }> {
    if (API_CONFIG.USE_MOCK) {
      await delay();
      const user: User = {
        id: Date.now().toString(),
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        role: 'Admin',
        createdAt: new Date().toISOString(),
      };
      return { user, tokens: mockTokens };
    }
    const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, data);
    return response.data.data;
  },

  async forgotPassword(email: string): Promise<void> {
    if (API_CONFIG.USE_MOCK) {
      await delay();
      if (!email) throw new Error('Email is required');
      return;
    }
    await apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
  },

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    if (API_CONFIG.USE_MOCK) {
      await delay();
      if (otp !== MOCK_OTP) throw new Error('Invalid OTP. Use 123456 for demo.');
      return true;
    }
    const response = await apiClient.post(API_ENDPOINTS.AUTH.VERIFY_OTP, { email, otp });
    return response.data.data.verified;
  },

  async resetPassword(email: string, otp: string, password: string): Promise<void> {
    if (API_CONFIG.USE_MOCK) {
      await delay();
      if (otp !== MOCK_OTP) throw new Error('Invalid OTP');
      return;
    }
    await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { email, otp, password });
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    if (API_CONFIG.USE_MOCK) {
      await delay();
      if (currentPassword !== MOCK_CREDENTIALS.password) {
        throw new Error('Current password is incorrect');
      }
      return;
    }
    await apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      currentPassword,
      newPassword,
    });
  },

  async getProfile(): Promise<User> {
    if (API_CONFIG.USE_MOCK) {
      await delay(300);
      const stored = await storage.getItem<User>(STORAGE_KEYS.USER);
      return stored || mockUser;
    }
    const response = await apiClient.get(API_ENDPOINTS.AUTH.PROFILE);
    return response.data.data;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    if (API_CONFIG.USE_MOCK) {
      await delay();
      const stored = await storage.getItem<User>(STORAGE_KEYS.USER);
      const updated = { ...(stored || mockUser), ...data };
      await storage.setItem(STORAGE_KEYS.USER, updated);
      return updated;
    }
    const response = await apiClient.put(API_ENDPOINTS.AUTH.PROFILE, data);
    return response.data.data;
  },

  async logout(): Promise<void> {
    if (!API_CONFIG.USE_MOCK) {
      try {
        await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
      } catch {
        // Continue logout even if API fails
      }
    }
  },

  getErrorMessage,
};
