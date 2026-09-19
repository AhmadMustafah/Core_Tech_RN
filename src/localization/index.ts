import { DevSettings, I18nManager, NativeModules, type TextStyle } from 'react-native';
import type { Language } from '@/types';
import { translations, type TranslationKey } from './translations';

export { translations, type TranslationKey };

export const interpolate = (
  template: string,
  vars?: Record<string, string | number>,
): string => {
  if (!vars) {
    return template;
  }
  return template.replace(/\{(\w+)\}/g, (_, name: string) =>
    vars[name] == null ? `{${name}}` : String(vars[name]),
  );
};

export const translate = (
  language: Language,
  key: TranslationKey,
  vars?: Record<string, string | number>,
): string =>
  interpolate(translations[language][key] ?? translations.en[key] ?? key, vars);

export const isTranslationKey = (value: string): value is TranslationKey =>
  Object.prototype.hasOwnProperty.call(translations.en, value);

export const CATALOG_LABEL_KEYS: Record<string, TranslationKey> = {
  Electronics: 'catalog.electronics',
  Clothing: 'catalog.clothing',
  'Food & Beverages': 'catalog.food',
  'Office Supplies': 'catalog.office',
  Hardware: 'catalog.hardware',
  Other: 'catalog.other',
  Piece: 'unit.piece',
  Kg: 'unit.kg',
  Liter: 'unit.liter',
  Box: 'unit.box',
  Pack: 'unit.pack',
  Dozen: 'unit.dozen',
};

export const PAYMENT_STATUS_KEYS = {
  paid: 'status.paid',
  pending: 'status.pending',
  partial: 'status.partial',
} as const;

export const NOTIFICATION_TITLE_KEYS = {
  sale_completed: 'notify.saleCompleted',
  purchase_completed: 'notify.purchaseCompleted',
  low_stock: 'notify.lowStock',
  order_created: 'notify.orderCreated',
  customer_activity: 'notify.customerActivity',
  supplier_activity: 'notify.supplierActivity',
  payment_update: 'notify.paymentUpdate',
  system_alert: 'notify.systemAlert',
} as const;

export const NOTIFICATION_BODY_KEYS = {
  sale_completed: 'notify.body.saleCompleted',
  purchase_completed: 'notify.body.purchaseCompleted',
  low_stock: 'notify.body.lowStock',
  order_created: 'notify.body.orderCreated',
  customer_activity: 'notify.body.customerActivity',
  supplier_activity: 'notify.body.supplierActivity',
  payment_update: 'notify.body.paymentUpdate',
  system_alert: 'notify.body.systemAlert',
} as const;

export const getCatalogLabel = (language: Language, value: string): string => {
  const key = CATALOG_LABEL_KEYS[value];
  return key ? translate(language, key) : value;
};

export const isRtlLanguage = (language: Language): boolean => language === 'ur';

export const getDirectionalIconStyle = (isRTL: boolean): TextStyle | undefined =>
  isRTL ? { transform: [{ scaleX: -1 }] } : undefined;

export const applyLayoutDirection = (language: Language) => {
  const shouldBeRtl = isRtlLanguage(language);
  I18nManager.allowRTL(true);
  I18nManager.swapLeftAndRightInRTL(true);

  if (I18nManager.isRTL === shouldBeRtl) {
    return;
  }

  I18nManager.forceRTL(shouldBeRtl);

  const reload =
    typeof DevSettings.reload === 'function'
      ? DevSettings.reload.bind(DevSettings)
      : NativeModules.DevSettings?.reload?.bind(NativeModules.DevSettings);

  if (typeof reload === 'function') {
    reload();
  }
};
