import { API_ENDPOINTS } from '@/constants/api';
import type { Customer } from '@/types';
import { apiClient, unwrapData, unwrapList } from './api';

export const customerService = {
  async getAll(search?: string): Promise<Customer[]> {
    const response = await apiClient.get(API_ENDPOINTS.CUSTOMERS.LIST, {
      params: { search },
    });
    return unwrapList<Customer>(response);
  },

  async getById(id: string): Promise<Customer> {
    const response = await apiClient.get(API_ENDPOINTS.CUSTOMERS.DETAIL(id));
    return unwrapData<Customer>(response);
  },

  async create(data: Omit<Customer, 'id' | 'createdAt' | 'totalPurchases'>): Promise<Customer> {
    const response = await apiClient.post(API_ENDPOINTS.CUSTOMERS.CREATE, data);
    return unwrapData<Customer>(response);
  },

  async update(id: string, data: Partial<Customer>): Promise<Customer> {
    const response = await apiClient.put(API_ENDPOINTS.CUSTOMERS.UPDATE(id), data);
    return unwrapData<Customer>(response);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.CUSTOMERS.DELETE(id));
  },
};
