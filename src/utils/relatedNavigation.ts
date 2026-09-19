import type { NavigationProp } from '@react-navigation/native';
import type { AppNotification } from '@/types';
import type { MainTabParamList } from '@/types/navigation';

export const openRelatedRecord = (
  tabNavigation: NavigationProp<MainTabParamList> | undefined,
  target: {
    relatedType?: AppNotification['relatedType'];
    relatedId?: string;
  },
): boolean => {
  if (!tabNavigation || !target.relatedType || !target.relatedId) {
    return false;
  }

  switch (target.relatedType) {
    case 'product':
      tabNavigation.navigate('Inventory', {
        screen: 'ProductDetails',
        params: { productId: target.relatedId },
      });
      return true;
    case 'sale':
      tabNavigation.navigate('Sales', {
        screen: 'SaleDetails',
        params: { saleId: target.relatedId },
      });
      return true;
    case 'purchase':
      tabNavigation.navigate('Purchases', {
        screen: 'PurchaseDetails',
        params: { purchaseId: target.relatedId },
      });
      return true;
    case 'customer':
      tabNavigation.navigate('Profile', {
        screen: 'CustomerDetails',
        params: { customerId: target.relatedId },
      });
      return true;
    case 'supplier':
      tabNavigation.navigate('Profile', {
        screen: 'SupplierDetails',
        params: { supplierId: target.relatedId },
      });
      return true;
    default:
      return false;
  }
};
