import React, { useCallback } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setLanguage } from '@/redux/slices/settingsSlice';
import { storage } from '@/utils/storage';
import { STORAGE_KEYS } from '@/constants';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import type { Language } from '@/types';
import type { ProfileStackParamList } from '@/types/navigation';
import { spacing } from '@/theme';
import { SettingsChoiceRow, SettingsHint, SettingsSection } from './settingsUi';

type Props = NativeStackScreenProps<ProfileStackParamList, 'LanguageSettings'>;

export const LanguageSettingsScreen: React.FC<Props> = () => {
  const { colors } = useAppTheme();
  const { t } = useLocalization();
  const dispatch = useAppDispatch();
  const language = useAppSelector(state => state.settings.language);

  const handleLanguage = useCallback(
    async (lang: Language) => {
      if (lang === language) {
        return;
      }
      await storage.setItem(STORAGE_KEYS.LANGUAGE, lang);
      dispatch(setLanguage(lang));
    },
    [dispatch, language],
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}>
      <SettingsHint>{t('settings.languageHint')}</SettingsHint>
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingTop: spacing.md, paddingBottom: spacing.xxl },
});
