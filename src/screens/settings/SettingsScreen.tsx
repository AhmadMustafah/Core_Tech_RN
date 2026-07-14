import React, { useState, useCallback } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { Text, Switch, List, Divider, SegmentedButtons } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setThemeMode } from '@/redux/slices/themeSlice';
import { setNotificationsEnabled, setLanguage } from '@/redux/slices/settingsSlice';
import { storage } from '@/utils/storage';
import { STORAGE_KEYS } from '@/constants';
import { useAppTheme } from '@/hooks/useAppTheme';
import { APP_NAME, APP_VERSION } from '@/constants';
import type { ProfileStackParamList } from '@/types/navigation';
import type { ThemeMode, Language } from '@/types';
import { spacing } from '@/theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Settings'>;

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useAppTheme();
  const dispatch = useAppDispatch();
  const themeMode = useAppSelector(state => state.theme.mode);
  const { notificationsEnabled, language } = useAppSelector(state => state.settings);

  const handleThemeChange = async (mode: ThemeMode) => {
    dispatch(setThemeMode(mode));
    await storage.setItem(STORAGE_KEYS.THEME_MODE, mode);
  };

  const handleNotifications = async (value: boolean) => {
    dispatch(setNotificationsEnabled(value));
    await storage.setItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED, value);
  };

  const handleLanguage = async (lang: Language) => {
    dispatch(setLanguage(lang));
    await storage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
        <SegmentedButtons
          value={themeMode}
          onValueChange={v => handleThemeChange(v as ThemeMode)}
          buttons={[
            { value: 'light', label: 'Light', icon: 'white-balance-sunny' },
            { value: 'dark', label: 'Dark', icon: 'moon-waning-crescent' },
            { value: 'system', label: 'System', icon: 'theme-light-dark' },
          ]}
          style={styles.segmented}
        />
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.text }]}>Preferences</Text>
        <List.Item
          title="Notifications"
          description="Enable push notifications"
          left={props => <List.Icon {...props} icon="bell-outline" />}
          right={() => <Switch value={notificationsEnabled} onValueChange={handleNotifications} />}
        />
        <Divider />
        <Text variant="bodyMedium" style={{ color: colors.textSecondary, padding: spacing.md }}>Language</Text>
        <SegmentedButtons
          value={language}
          onValueChange={v => handleLanguage(v as Language)}
          buttons={[
            { value: 'en', label: 'English' },
            { value: 'ur', label: 'Urdu' },
          ]}
          style={styles.segmented}
        />
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
        <List.Item title="Privacy Policy" left={props => <List.Icon {...props} icon="shield-account" />}
          onPress={() => navigation.navigate('PrivacyPolicy')} right={props => <List.Icon {...props} icon="chevron-right" />} />
        <Divider />
        <List.Item title="About App" description={`${APP_NAME} v${APP_VERSION}`}
          left={props => <List.Icon {...props} icon="information-outline" />}
          onPress={() => navigation.navigate('AboutApp')} right={props => <List.Icon {...props} icon="chevron-right" />} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  section: { margin: spacing.md, borderRadius: 12, overflow: 'hidden', elevation: 1 },
  sectionTitle: { padding: spacing.md, fontWeight: '600' },
  segmented: { margin: spacing.md, marginTop: 0 },
});
