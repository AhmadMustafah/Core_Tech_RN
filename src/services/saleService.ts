import { API_CONFIG } from '@/constants';
import { API_ENDPOINTS } from '@/constants/api';
import type { Sale, SaleItem } from '@/types';
import { generateId } from '@/utils/formatters';
import { apiClient } from './api';
import { mockSales } from './mockData';

const delay = (ms = 400): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

let sales = [...mockSales];

export interface CreateSalePayload {
  customerId: string;
  customerName: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paymentStatus: Sale['paymentStatus'];
  notes?: string;
}

export const saleService = {
  async getAll(): Promise<Sale[]> {
    if (API_CONFIG.USE_MOCK) {
      await delay();
      return [...sales];
    }
    const response = await apiClient.get(API_ENDPOINTS.SALES.LIST);
    return response.data.data;
  },

  async getById(id: string): Promise<Sale> {
    if (API_CONFIG.USE_MOCK) {
      await delay();
      const sale = sales.find(s => s.id === id);
      if (!sale) throw new Error('Sale not found');
      return sale;
    }
    const response = await apiClient.get(API_ENDPOINTS.SALES.DETAIL(id));
    return response.data.data;
  },

  async create(data: CreateSalePayload): Promise<Sale> {
    if (API_CONFIG.USE_MOCK) {
      await delay();
      const sale: Sale = {
        ...data,
        id: generateId(),
        invoiceNumber: `INV-2024-${String(sales.length + 1).padStart(3, '0')}`,
        createdAt: new Date().toISOString(),
      };
      sales.unshift(sale);
      return sale;
    }
    const response = await apiClient.post(API_ENDPOINTS.SALES.CREATE, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    if (API_CONFIG.USE_MOCK) {
      await delay();
      sales = sales.filter(s => s.id !== id);
      return;
    }
    await apiClient.delete(API_ENDPOINTS.SALES.DELETE(id));
  },
};
