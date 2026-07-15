import type {
  Activity,
  AppNotification,
  Customer,
  DashboardSummary,
  Product,
  Purchase,
  Sale,
  Supplier,
  User,
} from '@/types';

const now = new Date().toISOString();

export const mockUser: User = {
  id: '1',
  name: 'Ahmad Butt',
  email: 'ahmad@coretech.com',
  phone: '+92 3241121048',
  company: 'CoreTech Solutions',
  role: 'Admin',
  createdAt: now,
};

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Wireless Mouse',
    sku: 'WM-001',
    category: 'Electronics',
    unit: 'Piece',
    price: 2500,
    costPrice: 1800,
    stockQuantity: 45,
    lowStockThreshold: 10,
    description: 'Ergonomic wireless mouse with USB receiver',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: '2',
    name: 'A4 Paper Ream',
    sku: 'AP-002',
    category: 'Office Supplies',
    unit: 'Pack',
    price: 850,
    costPrice: 650,
    stockQuantity: 8,
    lowStockThreshold: 15,
    description: '500 sheets premium A4 paper',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: '3',
    name: 'USB-C Cable',
    sku: 'UC-003',
    category: 'Electronics',
    unit: 'Piece',
    price: 1200,
    costPrice: 800,
    stockQuantity: 120,
    lowStockThreshold: 20,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: '4',
    name: 'Office Chair',
    sku: 'OC-004',
    category: 'Office Supplies',
    unit: 'Piece',
    price: 15000,
    costPrice: 11000,
    stockQuantity: 5,
    lowStockThreshold: 5,
    createdAt: now,
    updatedAt: now,
  },
];

export const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'Ali Hassan',
    email: 'ali@business.com',
    phone: '+92 321 9876543',
    address: 'Karachi, Pakistan',
    company: 'Hassan Traders',
    totalPurchases: 125000,
    createdAt: now,
  },
  {
    id: '2',
    name: 'Sara Ahmed',
    email: 'sara@shop.com',
    phone: '+92 333 4567890',
    address: 'Lahore, Pakistan',
    company: 'Sara Retail',
    totalPurchases: 85000,
    createdAt: now,
  },
];

export const mockSuppliers: Supplier[] = [
  {
    id: '1',
    name: 'Tech Distributors',
    email: 'sales@techdist.com',
    phone: '+92 42 1234567',
    address: 'Lahore, Pakistan',
    company: 'Tech Distributors Pvt Ltd',
    totalPurchases: 500000,
    createdAt: now,
  },
  {
    id: '2',
    name: 'Office Mart',
    email: 'orders@officemart.com',
    phone: '+92 21 7654321',
    address: 'Karachi, Pakistan',
    company: 'Office Mart Supplies',
    totalPurchases: 320000,
    createdAt: now,
  },
];

export const mockSales: Sale[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-001',
    customerId: '1',
    customerName: 'Ali Hassan',
    items: [
      {
        productId: '1',
        productName: 'Wireless Mouse',
        quantity: 2,
        price: 2500,
        discount: 0,
        tax: 500,
        total: 5500,
      },
    ],
    subtotal: 5000,
    discount: 0,
    tax: 500,
    totalAmount: 5500,
    paymentStatus: 'paid',
    createdAt: now,
  },
];

export const mockPurchases: Purchase[] = [
  {
    id: '1',
    purchaseNumber: 'PO-2024-001',
    supplierId: '1',
    supplierName: 'Tech Distributors',
    items: [
      {
        productId: '1',
        productName: 'Wireless Mouse',
        quantity: 50,
        purchasePrice: 1800,
        total: 90000,
      },
    ],
    totalAmount: 90000,
    createdAt: now,
  },
];

export const mockDashboardSummary: DashboardSummary = {
  totalProducts: 4,
  totalSales: 1,
  totalPurchases: 1,
  totalCustomers: 2,
  lowStockCount: 2,
  salesAmount: 5500,
  purchasesAmount: 90000,
};

export const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'sale',
    title: 'Sale Completed',
    description: 'Invoice INV-2024-001 for Ali Hassan',
    timestamp: now,
  },
  {
    id: '2',
    type: 'purchase',
    title: 'Purchase Received',
    description: 'PO-2024-001 from Tech Distributors',
    timestamp: now,
  },
  {
    id: '3',
    type: 'product',
    title: 'Low Stock Alert',
    description: 'A4 Paper Ream is running low (8 units)',
    timestamp: now,
  },
];

export const mockNotifications: AppNotification[] = [
  {
    id: '1',
    type: 'sale_completed',
    title: 'Sale Completed',
    message: 'Invoice INV-2024-001 has been completed successfully.',
    read: false,
    createdAt: now,
  },
  {
    id: '2',
    type: 'purchase_completed',
    title: 'Purchase Completed',
    message: 'Purchase order PO-2024-001 has been received.',
    read: false,
    createdAt: now,
  },
  {
    id: '3',
    type: 'low_stock',
    title: 'Low Stock Alert',
    message: 'A4 Paper Ream stock is below threshold (8 units remaining).',
    read: true,
    createdAt: now,
  },
  {
    id: '4',
    type: 'order_created',
    title: 'Order Created',
    message: 'New sales order INV-2024-001 has been created.',
    read: true,
    createdAt: now,
  },
];

export const MOCK_CREDENTIALS = {
  email: 'ahmed@coretech.com',
  password: 'password123',
};

export const MOCK_OTP = '123456';
