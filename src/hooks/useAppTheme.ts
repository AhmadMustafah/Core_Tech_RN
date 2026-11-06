import { useMemo } from 'react';
import { useTheme } from 'react-native-paper';
import { useAppSelector } from '@/redux/hooks';
import { getThemeColors } from '@/theme';

export const useAppTheme = () => {
  const themeMode = useAppSelector(state => state.theme.mode);
  const hydrated = useAppSelector(state => state.theme.hydrated);
  const paperTheme = useTheme();
  const isDark = themeMode === 'dark';
  const colors = useMemo(() => getThemeColors(isDark), [isDark]);

  return {
    colors,
    isDark,
    paperTheme,
    themeMode,
    hydrated,
  };
};
