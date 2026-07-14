import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { DashboardScreen } from '@/screens/dashboard/DashboardScreen';
import { InventoryNavigator } from './InventoryNavigator';
import { SalesNavigator } from './SalesNavigator';
import { PurchaseNavigator } from './PurchaseNavigator';
import { ProfileNavigator } from './ProfileNavigator';
import type { MainTabParamList } from '@/types/navigation';
import { useAppTheme } from '@/hooks/useAppTheme';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator: React.FC = () => {
  const { colors } = useAppTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: 4,
          height: 60,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, string> = {
            Dashboard: 'view-dashboard-outline',
            Inventory: 'package-variant',
            Sales: 'cart-outline',
            Purchases: 'truck-outline',
            Profile: 'account-outline',
          };
          return <Icon name={icons[route.name] || 'circle'} size={size} color={color} />;
        },
      })}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: true, title: 'Dashboard', headerStyle: { backgroundColor: colors.surface }, headerTintColor: colors.text }} />
      <Tab.Screen name="Inventory" component={InventoryNavigator} />
      <Tab.Screen name="Sales" component={SalesNavigator} />
      <Tab.Screen name="Purchases" component={PurchaseNavigator} />
      <Tab.Screen name="Profile" component={ProfileNavigator} />
    </Tab.Navigator>
  );
};
