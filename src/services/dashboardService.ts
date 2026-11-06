import { API_ENDPOINTS } from '@/constants/api';
import type { Activity, DashboardSummary } from '@/types';
import { apiClient, unwrapData, unwrapPaged, type PagedResult } from './api';

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    const response = await apiClient.get(API_ENDPOINTS.DASHBOARD.SUMMARY);
    return unwrapData<DashboardSummary>(response);
  },

  async getActivities(params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
  }): Promise<PagedResult<Activity>> {
    const response = await apiClient.get(API_ENDPOINTS.DASHBOARD.ACTIVITIES, { params });
    return unwrapPaged<Activity>(response);
  },
};
