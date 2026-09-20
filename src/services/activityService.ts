import { generateId } from '@/utils/formatters';
import { storage } from '@/utils/storage';
import { STORAGE_KEYS } from '@/constants';
import type {
  Activity,
  ActivityAction,
  ActivityActor,
  ActivityType,
  Customer,
  Product,
  Purchase,
  Sale,
  Supplier,
  User,
} from '@/types';
import {
  mockCustomers,
  mockProducts,
  mockPurchases,
  mockSales,
  mockSuppliers,
} from './mockData';

const toActor = (user?: User | null): ActivityActor | undefined => {
  if (!user) {
    return undefined;
  }
  return {
    id: user.id,
    name: user.name,
    role: user.role,
    avatar: user.avatar,
  };
};

const seedActivities = (): Activity[] => {
  const sales: Activity[] = mockSales.map(sale => ({
    id: `sale-${sale.id}`,
    type: sale.paymentStatus === 'paid' ? 'payment' : 'sale',
    action: sale.paymentStatus === 'paid' ? 'status_changed' : 'created',
    title: sale.paymentStatus === 'paid' ? 'Invoice marked paid' : 'Sale created',
    description: `${sale.invoiceNumber} · ${sale.customerName}`,
    timestamp: sale.createdAt,
    entityType: 'sale',
    entityId: sale.id,
    entityName: sale.customerName,
    entityReference: sale.invoiceNumber,
    status: sale.paymentStatus,
    newValue: sale.paymentStatus === 'paid' ? 'paid' : undefined,
  }));

  const purchases: Activity[] = mockPurchases.map(purchase => ({
    id: `purchase-${purchase.id}`,
    type: 'purchase',
    action: 'created',
    title: 'Purchase created',
    description: `${purchase.purchaseNumber} · ${purchase.supplierName}`,
    timestamp: purchase.createdAt,
    entityType: 'purchase',
    entityId: purchase.id,
    entityName: purchase.supplierName,
    entityReference: purchase.purchaseNumber,
  }));

  const products: Activity[] = mockProducts
    .filter(product => product.stockQuantity <= product.lowStockThreshold)
    .map(product => ({
      id: `stock-${product.id}`,
      type: 'product',
      action: 'alert',
      title: 'Low stock',
      description: `${product.name} (${product.sku})`,
      timestamp: product.updatedAt,
      entityType: 'product',
      entityId: product.id,
      entityName: product.name,
      entityReference: product.sku,
      status: 'low_stock',
      newValue: String(product.stockQuantity),
    }));

  const customers: Activity[] = mockCustomers.map(customer => ({
    id: `customer-${customer.id}`,
    type: 'customer',
    action: 'created',
    title: 'Customer added',
    description: customer.company ? `${customer.name} · ${customer.company}` : customer.name,
    timestamp: customer.createdAt,
    entityType: 'customer',
    entityId: customer.id,
    entityName: customer.name,
  }));

  const suppliers: Activity[] = mockSuppliers.map(supplier => ({
    id: `supplier-${supplier.id}`,
    type: 'supplier',
    action: 'created',
    title: 'Supplier added',
    description: supplier.company ? `${supplier.name} · ${supplier.company}` : supplier.name,
    timestamp: supplier.createdAt,
    entityType: 'supplier',
    entityId: supplier.id,
    entityName: supplier.name,
  }));

  return [...sales, ...purchases, ...products, ...customers, ...suppliers].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
};

let activities: Activity[] = seedActivities();

const currentActor = async (): Promise<ActivityActor | undefined> => {
  const user = await storage.getItem<User>(STORAGE_KEYS.USER);
  return toActor(user);
};

export type RecordActivityInput = {
  type: ActivityType;
  title: string;
  description: string;
  action?: ActivityAction;
  actor?: ActivityActor | User | null;
  entityType?: Activity['entityType'];
  entityId?: string;
  entityName?: string;
  entityReference?: string;
  status?: string;
  previousValue?: string;
  newValue?: string;
  timestamp?: string;
};

export const activityService = {
  list(): Activity[] {
    return [...activities];
  },

  async getAll(): Promise<Activity[]> {
    return activityService.list();
  },

  async record(input: RecordActivityInput): Promise<Activity> {
    const actor = toActor(input.actor as User | undefined) || input.actor || (await currentActor());
    const activity: Activity = {
      id: generateId(),
      type: input.type,
      title: input.title,
      description: input.description,
      timestamp: input.timestamp || new Date().toISOString(),
      action: input.action,
      actor: actor && 'name' in actor ? actor : undefined,
      entityType: input.entityType,
      entityId: input.entityId,
      entityName: input.entityName,
      entityReference: input.entityReference,
      status: input.status,
      previousValue: input.previousValue,
      newValue: input.newValue,
    };
    activities = [activity, ...activities];
    return activity;
  },

  recordSaleCreated(sale: Sale, actor?: User | null) {
    return activityService.record({
      type: 'sale',
      action: 'created',
      title: 'Sale created',
      description: `${sale.invoiceNumber} · ${sale.customerName}`,
      actor,
      entityType: 'sale',
      entityId: sale.id,
      entityName: sale.customerName,
      entityReference: sale.invoiceNumber,
      status: sale.paymentStatus,
    });
  },

  recordPurchaseCreated(purchase: Purchase, actor?: User | null) {
    return activityService.record({
      type: 'purchase',
      action: 'created',
      title: 'Purchase created',
      description: `${purchase.purchaseNumber} · ${purchase.supplierName}`,
      actor,
      entityType: 'purchase',
      entityId: purchase.id,
      entityName: purchase.supplierName,
      entityReference: purchase.purchaseNumber,
    });
  },

  recordProductSaved(product: Product, isNew: boolean, previousStock?: number) {
    const stockChanged =
      previousStock != null && previousStock !== product.stockQuantity;
    return activityService.record({
      type: 'product',
      action: stockChanged ? 'stock_changed' : isNew ? 'created' : 'updated',
      title: stockChanged ? 'Stock updated' : isNew ? 'Product added' : 'Product updated',
      description: `${product.name} (${product.sku})`,
      entityType: 'product',
      entityId: product.id,
      entityName: product.name,
      entityReference: product.sku,
      previousValue: stockChanged ? String(previousStock) : undefined,
      newValue: stockChanged ? String(product.stockQuantity) : undefined,
    });
  },

  recordCustomerSaved(customer: Customer, isNew: boolean) {
    return activityService.record({
      type: 'customer',
      action: isNew ? 'created' : 'updated',
      title: isNew ? 'Customer added' : 'Customer updated',
      description: customer.company ? `${customer.name} · ${customer.company}` : customer.name,
      entityType: 'customer',
      entityId: customer.id,
      entityName: customer.name,
    });
  },

  recordSupplierSaved(supplier: Supplier, isNew: boolean) {
    return activityService.record({
      type: 'supplier',
      action: isNew ? 'created' : 'updated',
      title: isNew ? 'Supplier added' : 'Supplier updated',
      description: supplier.company ? `${supplier.name} · ${supplier.company}` : supplier.name,
      entityType: 'supplier',
      entityId: supplier.id,
      entityName: supplier.name,
    });
  },

  recordAuth(action: 'logged_in' | 'logged_out', user?: User | null) {
    return activityService.record({
      type: 'auth',
      action,
      title: action === 'logged_in' ? 'User signed in' : 'User signed out',
      description: user?.name || user?.email || 'User',
      actor: user,
      entityType: 'auth',
      entityName: user?.name,
    });
  },
};
