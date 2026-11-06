import { CommonActions, type NavigationProp, type ParamListBase } from '@react-navigation/native';
import type { LedgerTransaction } from '@/services/transactionService';

const asMongoId = (value: unknown): string => {
  if (typeof value === 'string') {
    return value.trim();
  }
  if (value && typeof value === 'object') {
    const record = value as { $oid?: unknown; id?: unknown; _id?: unknown };
    if (typeof record.$oid === 'string') {
      return record.$oid;
    }
    if (typeof record.id === 'string') {
      return record.id;
    }
    if (record._id != null) {
      return String(record._id);
    }
  }
  return value == null ? '' : String(value);
};

export const popToTabs = (navigation: NavigationProp<ParamListBase>) => {
  let current: NavigationProp<ParamListBase> | undefined = navigation;

  while (current) {
    const state = current.getState();
    if (state?.routeNames?.includes('Tabs')) {
      current.navigate('Tabs' as never);
      return;
    }
    current = current.getParent();
  }
};

export const openLedgerTransaction = (
  navigation: NavigationProp<ParamListBase>,
  item: LedgerTransaction,
) => {
  const id = asMongoId(item.relatedId || item.id);
  const isSale =
    item.type === 'Sale' || String(item.ref || '').toUpperCase().startsWith('INV-');

  if (!id) {
    return;
  }

  navigation.dispatch(
    CommonActions.navigate({
      name: isSale ? 'SaleDetails' : 'PurchaseDetails',
      params: isSale ? { saleId: id } : { purchaseId: id },
    }),
  );
};

export const resetToLogin = (navigation: NavigationProp<ParamListBase>) => {
  let root: NavigationProp<ParamListBase> = navigation;
  let parent = root.getParent();

  while (parent) {
    root = parent;
    parent = root.getParent();
  }

  root.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: 'Auth', params: { screen: 'Login' } }],
    }),
  );
};
