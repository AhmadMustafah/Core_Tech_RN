import { API_ENDPOINTS } from '@/constants/api';
import type { Supplier } from '@/types';
import { apiClient, unwrapData, unwrapList } from './api';

export const supplierService = {
  async getAll(search?: string): Promise<Supplier[]> {
    const response = await apiClient.get(API_ENDPOINTS.SUPPLIERS.LIST, {
      params: { search },
    });
    return unwrapList<Supplier>(response);
  },

  async getById(id: string): Promise<Supplier> {
    const response = await apiClient.get(API_ENDPOINTS.SUPPLIERS.DETAIL(id));
    return unwrapData<Supplier>(response);
  },

  async create(data: Omit<Supplier, 'id' | 'createdAt' | 'totalPurchases'>): Promise<Supplier> {
    const response = await apiClient.post(API_ENDPOINTS.SUPPLIERS.CREATE, data);
    return unwrapData<Supplier>(response);
  },

  async update(id: string, data: Partial<Supplier>): Promise<Supplier> {
    const response = await apiClient.put(API_ENDPOINTS.SUPPLIERS.UPDATE(id), data);
    return unwrapData<Supplier>(response);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.SUPPLIERS.DELETE(id));
  },
};
