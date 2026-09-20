import React from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import { Text, Divider, Icon } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CommonActions } from '@react-navigation/native';
import { InitialsAvatar } from '@/components/common';
import { useAuth } from '@/hooks/useAuth';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import type { ProfileStackParamList } from '@/types/navigation';
import type { TranslationKey } from '@/localization';
import { spacing, borderRadius } from '@/theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ProfileHome'>;

const menuItems: {
  labelKey: TranslationKey;
  icon: string;
  screen: 'EditProfile' | 'ChangePassword' | 'CustomerList' | 'SupplierList' | 'Settings';
}[] = [
  { labelKey: 'profile.editProfile', icon: 'account-edit-outline', screen: 'EditProfile' },
  { labelKey: 'profile.changePassword', icon: 'lock-reset', screen: 'ChangePassword' },
  { labelKey: 'profile.customers', icon: 'account-group-outline', screen: 'CustomerList' },
  { labelKey: 'profile.suppliers', icon: 'truck-outline', screen: 'SupplierList' },
  { labelKey: 'profile.settings', icon: 'cog-outline', screen: 'Settings' },
];

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { colors } = useAppTheme();
  const { t, directionalIconStyle } = useLocalization();

  const handleLogout = async () => {
    await logout();
    navigation.getParent()?.getParent()?.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Auth', params: { screen: 'Login' } }],
      }),
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={[styles.profileCard, { backgroundColor: colors.surface }]}>
        <InitialsAvatar size={80} name={user?.name} imageUri={user?.avatar} />
        <Text variant="headlineSmall" style={{ color: colors.text, fontWeight: '700', marginTop: spacing.md }}>{user?.name}</Text>
        <Text variant="bodyMedium" style={{ color: colors.textSecondary }}>{user?.email}</Text>
        <Text variant="bodySmall" style={{ color: colors.textSecondary, marginTop: 4 }}>{user?.company}</Text>
        {user?.role && (
          <View style={[styles.roleBadge, { backgroundColor: colors.primary + '15' }]}>
            <Text style={{ color: colors.primary, fontWeight: '600' }}>{user.role}</Text>
          </View>
        )}
      </View>

      <View style={[styles.menuCard, { backgroundColor: colors.surface }]}>
        {menuItems.map((item, index) => (
          <React.Fragment key={item.screen}>
            <TouchableOpacity style={styles.menuItem} activeOpacity={0.75} onPress={() => navigation.navigate(item.screen)}>
              <Icon source={item.icon} size={24} color={colors.primary} />
              <Text variant="bodyLarge" style={{ color: colors.text, marginStart: spacing.md, flex: 1 }}>
                {t(item.labelKey)}
              </Text>
              <View style={directionalIconStyle}>
                <Icon source="chevron-right" size={24} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>
            {index < menuItems.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </View>

      <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.error + '15' }]} onPress={handleLogout}>
        <View style={directionalIconStyle}>
          <Icon source="logout" size={24} color={colors.error} />
        </View>
        <Text variant="bodyLarge" style={{ color: colors.error, marginStart: spacing.md, fontWeight: '600' }}>
          {t('profile.logout')}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  profileCard: { alignItems: 'center', padding: spacing.xl, borderRadius: borderRadius.lg, marginBottom: spacing.lg, elevation: 1 },
  roleBadge: { marginTop: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.full },
  menuCard: { borderRadius: borderRadius.lg, overflow: 'hidden', marginBottom: spacing.lg, elevation: 1 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: spacing.md },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: spacing.md, borderRadius: borderRadius.md },
});
