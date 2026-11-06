import { API_ENDPOINTS } from '@/constants/api';
import type { Product } from '@/types';
import { apiClient, unwrapData, unwrapList } from './api';

export const productService = {
  async getAll(params?: { search?: string; category?: string }): Promise<Product[]> {
    const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.LIST, { params });
    return unwrapList<Product>(response);
  },

  async getById(id: string): Promise<Product> {
    const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.DETAIL(id));
    return unwrapData<Product>(response);
  },

  async create(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const response = await apiClient.post(API_ENDPOINTS.PRODUCTS.CREATE, data);
    return unwrapData<Product>(response);
  },

  async update(id: string, data: Partial<Product>): Promise<Product> {
    const response = await apiClient.put(API_ENDPOINTS.PRODUCTS.UPDATE(id), data);
    return unwrapData<Product>(response);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.PRODUCTS.DELETE(id));
  },

  async getCategories(): Promise<{ id: string; name: string }[]> {
    const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.CATEGORIES);
    return unwrapList<{ id: string; name: string }>(response);
  },

  async getUnits(): Promise<string[]> {
    const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.UNITS);
    const data = unwrapData<string[]>(response);
    return Array.isArray(data) ? data : [];
  },

  async createCategory(name: string): Promise<{ id: string; name: string }> {
    const response = await apiClient.post(API_ENDPOINTS.CATEGORIES.CREATE, { name });
    return unwrapData<{ id: string; name: string }>(response);
  },
};
