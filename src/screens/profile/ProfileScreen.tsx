import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Avatar, Icon, Text } from 'react-native-paper';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CustomButton, LogoutConfirmModal } from '@/components/common';
import { resetToLogin } from '@/navigation/navHelpers';
import { useAuth } from '@/hooks/useAuth';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { getInitials } from '@/utils/formatters';
import type { MainShellParamList, MainTabParamList, ProfileStackParamList } from '@/types/navigation';
import { borderRadius, spacing } from '@/theme';
import { SettingsNavRow, SettingsSection } from '@/screens/settings/settingsUi';
import { logout as logoutAction } from '@/redux/slices/authSlice';

type Props = CompositeScreenProps<
  NativeStackScreenProps<ProfileStackParamList, 'ProfileHome'>,
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, 'Profile'>,
    NativeStackScreenProps<MainShellParamList>
  >
>;

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, logout, isLoggingOut } = useAuth();
  const { colors } = useAppTheme();
  const { t } = useLocalization();
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const goToLogin = useCallback(() => {
    resetToLogin(navigation);
  }, [navigation]);

  const closeLogout = () => {
    if (isLoggingOut) {
      return;
    }
    setLogoutVisible(false);
    setLogoutError(null);
  };

  const performLogout = useCallback(async () => {
    if (isLoggingOut) {
      return;
    }
    setLogoutError(null);
    const result = await logout();
    if ('condition' in result.meta && result.meta.condition) {
      return;
    }
    if (logoutAction.rejected.match(result) && result.payload) {
      setLogoutError(String(result.payload));
    }
    setLogoutVisible(false);
    goToLogin();
  }, [goToLogin, isLoggingOut, logout]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}>
      <View style={[styles.hero, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
        <View style={styles.heroRow}>
          <Avatar.Text
            size={72}
            label={getInitials(user?.name || t('common.user'))}
            color={colors.onPrimary}
            style={{ backgroundColor: colors.primary }}
          />
          <View style={styles.heroText}>
            <Text variant="titleLarge" numberOfLines={2} style={{ color: colors.text, fontWeight: '700' }}>
              {user?.name || t('common.user')}
            </Text>
            {user?.role ? (
              <View style={[styles.roleBadge, { backgroundColor: colors.primaryMuted }]}>
                <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 12, textTransform: 'capitalize' }}>
                  {user.role}
                </Text>
              </View>
            ) : null}
            {user?.email ? (
              <Text variant="bodySmall" numberOfLines={1} style={{ color: colors.textSecondary, marginTop: 6 }}>
                {user.email}
              </Text>
            ) : null}
          </View>
        </View>
        <CustomButton
          title={t('profile.editProfile')}
          variant="outline"
          compact
          onPress={() => navigation.navigate('EditProfile')}
        />
      </View>

      {(user?.email || user?.phone) ? (
        <SettingsSection title={t('profile.account')}>
          {user?.email ? (
            <SettingsNavRow
              icon="email-outline"
              title={t('profile.email')}
              description={user.email}
              last={!user?.phone}
            />
          ) : null}
          {user?.phone ? (
            <SettingsNavRow
              icon="phone-outline"
              title={t('profile.phone')}
              description={user.phone}
              last
            />
          ) : null}
        </SettingsSection>
      ) : null}

      {(user?.company || user?.role) ? (
        <SettingsSection title={t('profile.workInfo')}>
          {user?.company ? (
            <SettingsNavRow
              icon="office-building-outline"
              title={t('profile.company')}
              description={user.company}
              last={!user?.role}
            />
          ) : null}
          {user?.role ? (
            <SettingsNavRow
              icon="badge-account-outline"
              title={t('profile.role')}
              description={user.role}
              last
            />
          ) : null}
        </SettingsSection>
      ) : null}

      <SettingsSection title={t('profile.accountActions')}>
        <SettingsNavRow
          icon="account-group-outline"
          title={t('profile.customers')}
          onPress={() => navigation.navigate('CustomerList')}
        />
        <SettingsNavRow
          icon="truck-outline"
          title={t('profile.suppliers')}
          onPress={() => navigation.navigate('SupplierList')}
        />
        <SettingsNavRow
          icon="bell-outline"
          title={t('profile.notifications')}
          onPress={() => navigation.navigate('Notifications')}
        />
        <SettingsNavRow
          icon="cog-outline"
          title={t('profile.settings')}
          last
          onPress={() => navigation.navigate('Settings')}
        />
      </SettingsSection>

      <SettingsSection title={t('form.securitySection')}>
        <SettingsNavRow
          icon="lock-reset"
          title={t('profile.changePassword')}
          last
          onPress={() => navigation.navigate('ChangePassword')}
        />
      </SettingsSection>

      <Pressable
        onPress={() => {
          if (!isLoggingOut) {
            setLogoutError(null);
            setLogoutVisible(true);
          }
        }}
        disabled={isLoggingOut}
        style={[styles.logoutRow, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
        <View style={[styles.logoutIcon, { backgroundColor: colors.error + '16' }]}>
          <Icon source="logout" size={20} color={colors.error} />
        </View>
        <Text style={{ color: colors.error, fontWeight: '600', flex: 1 }}>{t('profile.logout')}</Text>
      </Pressable>

      <LogoutConfirmModal
        visible={logoutVisible}
        loading={isLoggingOut}
        error={logoutError}
        onCancel={closeLogout}
        onConfirm={() => {
          void performLogout();
        }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingTop: spacing.md, paddingBottom: spacing.xxl },
  hero: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    gap: spacing.md,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  heroText: {
    flex: 1,
    minWidth: 0,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    gap: spacing.md,
  },
  logoutIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
