import type { Product, Purchase, Sale } from '@/types';
import { isLowStock } from './formatters';

export type WorkspaceTransaction = {
  id: string;
  sourceId: string;
  type: 'sale' | 'purchase';
  ref: string;
  party: string;
  amount: number;
  status: Sale['paymentStatus'] | 'recorded';
  timestamp: string;
};

export type WorkspaceAlert = {
  id: string;
  kind: 'low_stock' | 'payment';
  severity: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  productName?: string;
  sku?: string;
  quantity?: number;
  threshold?: number;
  reference?: string;
  partyName?: string;
  amount?: number;
  status?: string;
  relatedType: 'product' | 'sale';
  relatedId: string;
};

export const buildTransactions = (
  sales: Sale[],
  purchases: Purchase[],
): WorkspaceTransaction[] => {
  const saleRows: WorkspaceTransaction[] = sales.map(sale => ({
    id: `sale-${sale.id}`,
    sourceId: sale.id,
    type: 'sale',
    ref: sale.invoiceNumber,
    party: sale.customerName,
    amount: sale.totalAmount,
    status: sale.paymentStatus,
    timestamp: sale.createdAt,
  }));

  const purchaseRows: WorkspaceTransaction[] = purchases.map(purchase => ({
    id: `purchase-${purchase.id}`,
    sourceId: purchase.id,
    type: 'purchase',
    ref: purchase.purchaseNumber,
    party: purchase.supplierName,
    amount: purchase.totalAmount,
    status: 'recorded',
    timestamp: purchase.createdAt,
  }));

  return [...saleRows, ...purchaseRows].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
};

export const buildAlerts = (products: Product[], sales: Sale[]): WorkspaceAlert[] => {
  const stockAlerts: WorkspaceAlert[] = products
    .filter(product => isLowStock(product.stockQuantity, product.lowStockThreshold))
    .map(product => ({
      id: `stock-${product.id}`,
      kind: 'low_stock',
      severity: product.stockQuantity === 0 ? 'error' : 'warning',
      title: product.name,
      message: `${product.name} · ${product.stockQuantity}/${product.lowStockThreshold}`,
      productName: product.name,
      sku: product.sku,
      quantity: product.stockQuantity,
      threshold: product.lowStockThreshold,
      relatedType: 'product',
      relatedId: product.id,
    }));

  const paymentAlerts: WorkspaceAlert[] = sales
    .filter(sale => sale.paymentStatus === 'pending' || sale.paymentStatus === 'partial')
    .map(sale => ({
      id: `payment-${sale.id}`,
      kind: 'payment',
      severity: sale.paymentStatus === 'pending' ? 'error' : 'info',
      title: sale.invoiceNumber,
      message: `${sale.customerName} · ${sale.paymentStatus}`,
      reference: sale.invoiceNumber,
      partyName: sale.customerName,
      amount: sale.totalAmount,
      status: sale.paymentStatus,
      relatedType: 'sale',
      relatedId: sale.id,
    }));

  return [...stockAlerts, ...paymentAlerts];
};
