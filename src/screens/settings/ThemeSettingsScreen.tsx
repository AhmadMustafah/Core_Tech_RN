import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text, SegmentedButtons, Icon } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setThemeMode, setThemePreset } from '@/redux/slices/themeSlice';
import { storage } from '@/utils/storage';
import { STORAGE_KEYS } from '@/constants';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import type { ThemeMode } from '@/types';
import { THEME_PRESET_OPTIONS, type ThemePreset, borderRadius, spacing } from '@/theme';
import type { TranslationKey } from '@/localization';
import { SettingsHint, SettingsSection } from './settingsUi';

const themeLabelKeys: Record<ThemePreset, TranslationKey> = {
  default: 'theme.default',
  ocean: 'theme.ocean',
  emerald: 'theme.emerald',
  purple: 'theme.purple',
  sunset: 'theme.sunset',
};

export const ThemeSettingsScreen: React.FC = () => {
  const { colors } = useAppTheme();
  const { t } = useLocalization();
  const dispatch = useAppDispatch();
  const themeMode = useAppSelector(state => state.theme.mode);
  const themePreset = useAppSelector(state => state.theme.preset);

  const handleThemeChange = useCallback(
    async (mode: ThemeMode) => {
      dispatch(setThemeMode(mode));
      await storage.setItem(STORAGE_KEYS.THEME_MODE, mode);
    },
    [dispatch],
  );

  const handlePresetChange = useCallback(
    async (preset: ThemePreset) => {
      dispatch(setThemePreset(preset));
      await storage.setItem(STORAGE_KEYS.THEME_PRESET, preset);
    },
    [dispatch],
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}>
      <SettingsHint>{t('settings.themeHint')}</SettingsHint>

      <SettingsSection title={t('settings.appearance')}>
        <SegmentedButtons
          value={themeMode}
          onValueChange={v => handleThemeChange(v as ThemeMode)}
          buttons={[
            { value: 'light', label: t('settings.light'), icon: 'white-balance-sunny' },
            { value: 'dark', label: t('settings.dark'), icon: 'moon-waning-crescent' },
            { value: 'system', label: t('settings.system'), icon: 'theme-light-dark' },
          ]}
          style={styles.segmented}
        />
      </SettingsSection>

      <SettingsSection title={t('settings.themes')}>
        <Text variant="bodySmall" style={[styles.sectionHint, { color: colors.textSecondary }]}>
          {t('settings.themesHint')}
        </Text>
        <View style={styles.presetGrid}>
          {THEME_PRESET_OPTIONS.map(option => {
            const selected = themePreset === option.id;
            return (
              <TouchableOpacity
                key={option.id}
                activeOpacity={0.82}
                onPress={() => handlePresetChange(option.id)}
                style={[
                  styles.presetChip,
                  {
                    backgroundColor: selected ? colors.primaryMuted : colors.surfaceVariant,
                    borderColor: selected ? colors.primary : colors.border,
                  },
                ]}>
                <View style={[styles.presetSwatch, { backgroundColor: option.swatch }]} />
                <Text
                  style={[
                    styles.presetLabel,
                    { color: selected ? colors.primary : colors.text },
                    selected && styles.presetLabelSelected,
                  ]}>
                  {t(themeLabelKeys[option.id])}
                </Text>
                {selected ? <Icon source="check-circle" size={16} color={colors.primary} /> : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </SettingsSection>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingTop: spacing.md, paddingBottom: spacing.xxl },
  segmented: { margin: spacing.md },
  sectionHint: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    gap: spacing.sm,
    minWidth: '47%',
    flexGrow: 1,
  },
  presetSwatch: {
    width: 14,
    height: 14,
    borderRadius: borderRadius.full,
  },
  presetLabel: {
    fontSize: 13,
    flex: 1,
    fontWeight: '500',
  },
  presetLabelSelected: {
    fontWeight: '600',
  },
});
