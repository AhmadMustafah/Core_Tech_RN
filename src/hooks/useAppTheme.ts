import { useColorScheme } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useAppSelector } from '@/redux/hooks';
import { lightColors, darkColors } from '@/theme';

export const useAppTheme = () => {
  const systemScheme = useColorScheme();
  const themeMode = useAppSelector(state => state.theme.mode);
  const paperTheme = useTheme();

  const isDark =
    themeMode === 'dark' ||
    (themeMode === 'system' && systemScheme === 'dark');

  const colors = isDark ? darkColors : lightColors;

  return {
    colors,
    isDark,
    paperTheme,
    themeMode,
  };
};
