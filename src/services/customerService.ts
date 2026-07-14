import { API_CONFIG } from '@/constants';
import { API_ENDPOINTS } from '@/constants/api';
import type { Customer } from '@/types';
import { generateId } from '@/utils/formatters';
import { apiClient } from './api';
import { mockCustomers } from './mockData';

const delay = (ms = 400): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

let customers = [...mockCustomers];

export const customerService = {
  async getAll(search?: string): Promise<Customer[]> {
    if (API_CONFIG.USE_MOCK) {
      await delay();
      if (!search) return [...customers];
      const q = search.toLowerCase();
      return customers.filter(
        c =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.includes(q),
      );
    }
    const response = await apiClient.get(API_ENDPOINTS.CUSTOMERS.LIST, {
      params: { search },
    });
    return response.data.data;
  },

  async getById(id: string): Promise<Customer> {
    if (API_CONFIG.USE_MOCK) {
      await delay();
      const customer = customers.find(c => c.id === id);
      if (!customer) throw new Error('Customer not found');
      return customer;
    }
    const response = await apiClient.get(API_ENDPOINTS.CUSTOMERS.DETAIL(id));
    return response.data.data;
  },

  async create(data: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> {
    if (API_CONFIG.USE_MOCK) {
      await delay();
      const customer: Customer = {
        ...data,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      customers.push(customer);
      return customer;
    }
    const response = await apiClient.post(API_ENDPOINTS.CUSTOMERS.CREATE, data);
    return response.data.data;
  },

  async update(id: string, data: Partial<Customer>): Promise<Customer> {
    if (API_CONFIG.USE_MOCK) {
      await delay();
      const index = customers.findIndex(c => c.id === id);
      if (index === -1) throw new Error('Customer not found');
      customers[index] = { ...customers[index], ...data };
      return customers[index];
    }
    const response = await apiClient.put(API_ENDPOINTS.CUSTOMERS.UPDATE(id), data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    if (API_CONFIG.USE_MOCK) {
      await delay();
      customers = customers.filter(c => c.id !== id);
      return;
    }
    await apiClient.delete(API_ENDPOINTS.CUSTOMERS.DELETE(id));
  },
};
