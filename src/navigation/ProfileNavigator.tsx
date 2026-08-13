import React, { useMemo } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';
import { EditProfileScreen } from '@/screens/profile/EditProfileScreen';
import { ChangePasswordScreen } from '@/screens/profile/ChangePasswordScreen';
import { SettingsScreen } from '@/screens/settings/SettingsScreen';
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
  const { t } = useLocalization();
  const screenOptions = useMemo(() => getStackScreenOptions(colors), [colors]);

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="ProfileHome"
        component={ProfileScreen}
        options={{ title: t('screen.profile'), headerLeft: renderDrawerHeaderLeft }}
      />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'Change Password' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: t('screen.settings') }} />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: t('screen.notifications') }}
      />
      <Stack.Screen name="CustomerList" component={CustomerListScreen} options={{ title: 'Customers' }} />
      <Stack.Screen name="CustomerDetails" component={CustomerDetailsScreen} options={{ title: 'Customer Details' }} />
      <Stack.Screen name="AddCustomer" component={CustomerFormScreen} options={{ title: 'Add Customer' }} />
      <Stack.Screen name="EditCustomer" component={CustomerFormScreen} options={{ title: 'Edit Customer' }} />
      <Stack.Screen name="SupplierList" component={SupplierListScreen} options={{ title: 'Suppliers' }} />
      <Stack.Screen name="SupplierDetails" component={SupplierDetailsScreen} options={{ title: 'Supplier Details' }} />
      <Stack.Screen name="AddSupplier" component={SupplierFormScreen} options={{ title: 'Add Supplier' }} />
      <Stack.Screen name="EditSupplier" component={SupplierFormScreen} options={{ title: 'Edit Supplier' }} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ title: 'Privacy Policy' }} />
      <Stack.Screen name="AboutApp" component={AboutAppScreen} options={{ title: t('screen.helpAbout') }} />
    </Stack.Navigator>
  );
};
