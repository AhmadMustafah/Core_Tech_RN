import type { Language } from '@/types';
import { translations, type TranslationKey } from './translations';

export { translations, type TranslationKey };

export const translate = (language: Language, key: TranslationKey): string =>
  translations[language][key] ?? translations.en[key] ?? key;
