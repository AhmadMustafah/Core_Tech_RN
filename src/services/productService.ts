import { API_CONFIG } from '@/constants';
import { API_ENDPOINTS } from '@/constants/api';
import type { Product } from '@/types';
import { generateId } from '@/utils/formatters';
import { mockDelay, MOCK_WRITE_DELAY } from '@/utils/mockDelay';
import { apiClient } from './api';
import { mockProducts } from './mockData';
import { activityService } from './activityService';

let products = [...mockProducts];

export const productService = {
  async getAll(params?: { search?: string; category?: string }): Promise<Product[]> {
    if (API_CONFIG.USE_MOCK) {
      await mockDelay();
      let result = [...products];
      if (params?.search) {
        const q = params.search.toLowerCase();
        result = result.filter(
          p =>
            p.name.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q),
        );
      }
      if (params?.category) {
        result = result.filter(p => p.category === params.category);
      }
      return result;
    }
    const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.LIST, { params });
    return response.data.data;
  },

  async getById(id: string): Promise<Product> {
    if (API_CONFIG.USE_MOCK) {
      await mockDelay();
      const product = products.find(p => p.id === id);
      if (!product) throw new Error('Product not found');
      return product;
    }
    const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.DETAIL(id));
    return response.data.data;
  },

  async create(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    if (API_CONFIG.USE_MOCK) {
      await mockDelay(MOCK_WRITE_DELAY);
      const product: Product = {
        ...data,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      products.push(product);
      void activityService.recordProductSaved(product, true);
      return product;
    }
    const response = await apiClient.post(API_ENDPOINTS.PRODUCTS.CREATE, data);
    return response.data.data;
  },

  async update(id: string, data: Partial<Product>): Promise<Product> {
    if (API_CONFIG.USE_MOCK) {
      await mockDelay(MOCK_WRITE_DELAY);
      const index = products.findIndex(p => p.id === id);
      if (index === -1) throw new Error('Product not found');
      const previousStock = products[index].stockQuantity;
      products[index] = {
        ...products[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      void activityService.recordProductSaved(products[index], false, previousStock);
      return products[index];
    }
    const response = await apiClient.put(API_ENDPOINTS.PRODUCTS.UPDATE(id), data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    if (API_CONFIG.USE_MOCK) {
      await mockDelay(MOCK_WRITE_DELAY);
      products = products.filter(p => p.id !== id);
      return;
    }
    await apiClient.delete(API_ENDPOINTS.PRODUCTS.DELETE(id));
  },
};
