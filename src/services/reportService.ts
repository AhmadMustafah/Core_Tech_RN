import { API_ENDPOINTS } from '@/constants/api';
import { apiClient, unwrapData } from './api';

export const reportService = {
  async sales() {
    const response = await apiClient.get(API_ENDPOINTS.REPORTS.SALES);
    return unwrapData<{ totals: { count: number; amount: number } }>(response);
  },

  async purchases() {
    const response = await apiClient.get(API_ENDPOINTS.REPORTS.PURCHASES);
    return unwrapData<{ totals: { count: number; amount: number } }>(response);
  },

  async inventory() {
    const response = await apiClient.get(API_ENDPOINTS.REPORTS.INVENTORY);
    return unwrapData<{
      valuation: { skuCount: number; units: number; costValue: number; retailValue: number };
    }>(response);
  },
};
