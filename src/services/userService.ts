import { API_ENDPOINTS } from '@/constants/api';
import type { User } from '@/types';
import { apiClient, unwrapData, unwrapList } from './api';

export const userService = {
  async getAll(): Promise<User[]> {
    const response = await apiClient.get(API_ENDPOINTS.USERS.LIST);
    return unwrapList<User>(response);
  },

  async getById(id: string): Promise<User> {
    const response = await apiClient.get(API_ENDPOINTS.USERS.DETAIL(id));
    return unwrapData<User>(response);
  },

  async getBusiness() {
    const response = await apiClient.get(API_ENDPOINTS.BUSINESS.CURRENT);
    return unwrapData<{ id: string; name: string; email?: string; phone?: string }>(response);
  },

  async create(data: {
    name: string;
    email: string;
    password: string;
    role?: string;
    phone?: string;
  }): Promise<User> {
    const response = await apiClient.post(API_ENDPOINTS.USERS.CREATE, data);
    return unwrapData<User>(response);
  },

  async updateBusiness(data: { name?: string; email?: string; phone?: string }) {
    const response = await apiClient.put(API_ENDPOINTS.BUSINESS.CURRENT, data);
    return unwrapData(response);
  },
};
