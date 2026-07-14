import React, { useMemo } from 'react';
import { useColorScheme, StatusBar } from 'react-native';
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from '@/redux/store';
import { RootNavigator } from '@/navigation/RootNavigator';
import { useAppSelector } from '@/redux/hooks';
import { lightColors, darkColors } from '@/theme';

const AppContent: React.FC = () => {
  const systemScheme = useColorScheme();
  const themeMode = useAppSelector(state => state.theme.mode);
  const isDark =
    themeMode === 'dark' || (themeMode === 'system' && systemScheme === 'dark');

  const colors = isDark ? darkColors : lightColors;

  const paperTheme = useMemo(
    () => ({
      ...(isDark ? MD3DarkTheme : MD3LightTheme),
      colors: {
        ...(isDark ? MD3DarkTheme.colors : MD3LightTheme.colors),
        primary: colors.primary,
        secondary: colors.secondary,
        background: colors.background,
        surface: colors.surface,
        error: colors.error,
      },
    }),
    [isDark, colors],
  );

  const navTheme = useMemo(
    () => ({
      ...(isDark ? DarkTheme : DefaultTheme),
      colors: {
        ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
        primary: colors.primary,
        background: colors.background,
        card: colors.surface,
        text: colors.text,
        border: colors.border,
      },
    }),
    [isDark, colors],
  );

  return (
    <PaperProvider theme={paperTheme}>
      <NavigationContainer theme={navTheme}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={colors.surface}
        />
        <RootNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </Provider>
  );
};

export default App;
