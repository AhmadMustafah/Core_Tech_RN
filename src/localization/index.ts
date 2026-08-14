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
