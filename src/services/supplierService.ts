import { API_CONFIG } from '@/constants';
import { API_ENDPOINTS } from '@/constants/api';
import type { Supplier } from '@/types';
import { generateId } from '@/utils/formatters';
import { mockDelay, MOCK_WRITE_DELAY } from '@/utils/mockDelay';
import { apiClient } from './api';
import { mockSuppliers } from './mockData';
import { activityService } from './activityService';

let suppliers = [...mockSuppliers];

export const supplierService = {
  async getAll(): Promise<Supplier[]> {
    if (API_CONFIG.USE_MOCK) {
      await mockDelay();
      return [...suppliers];
    }
    const response = await apiClient.get(API_ENDPOINTS.SUPPLIERS.LIST);
    return response.data.data;
  },

  async getById(id: string): Promise<Supplier> {
    if (API_CONFIG.USE_MOCK) {
      await mockDelay();
      const supplier = suppliers.find(s => s.id === id);
      if (!supplier) throw new Error('Supplier not found');
      return supplier;
    }
    const response = await apiClient.get(API_ENDPOINTS.SUPPLIERS.DETAIL(id));
    return response.data.data;
  },

  async create(data: Omit<Supplier, 'id' | 'createdAt'>): Promise<Supplier> {
    if (API_CONFIG.USE_MOCK) {
      await mockDelay(MOCK_WRITE_DELAY);
      const supplier: Supplier = {
        ...data,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      suppliers.push(supplier);
      void activityService.recordSupplierSaved(supplier, true);
      return supplier;
    }
    const response = await apiClient.post(API_ENDPOINTS.SUPPLIERS.CREATE, data);
    return response.data.data;
  },

  async update(id: string, data: Partial<Supplier>): Promise<Supplier> {
    if (API_CONFIG.USE_MOCK) {
      await mockDelay(MOCK_WRITE_DELAY);
      const index = suppliers.findIndex(s => s.id === id);
      if (index === -1) throw new Error('Supplier not found');
      suppliers[index] = { ...suppliers[index], ...data };
      void activityService.recordSupplierSaved(suppliers[index], false);
      return suppliers[index];
    }
    const response = await apiClient.put(API_ENDPOINTS.SUPPLIERS.UPDATE(id), data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    if (API_CONFIG.USE_MOCK) {
      await mockDelay(MOCK_WRITE_DELAY);
      suppliers = suppliers.filter(s => s.id !== id);
      return;
    }
    await apiClient.delete(API_ENDPOINTS.SUPPLIERS.DELETE(id));
  },
};
