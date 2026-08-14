import React, { useCallback, useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppSelector } from '@/redux/hooks';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import type { ProfileStackParamList } from '@/types/navigation';
import { spacing, typography } from '@/theme';
import { SettingsNavRow, SettingsSection } from './settingsUi';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Settings'>;

const THEME_MODE_KEYS = {
  light: 'settings.light',
  dark: 'settings.dark',
  system: 'settings.system',
} as const;

const THEME_PRESET_KEYS = {
  default: 'theme.default',
  ocean: 'theme.ocean',
  emerald: 'theme.emerald',
  purple: 'theme.purple',
  sunset: 'theme.sunset',
} as const;

type SettingsHubRoute =
  | 'AccountSettings'
  | 'ThemeSettings'
  | 'LanguageSettings'
  | 'NotificationSettings'
  | 'SecuritySettings'
  | 'PreferencesSettings'
  | 'AboutSupport';

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useAppTheme();
  const { t } = useLocalization();
  const { notificationsEnabled, language, preferences } = useAppSelector(state => state.settings);
  const themeMode = useAppSelector(state => state.theme.mode);
  const themePreset = useAppSelector(state => state.theme.preset);

  const themeValue = useMemo(
    () => `${t(THEME_MODE_KEYS[themeMode])} · ${t(THEME_PRESET_KEYS[themePreset])}`,
    [t, themeMode, themePreset],
  );

  const go = useCallback(
    (screen: SettingsHubRoute) => {
      navigation.navigate(screen);
    },
    [navigation],
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}>
      <View style={styles.intro}>
        <Text style={[styles.introTitle, { color: colors.text }]}>{t('settings.centerTitle')}</Text>
        <Text style={[styles.introSubtitle, { color: colors.textSecondary }]}>
          {t('settings.centerSubtitle')}
        </Text>
      </View>

      <SettingsSection title={t('settings.section.workspace')}>
        <SettingsNavRow
          icon="account-circle-outline"
          title={t('settings.account')}
          description={t('settings.accountDesc')}
          onPress={() => go('AccountSettings')}
        />
        <SettingsNavRow
          icon="palette-outline"
          title={t('settings.theme')}
          description={t('settings.themeDesc')}
          value={themeValue}
          onPress={() => go('ThemeSettings')}
        />
        <SettingsNavRow
          icon="translate"
          title={t('settings.language')}
          description={t('settings.languageDesc')}
          value={t(language === 'ur' ? 'settings.urdu' : 'settings.english')}
          last
          onPress={() => go('LanguageSettings')}
        />
      </SettingsSection>

      <SettingsSection title={t('settings.section.operations')}>
        <SettingsNavRow
          icon="bell-outline"
          title={t('settings.notifications')}
          description={t('settings.notificationsHubDesc')}
          value={t(notificationsEnabled ? 'settings.on' : 'settings.off')}
          onPress={() => go('NotificationSettings')}
        />
        <SettingsNavRow
          icon="shield-lock-outline"
          title={t('settings.security')}
          description={t('settings.securityDesc')}
          value={t(preferences.biometricLock ? 'settings.securityProtected' : 'settings.securityStandard')}
          onPress={() => go('SecuritySettings')}
        />
        <SettingsNavRow
          icon="tune"
          title={t('settings.preferencesTitle')}
          description={t('settings.preferencesDesc')}
          last
          onPress={() => go('PreferencesSettings')}
        />
      </SettingsSection>

      <SettingsSection title={t('settings.section.help')}>
        <SettingsNavRow
          icon="help-circle-outline"
          title={t('settings.aboutSupport')}
          description={t('settings.aboutSupportDesc')}
          last
          onPress={() => go('AboutSupport')}
        />
      </SettingsSection>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: spacing.xxl, paddingTop: spacing.sm },
  intro: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    paddingTop: spacing.sm,
  },
  introTitle: {
    ...(typography.h3 as object),
  },
  introSubtitle: {
    ...(typography.bodySmall as object),
    marginTop: spacing.xs,
  },
});
