import { API_CONFIG } from '@/constants';
import { API_ENDPOINTS } from '@/constants/api';
import type { AppNotification } from '@/types';
import { apiClient } from './api';
import { mockNotifications } from './mockData';

const delay = (ms = 400): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

let notifications = [...mockNotifications];

export const notificationService = {
  async getAll(): Promise<AppNotification[]> {
    if (API_CONFIG.USE_MOCK) {
      await delay();
      return [...notifications];
    }
    const response = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS.LIST);
    return response.data.data;
  },

  async markAsRead(id: string): Promise<void> {
    if (API_CONFIG.USE_MOCK) {
      await delay(200);
      notifications = notifications.map(n =>
        n.id === id ? { ...n, read: true } : n,
      );
      return;
    }
    await apiClient.post(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
  },

  async markAllAsRead(): Promise<void> {
    if (API_CONFIG.USE_MOCK) {
      await delay(200);
      notifications = notifications.map(n => ({ ...n, read: true }));
      return;
    }
    await apiClient.post(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
  },
};
