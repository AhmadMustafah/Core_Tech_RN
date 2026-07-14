export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  avatar?: string;
  role?: string;
  createdAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  company: string;
  password: string;
  confirmPassword: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  price: number;
  costPrice: number;
  stockQuantity: number;
  lowStockThreshold: number;
  description?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  company?: string;
  totalPurchases?: number;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  company?: string;
  totalPurchases?: number;
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  discount: number;
  tax: number;
  total: number;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paymentStatus: 'paid' | 'pending' | 'partial';
  notes?: string;
  createdAt: string;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  quantity: number;
  purchasePrice: number;
  total: number;
}

export interface Purchase {
  id: string;
  purchaseNumber: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseItem[];
  totalAmount: number;
  notes?: string;
  createdAt: string;
}

export interface DashboardSummary {
  totalProducts: number;
  totalSales: number;
  totalPurchases: number;
  totalCustomers: number;
  lowStockCount: number;
  salesAmount: number;
  purchasesAmount: number;
}

export interface Activity {
  id: string;
  type: 'sale' | 'purchase' | 'product' | 'customer';
  title: string;
  description: string;
  timestamp: string;
}

export interface AppNotification {
  id: string;
  type: 'order_created' | 'sale_completed' | 'purchase_completed' | 'low_stock';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export type ThemeMode = 'light' | 'dark' | 'system';
export type Language = 'en' | 'ur';
