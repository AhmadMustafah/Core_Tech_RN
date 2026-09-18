import { useCallback, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { loadSettingsPreferences } from '@/redux/slices/settingsSlice';
import {
  getDirectionalIconStyle,
  getCatalogLabel,
  isRtlLanguage,
  translate,
  type TranslationKey,
} from '@/localization';

export const useLocalization = () => {
  const dispatch = useAppDispatch();
  const language = useAppSelector(state => state.settings.language);
  const hydrated = useAppSelector(state => state.settings.hydrated);
  const isRTL = isRtlLanguage(language);
  const directionalIconStyle = useMemo(() => getDirectionalIconStyle(isRTL), [isRTL]);

  useEffect(() => {
    if (!hydrated) {
      dispatch(loadSettingsPreferences());
    }
  }, [dispatch, hydrated]);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) =>
      translate(language, key, vars),
    [language],
  );

  const catalogLabel = useCallback(
    (value: string) => getCatalogLabel(language, value),
    [language],
  );

  const directionStyle = useMemo(
    () => ({ writingDirection: isRTL ? ('rtl' as const) : ('ltr' as const) }),
    [isRTL],
  );

  return { t, language, isRTL, directionalIconStyle, catalogLabel, directionStyle };
};
