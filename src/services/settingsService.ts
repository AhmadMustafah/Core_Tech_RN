import { API_ENDPOINTS } from '@/constants/api';
import { apiClient, unwrapData } from './api';

export type BackendSettings = {
  id?: string;
  themeMode?: 'light' | 'dark';
  themePreset?: string;
  language?: 'en' | 'ur';
  notificationsEnabled?: boolean;
  dateFormat?: 'dmy' | 'mdy' | 'ymd';
  currencyDisplay?: 'symbol' | 'code';
  sessionTimeout?: '15' | '30' | '60';
  lowStockAlerts?: boolean;
};

export const settingsService = {
  async get(): Promise<BackendSettings> {
    const response = await apiClient.get(API_ENDPOINTS.SETTINGS.GET);
    return unwrapData<BackendSettings>(response);
  },

  async update(data: Partial<BackendSettings>): Promise<BackendSettings> {
    const response = await apiClient.put(API_ENDPOINTS.SETTINGS.UPDATE, data);
    return unwrapData<BackendSettings>(response);
  },
};
