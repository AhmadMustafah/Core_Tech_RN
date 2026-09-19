import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Avatar, Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppSelector } from '@/redux/hooks';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { getInitials } from '@/utils/formatters';
import { APP_NAME } from '@/constants';
import type { ProfileStackParamList } from '@/types/navigation';
import { borderRadius, spacing, typography } from '@/theme';
import { SettingsHint, SettingsNavRow, SettingsSection } from './settingsUi';

type Props = NativeStackScreenProps<ProfileStackParamList, 'AccountSettings'>;

export const AccountSettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useAppTheme();
  const { t } = useLocalization();
  const user = useAppSelector(state => state.auth.user);
  const companyName = user?.company?.trim();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}>
      <View style={[styles.companyCard, { backgroundColor: colors.surface }]}>
        <Avatar.Text
          size={64}
          label={getInitials(companyName || APP_NAME)}
          style={{ backgroundColor: colors.primary }}
        />
        <View style={styles.companyText}>
          <Text variant="labelSmall" style={{ color: colors.primary, fontWeight: '700' }}>
            {t('settings.companyWorkspace')}
          </Text>
          <Text variant="titleMedium" style={{ color: colors.text, fontWeight: '700', marginTop: 4 }}>
            {companyName || t('settings.accountCompanyEmpty')}
          </Text>
          <Text variant="bodySmall" style={{ color: colors.textSecondary, marginTop: spacing.xs }}>
            {t('settings.companyIntro')}
          </Text>
        </View>
      </View>

      <SettingsSection title={t('settings.accountCompany')}>
        <View style={styles.detailBlock}>
          <Text style={[styles.detailLabel, { color: colors.textMuted }]}>
            {t('settings.companyLegalName')}
          </Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>
            {companyName || t('settings.accountCompanyEmpty')}
          </Text>
        </View>
        <View style={[styles.detailBlock, styles.detailBlockLast]}>
          <Text style={[styles.detailLabel, { color: colors.textMuted }]}>
            {t('settings.companyWorkspaceName')}
          </Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>{APP_NAME}</Text>
        </View>
      </SettingsSection>

      {!companyName ? (
        <SettingsHint>{t('settings.companyEmptyHint')}</SettingsHint>
      ) : null}

      <SettingsSection>
        <SettingsNavRow
          icon="office-building-outline"
          title={t('settings.updateCompany')}
          description={t('settings.updateCompanyDesc')}
          last
          onPress={() => navigation.navigate('EditProfile')}
        />
      </SettingsSection>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingTop: spacing.md, paddingBottom: spacing.xxl },
  companyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    elevation: 1,
    gap: spacing.md,
  },
  companyText: {
    flex: 1,
    minWidth: 0,
  },
  detailBlock: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  detailBlockLast: {
    paddingBottom: spacing.lg,
  },
  detailLabel: {
    ...(typography.label as object),
    marginBottom: spacing.xs,
  },
  detailValue: {
    ...(typography.body as object),
    fontWeight: '600',
  },
});
