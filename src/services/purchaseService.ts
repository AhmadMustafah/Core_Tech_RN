import { API_ENDPOINTS } from '@/constants/api';
import type { Purchase, PurchaseItem } from '@/types';
import { apiClient, unwrapData, unwrapList, unwrapPaged, type PagedResult } from './api';

export interface CreatePurchasePayload {
  supplierId: string;
  supplierName?: string;
  items: PurchaseItem[];
  totalAmount?: number;
  notes?: string;
  status?: Purchase['status'];
}

export const purchaseService = {
  async getAll(params?: { search?: string; status?: string; page?: number; limit?: number }): Promise<Purchase[]> {
    const response = await apiClient.get(API_ENDPOINTS.PURCHASES.LIST, { params });
    return unwrapList<Purchase>(response);
  },

  async getPage(params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PagedResult<Purchase>> {
    const response = await apiClient.get(API_ENDPOINTS.PURCHASES.LIST, { params });
    return unwrapPaged<Purchase>(response);
  },

  async getById(id: string): Promise<Purchase> {
    if (!id) {
      throw new Error('Purchase id is required');
    }
    const response = await apiClient.get(API_ENDPOINTS.PURCHASES.DETAIL(id));
    return unwrapData<Purchase>(response);
  },

  async create(data: CreatePurchasePayload): Promise<Purchase> {
    const response = await apiClient.post(API_ENDPOINTS.PURCHASES.CREATE, {
      supplierId: data.supplierId,
      items: data.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        purchasePrice: item.purchasePrice,
      })),
      notes: data.notes,
      status: data.status || 'received',
    });
    return unwrapData<Purchase>(response);
  },

  async receive(id: string): Promise<Purchase> {
    const response = await apiClient.post(API_ENDPOINTS.PURCHASES.RECEIVE(id));
    return unwrapData<Purchase>(response);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.PURCHASES.DELETE(id));
  },
};
