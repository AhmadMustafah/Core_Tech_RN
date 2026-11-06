import React, { useCallback } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setThemeMode } from '@/redux/slices/themeSlice';
import { setLanguage } from '@/redux/slices/settingsSlice';
import { storage } from '@/utils/storage';
import { settingsService } from '@/services/settingsService';
import { STORAGE_KEYS } from '@/constants';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import type { Language, ThemeMode } from '@/types';
import type { ProfileStackParamList } from '@/types/navigation';
import { spacing } from '@/theme';
import { SettingsChoiceRow, SettingsNavRow, SettingsSection } from './settingsUi';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Settings'>;

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useAppTheme();
  const { t } = useLocalization();
  const dispatch = useAppDispatch();
  const themeMode = useAppSelector(state => state.theme.mode);
  const language = useAppSelector(state => state.settings.language);

  const handleThemeChange = useCallback(
    async (mode: ThemeMode) => {
      if (mode === themeMode) {
        return;
      }
      dispatch(setThemeMode(mode));
      await storage.setItem(STORAGE_KEYS.THEME_MODE, mode);
      settingsService.update({ themeMode: mode }).catch(() => undefined);
    },
    [dispatch, themeMode],
  );

  const handleLanguage = useCallback(
    async (lang: Language) => {
      if (lang === language) {
        return;
      }
      await storage.setItem(STORAGE_KEYS.LANGUAGE, lang);
      dispatch(setLanguage(lang));
      settingsService.update({ language: lang }).catch(() => undefined);
    },
    [dispatch, language],
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}>
      <SettingsSection title={t('settings.theme')}>
        <SettingsChoiceRow
          icon="white-balance-sunny"
          title={t('settings.bright')}
          description={t('settings.brightDesc')}
          selected={themeMode === 'light'}
          onPress={() => handleThemeChange('light')}
        />
        <SettingsChoiceRow
          icon="moon-waning-crescent"
          title={t('settings.dark')}
          description={t('settings.darkDesc')}
          selected={themeMode === 'dark'}
          last
          onPress={() => handleThemeChange('dark')}
        />
      </SettingsSection>

      <SettingsSection title={t('settings.language')}>
        <SettingsChoiceRow
          icon="format-textdirection-l-to-r"
          title={t('settings.english')}
          description={t('settings.languageEnglishDesc')}
          selected={language === 'en'}
          onPress={() => handleLanguage('en')}
        />
        <SettingsChoiceRow
          icon="format-textdirection-r-to-l"
          title={t('settings.urdu')}
          description={t('settings.languageUrduDesc')}
          selected={language === 'ur'}
          last
          onPress={() => handleLanguage('ur')}
        />
      </SettingsSection>

      <SettingsSection title={t('settings.account')}>
        <SettingsNavRow
          icon="account-circle-outline"
          title={t('settings.accountProfile')}
          description={t('settings.accountDesc')}
          onPress={() => navigation.navigate('AccountSettings')}
        />
        <SettingsNavRow
          icon="bell-outline"
          title={t('settings.notifications')}
          description={t('settings.notificationsHubDesc')}
          last
          onPress={() => navigation.navigate('NotificationSettings')}
        />
      </SettingsSection>

      <SettingsSection title={t('settings.about')}>
        <SettingsNavRow
          icon="information-outline"
          title={t('settings.aboutSupport')}
          description={t('settings.aboutSupportDesc')}
          last
          onPress={() => navigation.navigate('AboutSupport')}
        />
      </SettingsSection>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: spacing.xxl, paddingTop: spacing.md },
});
