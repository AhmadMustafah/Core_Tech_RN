import { API_CONFIG } from '@/constants';
import { API_ENDPOINTS } from '@/constants/api';
import type { Supplier } from '@/types';
import { generateId } from '@/utils/formatters';
import { apiClient } from './api';
import { mockSuppliers } from './mockData';

const delay = (ms = 400): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

let suppliers = [...mockSuppliers];

export const supplierService = {
  async getAll(): Promise<Supplier[]> {
    if (API_CONFIG.USE_MOCK) {
      await delay();
      return [...suppliers];
    }
    const response = await apiClient.get(API_ENDPOINTS.SUPPLIERS.LIST);
    return response.data.data;
  },

  async getById(id: string): Promise<Supplier> {
    if (API_CONFIG.USE_MOCK) {
      await delay();
      const supplier = suppliers.find(s => s.id === id);
      if (!supplier) throw new Error('Supplier not found');
      return supplier;
    }
    const response = await apiClient.get(API_ENDPOINTS.SUPPLIERS.DETAIL(id));
    return response.data.data;
  },

  async create(data: Omit<Supplier, 'id' | 'createdAt'>): Promise<Supplier> {
    if (API_CONFIG.USE_MOCK) {
      await delay();
      const supplier: Supplier = {
        ...data,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      suppliers.push(supplier);
      return supplier;
    }
    const response = await apiClient.post(API_ENDPOINTS.SUPPLIERS.CREATE, data);
    return response.data.data;
  },

  async update(id: string, data: Partial<Supplier>): Promise<Supplier> {
    if (API_CONFIG.USE_MOCK) {
      await delay();
      const index = suppliers.findIndex(s => s.id === id);
      if (index === -1) throw new Error('Supplier not found');
      suppliers[index] = { ...suppliers[index], ...data };
      return suppliers[index];
    }
    const response = await apiClient.put(API_ENDPOINTS.SUPPLIERS.UPDATE(id), data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    if (API_CONFIG.USE_MOCK) {
      await delay();
      suppliers = suppliers.filter(s => s.id !== id);
      return;
    }
    await apiClient.delete(API_ENDPOINTS.SUPPLIERS.DELETE(id));
  },
};
