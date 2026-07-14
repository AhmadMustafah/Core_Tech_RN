export const APP_NAME = 'CoreTech Enterprise';
export const APP_VERSION = '1.0.0';

export const API_CONFIG = {
  BASE_URL: 'https://api.coretech-enterprise.com/api/v1',
  TIMEOUT: 30000,
  USE_MOCK: true,
};

export const STORAGE_KEYS = {
  ACCESS_TOKEN: '@coretech/access_token',
  REFRESH_TOKEN: '@coretech/refresh_token',
  USER: '@coretech/user',
  ONBOARDING_COMPLETE: '@coretech/onboarding_complete',
  THEME_MODE: '@coretech/theme_mode',
  LANGUAGE: '@coretech/language',
  NOTIFICATIONS_ENABLED: '@coretech/notifications_enabled',
};

export const PAYMENT_STATUS = {
  PAID: 'paid',
  PENDING: 'pending',
  PARTIAL: 'partial',
} as const;

export const NOTIFICATION_TYPES = {
  ORDER_CREATED: 'order_created',
  SALE_COMPLETED: 'sale_completed',
  PURCHASE_COMPLETED: 'purchase_completed',
  LOW_STOCK: 'low_stock',
} as const;

export const PRODUCT_UNITS = ['Piece', 'Kg', 'Liter', 'Box', 'Pack', 'Dozen'];

export const PRODUCT_CATEGORIES = [
  'Electronics',
  'Clothing',
  'Food & Beverages',
  'Office Supplies',
  'Hardware',
  'Other',
];
