import { API_ENDPOINTS } from '@/constants/api';
import type { AuthTokens, LoginRequest, RegisterRequest, User } from '@/types';
import { tokenStorage } from '@/utils/storage';
import { apiClient, getErrorMessage, unwrapData } from './api';

type AuthResult = { user: User; tokens: AuthTokens };

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResult> {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    return unwrapData<AuthResult>(response);
  },

  async register(data: RegisterRequest): Promise<AuthResult> {
    const { confirmPassword: _confirm, ...payload } = data;
    const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, payload);
    return unwrapData<AuthResult>(response);
  },

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
  },

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.VERIFY_OTP, { email, otp });
    return Boolean(unwrapData<{ verified?: boolean }>(response)?.verified);
  },

  async resetPassword(email: string, otp: string, password: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { email, otp, password });
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      currentPassword,
      newPassword,
    });
  },

  async getProfile(): Promise<User> {
    const response = await apiClient.get(API_ENDPOINTS.AUTH.ME);
    return unwrapData<User>(response);
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await apiClient.put(API_ENDPOINTS.AUTH.PROFILE, data);
    return unwrapData<User>(response);
  },

  async logout(): Promise<void> {
    const tokens = await tokenStorage.getTokens();
    if (!tokens?.refreshToken) {
      return;
    }
    await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, {
      refreshToken: tokens.refreshToken,
    });
  },

  getErrorMessage,
};
