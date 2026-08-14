import React, { useEffect, useMemo } from 'react';
import { useColorScheme, StatusBar, View, StyleSheet } from 'react-native';
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from '@/redux/store';
import { RootNavigator } from '@/navigation/RootNavigator';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { loadThemePreferences } from '@/redux/slices/themeSlice';
import { loadSettingsPreferences } from '@/redux/slices/settingsSlice';
import { applyLayoutDirection, isRtlLanguage } from '@/localization';
import { getThemeColors, borderRadius } from '@/theme';

const AppContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const systemScheme = useColorScheme();
  const themeMode = useAppSelector(state => state.theme.mode);
  const themePreset = useAppSelector(state => state.theme.preset);
  const language = useAppSelector(state => state.settings.language);
  const settingsHydrated = useAppSelector(state => state.settings.hydrated);
  const isRTL = isRtlLanguage(language);

  useEffect(() => {
    dispatch(loadThemePreferences());
    dispatch(loadSettingsPreferences());
  }, [dispatch]);

  useEffect(() => {
    if (settingsHydrated) {
      applyLayoutDirection(language);
    }
  }, [language, settingsHydrated]);

  const isDark =
    themeMode === 'dark' || (themeMode === 'system' && systemScheme === 'dark');

  const colors = useMemo(
    () => getThemeColors(themePreset, isDark),
    [themePreset, isDark],
  );

  const paperTheme = useMemo(
    () => ({
      ...(isDark ? MD3DarkTheme : MD3LightTheme),
      roundness: borderRadius.md,
      colors: {
        ...(isDark ? MD3DarkTheme.colors : MD3LightTheme.colors),
        primary: colors.primary,
        secondary: colors.secondary,
        background: colors.background,
        surface: colors.surface,
        surfaceVariant: colors.surfaceVariant,
        error: colors.error,
        onSurface: colors.text,
        onSurfaceVariant: colors.textSecondary,
        outline: colors.border,
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
    <View style={[styles.root, { direction: isRTL ? 'rtl' : 'ltr' }]}>
      <PaperProvider theme={paperTheme}>
        <NavigationContainer theme={navTheme} direction={isRTL ? 'rtl' : 'ltr'}>
          <StatusBar
            barStyle={isDark ? 'light-content' : 'dark-content'}
            backgroundColor={colors.surface}
          />
          <RootNavigator />
        </NavigationContainer>
      </PaperProvider>
    </View>
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

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default App;
