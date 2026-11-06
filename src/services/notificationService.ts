import { API_ENDPOINTS } from '@/constants/api';
import type { AppNotification } from '@/types';
import { apiClient, unwrapList } from './api';

export const notificationService = {
  async getAll(params?: { limit?: number; page?: number; unread?: boolean }): Promise<AppNotification[]> {
    const response = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS.LIST, { params });
    return unwrapList<AppNotification>(response);
  },

  async markAsRead(id: string): Promise<void> {
    await apiClient.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.post(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
  },
};
