import { API_CONFIG } from '@/constants';
import { API_ENDPOINTS } from '@/constants/api';
import type { Purchase, PurchaseItem } from '@/types';
import { generateId } from '@/utils/formatters';
import { mockDelay, MOCK_WRITE_DELAY } from '@/utils/mockDelay';
import { apiClient } from './api';
import { mockPurchases } from './mockData';
import { activityService } from './activityService';

let purchases = [...mockPurchases];

export interface CreatePurchasePayload {
  supplierId: string;
  supplierName: string;
  items: PurchaseItem[];
  totalAmount: number;
  notes?: string;
}

export const purchaseService = {
  async getAll(): Promise<Purchase[]> {
    if (API_CONFIG.USE_MOCK) {
      await mockDelay();
      return [...purchases];
    }
    const response = await apiClient.get(API_ENDPOINTS.PURCHASES.LIST);
    return response.data.data;
  },

  async getById(id: string): Promise<Purchase> {
    if (API_CONFIG.USE_MOCK) {
      await mockDelay();
      const purchase = purchases.find(s => s.id === id);
      if (!purchase) throw new Error('Purchase not found');
      return purchase;
    }
    const response = await apiClient.get(API_ENDPOINTS.PURCHASES.DETAIL(id));
    return response.data.data;
  },

  async create(data: CreatePurchasePayload): Promise<Purchase> {
    if (API_CONFIG.USE_MOCK) {
      await mockDelay(MOCK_WRITE_DELAY);
      const purchase: Purchase = {
        ...data,
        id: generateId(),
        purchaseNumber: `PO-2024-${String(purchases.length + 1).padStart(3, '0')}`,
        createdAt: new Date().toISOString(),
      };
      purchases.unshift(purchase);
      void activityService.recordPurchaseCreated(purchase);
      return purchase;
    }
    const response = await apiClient.post(API_ENDPOINTS.PURCHASES.CREATE, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    if (API_CONFIG.USE_MOCK) {
      await mockDelay(MOCK_WRITE_DELAY);
      purchases = purchases.filter(s => s.id !== id);
      return;
    }
    await apiClient.delete(API_ENDPOINTS.PURCHASES.DELETE(id));
  },
};
