import { useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { getThemeColors } from '@/theme';
import { loadThemePreferences } from '@/redux/slices/themeSlice';

export const useAppTheme = () => {
  const dispatch = useAppDispatch();
  const systemScheme = useColorScheme();
  const themeMode = useAppSelector(state => state.theme.mode);
  const themePreset = useAppSelector(state => state.theme.preset);
  const hydrated = useAppSelector(state => state.theme.hydrated);
  const paperTheme = useTheme();

  useEffect(() => {
    if (!hydrated) {
      dispatch(loadThemePreferences());
    }
  }, [dispatch, hydrated]);

  const isDark =
    themeMode === 'dark' ||
    (themeMode === 'system' && systemScheme === 'dark');

  const colors = useMemo(
    () => getThemeColors(themePreset, isDark),
    [themePreset, isDark],
  );

  return {
    colors,
    isDark,
    paperTheme,
    themeMode,
    themePreset,
  };
};
