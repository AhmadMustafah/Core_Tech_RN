import { API_CONFIG } from '@/constants';
import { API_ENDPOINTS } from '@/constants/api';
import type { AppNotification } from '@/types';
import { apiClient } from './api';
import { mockNotifications } from './mockData';

const delay = (ms = 400): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

let notifications = [...mockNotifications];
const listeners = new Set<() => void>();

const notifyListeners = () => {
  listeners.forEach(listener => listener());
};

export const notificationService = {
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  getUnreadCount(): number {
    return notifications.filter(item => !item.read).length;
  },
  async getAll(): Promise<AppNotification[]> {
    if (API_CONFIG.USE_MOCK) {
      await delay();
      return [...notifications];
    }
    const response = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS.LIST);
    notifications = response.data.data;
    notifyListeners();
    return [...notifications];
  },

  async getById(id: string): Promise<AppNotification> {
    if (API_CONFIG.USE_MOCK) {
      await delay();
      const item = notifications.find(n => n.id === id);
      if (!item) throw new Error('Notification not found');
      return item;
    }
    const response = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS.LIST);
    const item = (response.data.data as AppNotification[]).find(n => n.id === id);
    if (!item) throw new Error('Notification not found');
    return item;
  },

  async markAsRead(id: string): Promise<void> {
    if (API_CONFIG.USE_MOCK) {
      await delay(200);
      notifications = notifications.map(n =>
        n.id === id ? { ...n, read: true } : n,
      );
      notifyListeners();
      return;
    }
    await apiClient.post(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
    notifications = notifications.map(n =>
      n.id === id ? { ...n, read: true } : n,
    );
    notifyListeners();
  },

  async markAllAsRead(): Promise<void> {
    if (API_CONFIG.USE_MOCK) {
      await delay(200);
      notifications = notifications.map(n => ({ ...n, read: true }));
      notifyListeners();
      return;
    }
    await apiClient.post(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
    notifications = notifications.map(n => ({ ...n, read: true }));
    notifyListeners();
  },
};
