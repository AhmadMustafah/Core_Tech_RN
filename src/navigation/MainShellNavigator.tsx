import React, { useMemo } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabNavigator } from './MainTabNavigator';
import { NotificationsScreen } from '@/screens/notifications/NotificationsScreen';
import { NotificationDetailsScreen } from '@/screens/notifications/NotificationDetailsScreen';
import { ActivityDetailsScreen } from '@/screens/dashboard/ActivityDetailsScreen';
import { SaleDetailsScreen } from '@/screens/sales/SaleDetailsScreen';
import { PurchaseDetailsScreen } from '@/screens/purchases/PurchaseDetailsScreen';
import { renderDrawerHeaderLeft } from './drawerContext';
import type { MainShellParamList } from '@/types/navigation';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { getStackScreenOptions } from '@/theme';

const Stack = createNativeStackNavigator<MainShellParamList>();

export const MainShellNavigator: React.FC = () => {
  const { colors } = useAppTheme();
  const { t, isRTL } = useLocalization();
  const screenOptions = useMemo(() => getStackScreenOptions(colors, isRTL), [colors, isRTL]);

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Tabs" component={MainTabNavigator} options={{ headerShown: false }} />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: t('screen.notifications'),
          headerLeft: renderDrawerHeaderLeft,
        }}
      />
      <Stack.Screen
        name="NotificationDetails"
        component={NotificationDetailsScreen}
        options={{ title: t('notify.details') }}
      />
      <Stack.Screen
        name="ActivityDetails"
        component={ActivityDetailsScreen}
        options={{ title: t('activity.details') }}
      />
      <Stack.Screen
        name="SaleDetails"
        component={SaleDetailsScreen}
        options={{ title: t('screen.saleDetails') }}
      />
      <Stack.Screen
        name="PurchaseDetails"
        component={PurchaseDetailsScreen}
        options={{ title: t('screen.purchaseDetails') }}
      />
    </Stack.Navigator>
  );
};
