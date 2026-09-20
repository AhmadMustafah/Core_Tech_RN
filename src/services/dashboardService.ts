import { API_CONFIG } from '@/constants';
import { API_ENDPOINTS } from '@/constants/api';
import type { DashboardSummary } from '@/types';
import { apiClient } from './api';
import { mockDashboardSummary } from './mockData';
import { activityService } from './activityService';
import { mockDelay } from '@/utils/mockDelay';

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    if (API_CONFIG.USE_MOCK) {
      await mockDelay();
      return mockDashboardSummary;
    }
    const response = await apiClient.get(API_ENDPOINTS.DASHBOARD.SUMMARY);
    return response.data.data;
  },

  async getActivities() {
    if (API_CONFIG.USE_MOCK) {
      await mockDelay();
      return activityService.getAll();
    }
    const response = await apiClient.get(API_ENDPOINTS.DASHBOARD.ACTIVITIES);
    return response.data.data;
  },
};
