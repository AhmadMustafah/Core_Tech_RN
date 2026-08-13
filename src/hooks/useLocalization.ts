import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { loadSettingsPreferences } from '@/redux/slices/settingsSlice';
import { translate, type TranslationKey } from '@/localization';

export const useLocalization = () => {
  const dispatch = useAppDispatch();
  const language = useAppSelector(state => state.settings.language);
  const hydrated = useAppSelector(state => state.settings.hydrated);

  useEffect(() => {
    if (!hydrated) {
      dispatch(loadSettingsPreferences());
    }
  }, [dispatch, hydrated]);

  const t = useCallback(
    (key: TranslationKey) => translate(language, key),
    [language],
  );

  return { t, language };
};
