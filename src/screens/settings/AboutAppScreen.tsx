import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { APP_NAME, APP_VERSION } from '@/constants';
import type { TranslationKey } from '@/localization';
import { spacing } from '@/theme';

const FEATURE_KEYS: TranslationKey[] = [
  'about.feature.dashboard',
  'about.feature.inventory',
  'about.feature.sales',
  'about.feature.purchases',
  'about.feature.customers',
  'about.feature.suppliers',
  'about.feature.notifications',
  'about.feature.darkMode',
];

export const AboutAppScreen: React.FC = () => {
  const { colors } = useAppTheme();
  const { t, directionStyle } = useLocalization();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={styles.logo}>🏢</Text>
        <Text variant="headlineMedium" style={{ color: colors.text, fontWeight: '700' }}>{APP_NAME}</Text>
        <Text variant="bodyMedium" style={{ color: colors.textSecondary }}>
          {t('common.version', { version: APP_VERSION })}
        </Text>
      </View>
      <Text variant="bodyMedium" style={[{ color: colors.text, lineHeight: 24, marginBottom: spacing.lg }, directionStyle]}>
        {t('about.body')}
      </Text>
      <Text variant="titleMedium" style={[{ color: colors.text, fontWeight: '600', marginBottom: spacing.sm }, directionStyle]}>
        {t('common.features')}
      </Text>
      {FEATURE_KEYS.map(key => (
        <Text key={key} variant="bodyMedium" style={[{ color: colors.textSecondary, marginBottom: spacing.xs }, directionStyle]}>
          • {t(key)}
        </Text>
      ))}
      <Text variant="bodySmall" style={[{ color: colors.textSecondary, marginTop: spacing.xl, textAlign: 'center' }, directionStyle]}>
        {t('about.copyright')}
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  logo: { fontSize: 64, marginBottom: spacing.md },
});
