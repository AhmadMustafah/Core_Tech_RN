import { API_CONFIG } from '@/constants';
import { API_ENDPOINTS } from '@/constants/api';
import type { Customer, DashboardSummary, Product, Purchase, Sale } from '@/types';
import { isLowStock } from '@/utils/formatters';
import { apiClient } from './api';
import { activityService } from './activityService';
import { customerService } from './customerService';
import { productService } from './productService';
import { purchaseService } from './purchaseService';
import { saleService } from './saleService';
import { mockDelay } from '@/utils/mockDelay';

const buildSummary = (
  sales: Sale[],
  purchases: Purchase[],
  products: Product[],
  customers: Customer[],
): DashboardSummary => ({
  totalProducts: products.length,
  totalSales: sales.length,
  totalPurchases: purchases.length,
  totalCustomers: customers.length,
  lowStockCount: products.filter(product =>
    isLowStock(product.stockQuantity, product.lowStockThreshold),
  ).length,
  salesAmount: sales.reduce((sum, sale) => sum + sale.totalAmount, 0),
  purchasesAmount: purchases.reduce((sum, purchase) => sum + purchase.totalAmount, 0),
});

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    if (API_CONFIG.USE_MOCK) {
      const [sales, purchases, products, customers] = await Promise.all([
        saleService.getAll(),
        purchaseService.getAll(),
        productService.getAll(),
        customerService.getAll(),
      ]);
      return buildSummary(sales, purchases, products, customers);
    }
    const response = await apiClient.get(API_ENDPOINTS.DASHBOARD.SUMMARY);
    return response.data.data;
  },

  async getActivities() {
    if (API_CONFIG.USE_MOCK) {
      await mockDelay();
      return activityService.getAll();
    }
    const response = await apiClient.get(API_ENDPOINTS.DASHBOARD.ACTIVITIES);
    return response.data.data;
  },
};
