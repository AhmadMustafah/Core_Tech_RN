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

const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString();
const fiveDaysAgo = new Date(Date.now() - 5 * 86400000).toISOString();

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
  {
    id: '2',
    invoiceNumber: 'INV-2024-002',
    customerId: '2',
    customerName: 'Sara Ahmed',
    items: [
      {
        productId: '3',
        productName: 'USB-C Cable',
        quantity: 4,
        price: 1200,
        discount: 0,
        tax: 0,
        total: 4800,
      },
    ],
    subtotal: 4800,
    discount: 0,
    tax: 0,
    totalAmount: 4800,
    paymentStatus: 'pending',
    createdAt: twoDaysAgo,
  },
  {
    id: '3',
    invoiceNumber: 'INV-2024-003',
    customerId: '1',
    customerName: 'Ali Hassan',
    items: [
      {
        productId: '4',
        productName: 'Office Chair',
        quantity: 1,
        price: 15000,
        discount: 0,
        tax: 0,
        total: 15000,
      },
    ],
    subtotal: 15000,
    discount: 0,
    tax: 0,
    totalAmount: 15000,
    paymentStatus: 'partial',
    createdAt: fiveDaysAgo,
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
  totalSales: 3,
  totalPurchases: 1,
  totalCustomers: 2,
  lowStockCount: 2,
  salesAmount: 25300,
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
    message: 'Invoice INV-2024-001 for Ali Hassan was completed successfully.',
    read: false,
    createdAt: now,
    relatedType: 'sale',
    relatedId: '1',
    details: {
      reference: 'INV-2024-001',
      partyName: 'Ali Hassan',
      amount: 5500,
      status: 'paid',
    },
  },
  {
    id: '2',
    type: 'purchase_completed',
    title: 'Purchase Completed',
    message: 'Purchase order PO-2024-001 from Tech Distributors has been received.',
    read: false,
    createdAt: now,
    relatedType: 'purchase',
    relatedId: '1',
    details: {
      reference: 'PO-2024-001',
      partyName: 'Tech Distributors',
      amount: 90000,
    },
  },
  {
    id: '3',
    type: 'low_stock',
    title: 'Low Stock Alert',
    message: 'A4 Paper Ream is below the stock threshold and needs replenishment.',
    read: false,
    createdAt: now,
    relatedType: 'product',
    relatedId: '2',
    details: {
      productName: 'A4 Paper Ream',
      sku: 'AP-002',
      quantity: 8,
      threshold: 15,
    },
  },
  {
    id: '4',
    type: 'payment_update',
    title: 'Payment update',
    message: 'Invoice INV-2024-003 for Ali Hassan is marked as partially paid.',
    read: false,
    createdAt: fiveDaysAgo,
    relatedType: 'sale',
    relatedId: '3',
    details: {
      reference: 'INV-2024-003',
      partyName: 'Ali Hassan',
      amount: 15000,
      status: 'partial',
    },
  },
  {
    id: '5',
    type: 'customer_activity',
    title: 'Customer activity',
    message: 'Sara Ahmed has a pending invoice that still needs collection.',
    read: true,
    createdAt: twoDaysAgo,
    relatedType: 'customer',
    relatedId: '2',
    details: {
      partyName: 'Sara Ahmed',
      reference: 'INV-2024-002',
      amount: 4800,
      status: 'pending',
    },
  },
  {
    id: '6',
    type: 'supplier_activity',
    title: 'Supplier activity',
    message: 'Tech Distributors fulfilled purchase order PO-2024-001.',
    read: true,
    createdAt: now,
    relatedType: 'supplier',
    relatedId: '1',
    details: {
      partyName: 'Tech Distributors',
      reference: 'PO-2024-001',
      amount: 90000,
    },
  },
  {
    id: '7',
    type: 'order_created',
    title: 'Order Created',
    message: 'New sales order INV-2024-002 was created for Sara Ahmed.',
    read: true,
    createdAt: twoDaysAgo,
    relatedType: 'sale',
    relatedId: '2',
    details: {
      reference: 'INV-2024-002',
      partyName: 'Sara Ahmed',
      amount: 4800,
      status: 'pending',
    },
  },
  {
    id: '8',
    type: 'system_alert',
    title: 'System alert',
    message: 'Workspace notifications stay on this device. Review unread alerts regularly.',
    read: true,
    createdAt: now,
  },
];

export const MOCK_CREDENTIALS = {
  email: 'ahmed@coretech.com',
  password: 'password123',
};

export const MOCK_OTP = '123456';
