import { API_ENDPOINTS } from '@/constants/api';
import { apiClient, unwrapData, unwrapList } from './api';

export type StockMovement = {
  id: string;
  productId: string;
  type: string;
  direction: 'in' | 'out';
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  note?: string;
  createdAt: string;
};

export const inventoryService = {
  async getMovements(productId?: string): Promise<StockMovement[]> {
    const response = await apiClient.get(API_ENDPOINTS.INVENTORY.MOVEMENTS, {
      params: productId ? { productId } : undefined,
    });
    return unwrapList<StockMovement>(response);
  },

  async adjust(payload: {
    productId: string;
    direction: 'in' | 'out';
    quantity: number;
    note?: string;
  }) {
    const response = await apiClient.post(API_ENDPOINTS.INVENTORY.ADJUST, payload);
    return unwrapData(response);
  },
};
