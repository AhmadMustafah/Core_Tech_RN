import type { Language } from '@/types';
import { translate } from '@/localization';

export const formatCurrency = (amount: number, currency = 'PKR'): string => {
  return `${currency} ${amount.toLocaleString('en-PK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

const dateLocale = (language: Language = 'en') => (language === 'ur' ? 'ur-PK' : 'en-PK');

export const formatDate = (date: string | Date, language: Language = 'en'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(dateLocale(language), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date: string | Date, language: Language = 'en'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString(dateLocale(language), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatRelativeTime = (date: string, language: Language = 'en'): string => {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return translate(language, 'time.justNow');
  if (diffMins < 60) return translate(language, 'time.minutesAgo', { count: diffMins });
  if (diffHours < 24) return translate(language, 'time.hoursAgo', { count: diffHours });
  if (diffDays < 7) return translate(language, 'time.daysAgo', { count: diffDays });
  return formatDate(date, language);
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
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};
