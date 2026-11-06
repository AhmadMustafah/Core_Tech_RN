import React, { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setThemeMode } from '@/redux/slices/themeSlice';
import { storage } from '@/utils/storage';
import { settingsService } from '@/services/settingsService';
import { STORAGE_KEYS } from '@/constants';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import type { ThemeMode } from '@/types';
import { borderRadius, spacing } from '@/theme';
import { SettingsHint, SettingsSection } from './settingsUi';

export const ThemeSettingsScreen: React.FC = () => {
  const { colors } = useAppTheme();
  const { t } = useLocalization();
  const dispatch = useAppDispatch();
  const themeMode = useAppSelector(state => state.theme.mode);

  const handleThemeChange = useCallback(
    async (mode: ThemeMode) => {
      dispatch(setThemeMode(mode));
      await storage.setItem(STORAGE_KEYS.THEME_MODE, mode);
      settingsService.update({ themeMode: mode }).catch(() => undefined);
    },
    [dispatch],
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}>
      <SettingsHint>{t('settings.themeHint')}</SettingsHint>

      <SettingsSection>
        <View style={styles.choices}>
          <Pressable
            onPress={() => handleThemeChange('light')}
            style={[
              styles.choice,
              {
                backgroundColor: themeMode === 'light' ? colors.primaryMuted : colors.surfaceVariant,
                borderColor: themeMode === 'light' ? colors.primary : colors.border,
              },
            ]}>
            <Icon source="white-balance-sunny" size={22} color={colors.primary} />
            <View style={styles.choiceText}>
              <Text style={[styles.choiceTitle, { color: colors.text }]}>{t('settings.bright')}</Text>
              <Text style={[styles.choiceDesc, { color: colors.textSecondary }]}>
                {t('settings.brightDesc')}
              </Text>
            </View>
            {themeMode === 'light' ? <Icon source="check-circle" size={20} color={colors.primary} /> : null}
          </Pressable>
          <Pressable
            onPress={() => handleThemeChange('dark')}
            style={[
              styles.choice,
              {
                backgroundColor: themeMode === 'dark' ? colors.primaryMuted : colors.surfaceVariant,
                borderColor: themeMode === 'dark' ? colors.primary : colors.border,
              },
            ]}>
            <Icon source="moon-waning-crescent" size={22} color={colors.primary} />
            <View style={styles.choiceText}>
              <Text style={[styles.choiceTitle, { color: colors.text }]}>{t('settings.dark')}</Text>
              <Text style={[styles.choiceDesc, { color: colors.textSecondary }]}>
                {t('settings.darkDesc')}
              </Text>
            </View>
            {themeMode === 'dark' ? <Icon source="check-circle" size={20} color={colors.primary} /> : null}
          </Pressable>
        </View>
      </SettingsSection>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingTop: spacing.md, paddingBottom: spacing.xxl },
  choices: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  choice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  choiceText: {
    flex: 1,
    minWidth: 0,
  },
  choiceTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  choiceDesc: {
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },
});
