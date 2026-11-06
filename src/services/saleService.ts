import { API_ENDPOINTS } from '@/constants/api';
import type { Sale, SaleItem } from '@/types';
import { apiClient, unwrapData, unwrapList, unwrapPaged, type PagedResult } from './api';

export interface CreateSalePayload {
  customerId: string;
  customerName?: string;
  items: SaleItem[];
  subtotal?: number;
  discount: number;
  tax: number;
  totalAmount?: number;
  paymentStatus: Sale['paymentStatus'];
  notes?: string;
}

export const saleService = {
  async getAll(params?: { search?: string; paymentStatus?: string; page?: number; limit?: number }): Promise<Sale[]> {
    const response = await apiClient.get(API_ENDPOINTS.SALES.LIST, { params });
    return unwrapList<Sale>(response);
  },

  async getPage(params?: {
    search?: string;
    paymentStatus?: string;
    page?: number;
    limit?: number;
  }): Promise<PagedResult<Sale>> {
    const response = await apiClient.get(API_ENDPOINTS.SALES.LIST, { params });
    return unwrapPaged<Sale>(response);
  },

  async getTransactions(): Promise<Sale[]> {
    const response = await apiClient.get(API_ENDPOINTS.TRANSACTIONS.LIST);
    return unwrapList<Sale>(response);
  },

  async getById(id: string): Promise<Sale> {
    const response = await apiClient.get(API_ENDPOINTS.SALES.DETAIL(id));
    return unwrapData<Sale>(response);
  },

  async create(data: CreateSalePayload): Promise<Sale> {
    const response = await apiClient.post(API_ENDPOINTS.SALES.CREATE, {
      customerId: data.customerId,
      items: data.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount,
        tax: item.tax,
      })),
      discount: data.discount,
      tax: data.tax,
      paymentStatus: data.paymentStatus,
      notes: data.notes,
    });
    return unwrapData<Sale>(response);
  },

  async updatePayment(id: string, paymentStatus: Sale['paymentStatus']): Promise<Sale> {
    const response = await apiClient.put(API_ENDPOINTS.SALES.UPDATE(id), { paymentStatus });
    return unwrapData<Sale>(response);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.SALES.DELETE(id));
  },
};
