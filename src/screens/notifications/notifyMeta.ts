import type { AppNotification } from '@/types';
import type { AppColors } from '@/theme';

export const getNotificationIcon = (type: AppNotification['type']) => {
  switch (type) {
    case 'sale_completed':
    case 'order_created':
      return 'cart-check';
    case 'purchase_completed':
      return 'truck-check';
    case 'low_stock':
      return 'alert-outline';
    case 'customer_activity':
      return 'account-outline';
    case 'supplier_activity':
      return 'truck-outline';
    case 'payment_update':
      return 'cash-check';
    default:
      return 'bell-outline';
  }
};

export const getNotificationPersonName = (item: AppNotification): string | undefined => {
  const party = item.details?.partyName?.trim();
  if (party) {
    return party;
  }
  if (item.type === 'customer_activity' || item.type === 'supplier_activity') {
    return item.details?.productName?.trim();
  }
  return undefined;
};

export const getNotificationColor = (
  type: AppNotification['type'],
  colors: AppColors
) => {
  switch (type) {
    case 'sale_completed':
    case 'order_created':
      return colors.success;
    case 'purchase_completed':
    case 'supplier_activity':
      return colors.primary;
    case 'low_stock':
      return colors.lowStock;
    case 'payment_update':
      return colors.warning;
    case 'customer_activity':
      return colors.info;
    default:
      return colors.primary;
  }
};
