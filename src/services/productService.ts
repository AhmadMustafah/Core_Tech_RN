import { API_CONFIG } from '@/constants';
import { API_ENDPOINTS } from '@/constants/api';
import type { Product } from '@/types';
import { generateId } from '@/utils/formatters';
import { apiClient } from './api';
import { mockProducts } from './mockData';

const delay = (ms = 400): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

let products = [...mockProducts];

export const productService = {
  async getAll(params?: { search?: string; category?: string }): Promise<Product[]> {
    if (API_CONFIG.USE_MOCK) {
      await delay();
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
      await delay();
      const product = products.find(p => p.id === id);
      if (!product) throw new Error('Product not found');
      return product;
    }
    const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.DETAIL(id));
    return response.data.data;
  },

  async create(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    if (API_CONFIG.USE_MOCK) {
      await delay();
      const product: Product = {
        ...data,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      products.push(product);
      return product;
    }
    const response = await apiClient.post(API_ENDPOINTS.PRODUCTS.CREATE, data);
    return response.data.data;
  },

  async update(id: string, data: Partial<Product>): Promise<Product> {
    if (API_CONFIG.USE_MOCK) {
      await delay();
      const index = products.findIndex(p => p.id === id);
      if (index === -1) throw new Error('Product not found');
      products[index] = {
        ...products[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      return products[index];
    }
    const response = await apiClient.put(API_ENDPOINTS.PRODUCTS.UPDATE(id), data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    if (API_CONFIG.USE_MOCK) {
      await delay();
      products = products.filter(p => p.id !== id);
      return;
    }
    await apiClient.delete(API_ENDPOINTS.PRODUCTS.DELETE(id));
  },
};
