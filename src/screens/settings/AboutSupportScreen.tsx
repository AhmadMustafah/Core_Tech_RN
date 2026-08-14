import React, { useCallback } from 'react';
import { Linking, ScrollView, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { APP_NAME, APP_VERSION } from '@/constants';
import type { ProfileStackParamList } from '@/types/navigation';
import { spacing } from '@/theme';
import { SettingsHint, SettingsNavRow, SettingsSection } from './settingsUi';

type Props = NativeStackScreenProps<ProfileStackParamList, 'AboutSupport'>;

const SUPPORT_EMAIL = 'support@coretech-enterprise.com';

export const AboutSupportScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useAppTheme();
  const { t } = useLocalization();

  const openSupport = useCallback(() => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}`).catch(() => undefined);
  }, []);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}>
      <SettingsHint>{t('settings.aboutSupportHint', { app: APP_NAME })}</SettingsHint>

      <SettingsSection title={t('settings.about')}>
        <SettingsNavRow
          icon="information-outline"
          title={t('settings.aboutApp')}
          description={`${APP_NAME} v${APP_VERSION}`}
          onPress={() => navigation.navigate('AboutApp')}
        />
        <SettingsNavRow
          icon="shield-account-outline"
          title={t('settings.privacyPolicy')}
          description={t('settings.privacyPolicyDesc')}
          last
          onPress={() => navigation.navigate('PrivacyPolicy')}
        />
      </SettingsSection>

      <SettingsSection title={t('settings.support')}>
        <SettingsNavRow
          icon="lifebuoy"
          title={t('settings.helpCenter')}
          description={t('settings.helpCenterDesc')}
          onPress={() => navigation.navigate('AboutApp')}
        />
        <SettingsNavRow
          icon="email-outline"
          title={t('settings.contactSupport')}
          description={SUPPORT_EMAIL}
          last
          onPress={openSupport}
        />
      </SettingsSection>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingTop: spacing.md, paddingBottom: spacing.xxl },
});
