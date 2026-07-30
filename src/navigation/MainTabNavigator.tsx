import React, { useEffect } from 'react';
import {
  BottomTabBar,
  createBottomTabNavigator,
  type BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import { type NavigationProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { DashboardNavigator } from './DashboardNavigator';
import { InventoryNavigator } from './InventoryNavigator';
import { SalesNavigator } from './SalesNavigator';
import { PurchaseNavigator } from './PurchaseNavigator';
import { ProfileNavigator } from './ProfileNavigator';
import { useDrawer } from './drawerContext';
import type { MainTabParamList } from '@/types/navigation';
import { useAppTheme } from '@/hooks/useAppTheme';

const Tab = createBottomTabNavigator<MainTabParamList>();

const DrawerTabBar: React.FC<BottomTabBarProps> = props => {
  const { setTabNavigation } = useDrawer();

  useEffect(() => {
    setTabNavigation(props.navigation as NavigationProp<MainTabParamList>);
    return () => setTabNavigation(null);
  }, [props.navigation, setTabNavigation]);

  return <BottomTabBar {...props} />;
};

export const MainTabNavigator: React.FC = () => {
  const { colors } = useAppTheme();

  return (
    <Tab.Navigator
      tabBar={props => <DrawerTabBar {...props} />}
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
      <Tab.Screen name="Dashboard" component={DashboardNavigator} />
      <Tab.Screen name="Inventory" component={InventoryNavigator} />
      <Tab.Screen name="Sales" component={SalesNavigator} />
      <Tab.Screen name="Purchases" component={PurchaseNavigator} />
      <Tab.Screen name="Profile" component={ProfileNavigator} />
    </Tab.Navigator>
  );
};
