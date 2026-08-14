import { useCallback, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { loadSettingsPreferences } from '@/redux/slices/settingsSlice';
import {
  getDirectionalIconStyle,
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

  return { t, language, isRTL, directionalIconStyle };
};
