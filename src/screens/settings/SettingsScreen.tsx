import React, { useCallback } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import { Text, Switch, List, Divider, SegmentedButtons, Icon } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setThemeMode, setThemePreset } from '@/redux/slices/themeSlice';
import { setNotificationsEnabled, setLanguage } from '@/redux/slices/settingsSlice';
import { storage } from '@/utils/storage';
import { STORAGE_KEYS } from '@/constants';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { APP_NAME, APP_VERSION } from '@/constants';
import type { ProfileStackParamList } from '@/types/navigation';
import type { ThemeMode, Language } from '@/types';
import { THEME_PRESET_OPTIONS, type ThemePreset, borderRadius, spacing } from '@/theme';
import type { TranslationKey } from '@/localization';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Settings'>;

const themeLabelKeys: Record<ThemePreset, TranslationKey> = {
  default: 'theme.default',
  ocean: 'theme.ocean',
  emerald: 'theme.emerald',
  purple: 'theme.purple',
  sunset: 'theme.sunset',
};

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useAppTheme();
  const { t } = useLocalization();
  const dispatch = useAppDispatch();
  const themeMode = useAppSelector(state => state.theme.mode);
  const themePreset = useAppSelector(state => state.theme.preset);
  const { notificationsEnabled, language } = useAppSelector(state => state.settings);

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

  const handleNotifications = useCallback(
    async (value: boolean) => {
      dispatch(setNotificationsEnabled(value));
      await storage.setItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED, value);
    },
    [dispatch],
  );

  const handleLanguage = useCallback(
    async (lang: Language) => {
      dispatch(setLanguage(lang));
      await storage.setItem(STORAGE_KEYS.LANGUAGE, lang);
    },
    [dispatch],
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.text }]}>
          {t('settings.appearance')}
        </Text>
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
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.text }]}>
          {t('settings.themes')}
        </Text>
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
                {selected ? (
                  <Icon source="check-circle" size={16} color={colors.primary} />
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.text }]}>
          {t('settings.preferences')}
        </Text>
        <List.Item
          title={t('settings.notifications')}
          description={t('settings.notificationsDesc')}
          left={props => <List.Icon {...props} icon="bell-outline" />}
          right={() => <Switch value={notificationsEnabled} onValueChange={handleNotifications} />}
        />
        <Divider />
        <Text variant="bodyMedium" style={{ color: colors.textSecondary, padding: spacing.md }}>
          {t('settings.language')}
        </Text>
        <SegmentedButtons
          value={language}
          onValueChange={v => handleLanguage(v as Language)}
          buttons={[
            { value: 'en', label: t('settings.english') },
            { value: 'ur', label: t('settings.urdu') },
          ]}
          style={styles.segmented}
        />
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.text }]}>
          {t('settings.about')}
        </Text>
        <List.Item
          title={t('settings.privacyPolicy')}
          left={props => <List.Icon {...props} icon="shield-account" />}
          onPress={() => navigation.navigate('PrivacyPolicy')}
          right={props => <List.Icon {...props} icon="chevron-right" />}
        />
        <Divider />
        <List.Item
          title={t('settings.aboutApp')}
          description={`${APP_NAME} v${APP_VERSION}`}
          left={props => <List.Icon {...props} icon="information-outline" />}
          onPress={() => navigation.navigate('AboutApp')}
          right={props => <List.Icon {...props} icon="chevron-right" />}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  section: {
    margin: spacing.md,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 1,
  },
  sectionTitle: {
    padding: spacing.md,
    fontWeight: '600',
  },
  sectionHint: {
    paddingHorizontal: spacing.md,
    marginTop: -spacing.sm,
    marginBottom: spacing.sm,
  },
  segmented: { margin: spacing.md, marginTop: 0 },
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
