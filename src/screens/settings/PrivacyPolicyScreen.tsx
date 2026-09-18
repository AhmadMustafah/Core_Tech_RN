import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { APP_NAME } from '@/constants';
import { spacing } from '@/theme';

export const PrivacyPolicyScreen: React.FC = () => {
  const { colors } = useAppTheme();
  const { t, directionStyle } = useLocalization();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text variant="headlineSmall" style={[{ color: colors.text, fontWeight: '700', marginBottom: spacing.lg }, directionStyle]}>
        {t('privacy.title')}
      </Text>
      <Text variant="bodyMedium" style={[{ color: colors.text, lineHeight: 24, marginBottom: spacing.md }, directionStyle]}>
        {t('privacy.intro', { app: APP_NAME })}
      </Text>
      <Text variant="titleMedium" style={[{ color: colors.text, fontWeight: '600', marginBottom: spacing.sm }, directionStyle]}>
        {t('privacy.dataTitle')}
      </Text>
      <Text variant="bodyMedium" style={[{ color: colors.textSecondary, lineHeight: 22, marginBottom: spacing.md }, directionStyle]}>
        {t('privacy.dataBody')}
      </Text>
      <Text variant="titleMedium" style={[{ color: colors.text, fontWeight: '600', marginBottom: spacing.sm }, directionStyle]}>
        {t('privacy.securityTitle')}
      </Text>
      <Text variant="bodyMedium" style={[{ color: colors.textSecondary, lineHeight: 22, marginBottom: spacing.md }, directionStyle]}>
        {t('privacy.securityBody')}
      </Text>
      <Text variant="titleMedium" style={[{ color: colors.text, fontWeight: '600', marginBottom: spacing.sm }, directionStyle]}>
        {t('privacy.contactTitle')}
      </Text>
      <Text variant="bodyMedium" style={[{ color: colors.textSecondary, lineHeight: 22 }, directionStyle]}>
        {t('privacy.contactBody')}
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({ container: { flex: 1, padding: spacing.lg } });
