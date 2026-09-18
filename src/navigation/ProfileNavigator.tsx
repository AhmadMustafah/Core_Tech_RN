import React, { useMemo } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';
import { EditProfileScreen } from '@/screens/profile/EditProfileScreen';
import { ChangePasswordScreen } from '@/screens/profile/ChangePasswordScreen';
import { SettingsScreen } from '@/screens/settings/SettingsScreen';
import { ThemeSettingsScreen } from '@/screens/settings/ThemeSettingsScreen';
import { AccountSettingsScreen } from '@/screens/settings/AccountSettingsScreen';
import { LanguageSettingsScreen } from '@/screens/settings/LanguageSettingsScreen';
import { NotificationSettingsScreen } from '@/screens/settings/NotificationSettingsScreen';
import { PreferencesSettingsScreen } from '@/screens/settings/PreferencesSettingsScreen';
import { AboutSupportScreen } from '@/screens/settings/AboutSupportScreen';
import { NotificationsScreen } from '@/screens/notifications/NotificationsScreen';
import { CustomerListScreen } from '@/screens/customers/CustomerListScreen';
import { CustomerDetailsScreen } from '@/screens/customers/CustomerDetailsScreen';
import { CustomerFormScreen } from '@/screens/customers/CustomerFormScreen';
import { SupplierListScreen } from '@/screens/suppliers/SupplierListScreen';
import { SupplierDetailsScreen } from '@/screens/suppliers/SupplierDetailsScreen';
import { SupplierFormScreen } from '@/screens/suppliers/SupplierFormScreen';
import { PrivacyPolicyScreen } from '@/screens/settings/PrivacyPolicyScreen';
import { AboutAppScreen } from '@/screens/settings/AboutAppScreen';
import { renderDrawerHeaderLeft } from './drawerContext';
import type { ProfileStackParamList } from '@/types/navigation';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { getStackScreenOptions } from '@/theme';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export const ProfileNavigator: React.FC = () => {
  const { colors } = useAppTheme();
  const { t, isRTL } = useLocalization();
  const screenOptions = useMemo(() => getStackScreenOptions(colors, isRTL), [colors, isRTL]);

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="ProfileHome"
        component={ProfileScreen}
        options={{ title: t('screen.profile'), headerLeft: renderDrawerHeaderLeft }}
      />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: t('screen.editProfile') }} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: t('screen.changePassword') }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: t('screen.settings') }} />
      <Stack.Screen name="ThemeSettings" component={ThemeSettingsScreen} options={{ title: t('screen.theme') }} />
      <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} options={{ title: t('screen.account') }} />
      <Stack.Screen name="LanguageSettings" component={LanguageSettingsScreen} options={{ title: t('screen.language') }} />
      <Stack.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
        options={{ title: t('screen.notificationSettings') }}
      />
      <Stack.Screen
        name="PreferencesSettings"
        component={PreferencesSettingsScreen}
        options={{ title: t('screen.preferences') }}
      />
      <Stack.Screen name="AboutSupport" component={AboutSupportScreen} options={{ title: t('screen.aboutSupport') }} />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: t('screen.notifications') }}
      />
      <Stack.Screen name="CustomerList" component={CustomerListScreen} options={{ title: t('screen.customers') }} />
      <Stack.Screen name="CustomerDetails" component={CustomerDetailsScreen} options={{ title: t('screen.customerDetails') }} />
      <Stack.Screen name="AddCustomer" component={CustomerFormScreen} options={{ title: t('screen.addCustomer') }} />
      <Stack.Screen name="EditCustomer" component={CustomerFormScreen} options={{ title: t('screen.editCustomer') }} />
      <Stack.Screen name="SupplierList" component={SupplierListScreen} options={{ title: t('screen.suppliers') }} />
      <Stack.Screen name="SupplierDetails" component={SupplierDetailsScreen} options={{ title: t('screen.supplierDetails') }} />
      <Stack.Screen name="AddSupplier" component={SupplierFormScreen} options={{ title: t('screen.addSupplier') }} />
      <Stack.Screen name="EditSupplier" component={SupplierFormScreen} options={{ title: t('screen.editSupplier') }} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ title: t('screen.privacyPolicy') }} />
      <Stack.Screen name="AboutApp" component={AboutAppScreen} options={{ title: t('screen.helpAbout') }} />
    </Stack.Navigator>
  );
};
