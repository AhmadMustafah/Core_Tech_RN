import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Avatar, Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppSelector } from '@/redux/hooks';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { getInitials } from '@/utils/formatters';
import type { ProfileStackParamList } from '@/types/navigation';
import { borderRadius, spacing } from '@/theme';
import { SettingsNavRow, SettingsSection } from './settingsUi';

type Props = NativeStackScreenProps<ProfileStackParamList, 'AccountSettings'>;

export const AccountSettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useAppTheme();
  const { t } = useLocalization();
  const user = useAppSelector(state => state.auth.user);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}>
      <View style={[styles.profileCard, { backgroundColor: colors.surface }]}>
        <Avatar.Text
          size={64}
          label={getInitials(user?.name || 'U')}
          style={{ backgroundColor: colors.primary }}
        />
        <View style={styles.profileText}>
          <Text variant="titleMedium" style={{ color: colors.text, fontWeight: '700' }}>
            {user?.name || t('settings.account')}
          </Text>
          <Text variant="bodySmall" style={{ color: colors.textSecondary, marginTop: 2 }}>
            {user?.email}
          </Text>
          {user?.company ? (
            <Text variant="bodySmall" style={{ color: colors.textMuted, marginTop: 2 }}>
              {user.company}
            </Text>
          ) : null}
          {user?.role ? (
            <View style={[styles.roleBadge, { backgroundColor: colors.primaryMuted }]}>
              <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 12 }}>
                {user.role}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <SettingsSection title={t('settings.account')}>
        <SettingsNavRow
          icon="account-edit-outline"
          title={t('settings.accountProfile')}
          description={t('settings.accountProfileDesc')}
          onPress={() => navigation.navigate('EditProfile')}
        />
        <SettingsNavRow
          icon="office-building-outline"
          title={t('settings.accountCompany')}
          description={user?.company || t('settings.accountCompanyEmpty')}
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    elevation: 1,
    gap: spacing.md,
  },
  profileText: {
    flex: 1,
    minWidth: 0,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
});
