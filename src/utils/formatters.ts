import type { Language } from '@/types';
import { translate } from '@/localization';

const toNumber = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return 0;
};

const toValidDate = (value: string | Date | null | undefined): Date | null => {
  if (!value) {
    return null;
  }
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const numberLocale = (language: Language = 'en') => (language === 'ur' ? 'ur-PK' : 'en-PK');

export const formatCurrency = (amount: unknown, currency = 'PKR'): string => {
  const value = toNumber(amount);
  try {
    return `${currency} ${value.toLocaleString('en-PK', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  } catch {
    const formatted = Number.isInteger(value) ? String(value) : value.toFixed(2);
    return `${currency} ${formatted}`;
  }
};

export const formatDate = (date: string | Date | null | undefined, language: Language = 'en'): string => {
  const d = toValidDate(date);
  if (!d) {
    return '';
  }
  try {
    return d.toLocaleDateString(numberLocale(language), {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return d.toISOString().slice(0, 10);
  }
};

export const formatDateTime = (date: string | Date | null | undefined, language: Language = 'en'): string => {
  const d = toValidDate(date);
  if (!d) {
    return '';
  }
  try {
    return d.toLocaleString(numberLocale(language), {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return d.toISOString().slice(0, 16).replace('T', ' ');
  }
};

export const formatRelativeTime = (
  date: string | Date | null | undefined,
  language: Language = 'en',
): string => {
  const then = toValidDate(date);
  if (!then) {
    return '';
  }

  const diffMs = Date.now() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return translate(language, 'time.justNow');
  if (diffMins < 60) return translate(language, 'time.minutesAgo', { count: diffMins });
  if (diffHours < 24) return translate(language, 'time.hoursAgo', { count: diffHours });
  if (diffDays < 7) return translate(language, 'time.daysAgo', { count: diffDays });
  return formatDate(then, language);
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const calculateSaleTotal = (
  items: { quantity: number; price: number; discount: number; tax: number }[],
  globalDiscount = 0,
  globalTax = 0,
): { subtotal: number; discount: number; tax: number; total: number } => {
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0,
  );
  const itemDiscount = items.reduce(
    (sum, item) => sum + item.discount,
    0,
  );
  const discount = itemDiscount + globalDiscount;
  const taxableAmount = subtotal - discount;
  const itemTax = items.reduce((sum, item) => sum + item.tax, 0);
  const tax = itemTax + globalTax + taxableAmount * 0;
  const total = taxableAmount + tax;
  return { subtotal, discount, tax, total };
};

export const isLowStock = (quantity: number, threshold: number): boolean => {
  return quantity <= threshold;
};

export const getInitials = (name: string): string => {
  if (!name) {
    return 'U';
  }
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};
