import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { updateAppPreferences } from '@/redux/slices/settingsSlice';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import type { CurrencyDisplay, DateFormat } from '@/types';
import { spacing } from '@/theme';
import {
  SettingsChoiceRow,
  SettingsHint,
  SettingsSection,
  SettingsToggleRow,
} from './settingsUi';

const DATE_OPTIONS: { value: DateFormat; titleKey: 'settings.dateDmy' | 'settings.dateMdy' | 'settings.dateYmd' }[] = [
  { value: 'dmy', titleKey: 'settings.dateDmy' },
  { value: 'mdy', titleKey: 'settings.dateMdy' },
  { value: 'ymd', titleKey: 'settings.dateYmd' },
];

const CURRENCY_OPTIONS: {
  value: CurrencyDisplay;
  titleKey: 'settings.currencySymbol' | 'settings.currencyCode';
  descKey: 'settings.currencySymbolDesc' | 'settings.currencyCodeDesc';
}[] = [
  { value: 'symbol', titleKey: 'settings.currencySymbol', descKey: 'settings.currencySymbolDesc' },
  { value: 'code', titleKey: 'settings.currencyCode', descKey: 'settings.currencyCodeDesc' },
];

export const PreferencesSettingsScreen: React.FC = () => {
  const { colors } = useAppTheme();
  const { t } = useLocalization();
  const dispatch = useAppDispatch();
  const preferences = useAppSelector(state => state.settings.preferences);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}>
      <SettingsHint>{t('settings.preferencesHint')}</SettingsHint>

      <SettingsSection title={t('settings.workspaceDisplay')}>
        <SettingsToggleRow
          icon="view-compact-outline"
          title={t('settings.compactLists')}
          description={t('settings.compactListsDesc')}
          value={preferences.compactLists}
          onValueChange={value => dispatch(updateAppPreferences({ compactLists: value }))}
        />
        <SettingsToggleRow
          icon="delete-alert-outline"
          title={t('settings.confirmDeletes')}
          description={t('settings.confirmDeletesDesc')}
          value={preferences.confirmDeletes}
          onValueChange={value => dispatch(updateAppPreferences({ confirmDeletes: value }))}
        />
        <SettingsToggleRow
          icon="vibrate"
          title={t('settings.haptics')}
          description={t('settings.hapticsDesc')}
          value={preferences.hapticsEnabled}
          onValueChange={value => dispatch(updateAppPreferences({ hapticsEnabled: value }))}
          last
        />
      </SettingsSection>

      <SettingsSection title={t('settings.dateFormat')}>
        {DATE_OPTIONS.map((option, index) => (
          <SettingsChoiceRow
            key={option.value}
            icon="calendar-month-outline"
            title={t(option.titleKey)}
            selected={preferences.dateFormat === option.value}
            last={index === DATE_OPTIONS.length - 1}
            onPress={() => dispatch(updateAppPreferences({ dateFormat: option.value }))}
          />
        ))}
      </SettingsSection>

      <SettingsSection title={t('settings.currencyFormat')}>
        {CURRENCY_OPTIONS.map((option, index) => (
          <SettingsChoiceRow
            key={option.value}
            icon="cash"
            title={t(option.titleKey)}
            description={t(option.descKey)}
            selected={preferences.currencyFormat === option.value}
            last={index === CURRENCY_OPTIONS.length - 1}
            onPress={() => dispatch(updateAppPreferences({ currencyFormat: option.value }))}
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
