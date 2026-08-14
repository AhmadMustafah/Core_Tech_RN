import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { updateAppPreferences } from '@/redux/slices/settingsSlice';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import type { SessionTimeout } from '@/types';
import type { ProfileStackParamList } from '@/types/navigation';
import { spacing } from '@/theme';
import {
  SettingsChoiceRow,
  SettingsHint,
  SettingsNavRow,
  SettingsSection,
  SettingsToggleRow,
} from './settingsUi';

type Props = NativeStackScreenProps<ProfileStackParamList, 'SecuritySettings'>;

const TIMEOUTS: { value: SessionTimeout; titleKey: 'settings.timeout15' | 'settings.timeout30' | 'settings.timeout60' }[] = [
  { value: '15', titleKey: 'settings.timeout15' },
  { value: '30', titleKey: 'settings.timeout30' },
  { value: '60', titleKey: 'settings.timeout60' },
];

export const SecuritySettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useAppTheme();
  const { t } = useLocalization();
  const dispatch = useAppDispatch();
  const preferences = useAppSelector(state => state.settings.preferences);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}>
      <SettingsHint>{t('settings.securityHint')}</SettingsHint>

      <SettingsSection title={t('settings.securityAccount')}>
        <SettingsNavRow
          icon="lock-reset"
          title={t('settings.securityPassword')}
          description={t('settings.securityPasswordDesc')}
          last
          onPress={() => navigation.navigate('ChangePassword')}
        />
      </SettingsSection>

      <SettingsSection title={t('settings.securityDevice')}>
        <SettingsToggleRow
          icon="fingerprint"
          title={t('settings.securityBiometric')}
          description={t('settings.securityBiometricDesc')}
          value={preferences.biometricLock}
          onValueChange={value => dispatch(updateAppPreferences({ biometricLock: value }))}
        />
        <SettingsToggleRow
          icon="cellphone-lock"
          title={t('settings.securityBackground')}
          description={t('settings.securityBackgroundDesc')}
          value={preferences.lockOnBackground}
          onValueChange={value => dispatch(updateAppPreferences({ lockOnBackground: value }))}
          last
        />
      </SettingsSection>

      <SettingsSection title={t('settings.securityTimeout')}>
        {TIMEOUTS.map((option, index) => (
          <SettingsChoiceRow
            key={option.value}
            icon="timer-outline"
            title={t(option.titleKey)}
            description={index === 0 ? t('settings.securityTimeoutDesc') : undefined}
            selected={preferences.sessionTimeout === option.value}
            last={index === TIMEOUTS.length - 1}
            onPress={() => dispatch(updateAppPreferences({ sessionTimeout: option.value }))}
          />
        ))}
      </SettingsSection>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingTop: spacing.md, paddingBottom: spacing.xxl },
});
