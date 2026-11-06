import { API_ENDPOINTS } from '@/constants/api';
import { apiClient, unwrapPaged, type PagedResult } from './api';

export type LedgerTransaction = {
  id: string;
  relatedId: string;
  type: 'Sale' | 'Purchase';
  ref: string;
  party: string;
  amount: number;
  status: 'paid' | 'pending' | 'partial' | 'received' | 'cancelled';
  timestamp: string;
};

export type TransactionQuery = {
  page?: number;
  limit?: number;
  search?: string;
  type?: 'Sale' | 'Purchase';
  status?: string;
  from?: string;
  to?: string;
  sort?: 'asc' | 'desc';
};

export const transactionService = {
  async list(params?: TransactionQuery): Promise<PagedResult<LedgerTransaction>> {
    const response = await apiClient.get(API_ENDPOINTS.TRANSACTIONS.LIST, { params });
    return unwrapPaged<LedgerTransaction>(response);
  },
};
