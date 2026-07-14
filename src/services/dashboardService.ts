import { API_CONFIG } from '@/constants';
import { API_ENDPOINTS } from '@/constants/api';
import type { Activity, DashboardSummary } from '@/types';
import { apiClient } from './api';
import { mockActivities, mockDashboardSummary } from './mockData';

const delay = (ms = 400): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    if (API_CONFIG.USE_MOCK) {
      await delay();
      return mockDashboardSummary;
    }
    const response = await apiClient.get(API_ENDPOINTS.DASHBOARD.SUMMARY);
    return response.data.data;
  },

  async getActivities(): Promise<Activity[]> {
    if (API_CONFIG.USE_MOCK) {
      await delay();
      return mockActivities;
    }
    const response = await apiClient.get(API_ENDPOINTS.DASHBOARD.ACTIVITIES);
    return response.data.data;
  },
};
