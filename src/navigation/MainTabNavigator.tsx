import React, { memo, useEffect, useMemo } from 'react';
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
import { useDrawer, type ActiveRoute } from './drawerContext';
import type { MainTabParamList } from '@/types/navigation';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { layout, tabPerformanceOptions, typography } from '@/theme';

const Tab = createBottomTabNavigator<MainTabParamList>();

const getActiveRoute = (navigation: NavigationProp<MainTabParamList>): ActiveRoute => {
  const state = navigation.getState();
  const tabRoute = state.routes[state.index];
  const nestedState = tabRoute.state;
  const nestedRoute =
    nestedState && nestedState.index != null
      ? nestedState.routes[nestedState.index]
      : undefined;

  return {
    tab: tabRoute.name as keyof MainTabParamList,
    screen: nestedRoute?.name,
  };
};

const DrawerTabBar: React.FC<BottomTabBarProps> = memo(props => {
  const { setTabNavigation, setActiveRoute } = useDrawer();

  const tabNavigation = props.navigation as unknown as NavigationProp<MainTabParamList>;

  useEffect(() => {
    setTabNavigation(tabNavigation);
    return () => setTabNavigation(null);
  }, [tabNavigation, setTabNavigation]);

  useEffect(() => {
    const updateActiveRoute = () => {
      setActiveRoute(getActiveRoute(tabNavigation));
    };

    updateActiveRoute();
    const unsubscribe = tabNavigation.addListener('state', updateActiveRoute);
    return unsubscribe;
  }, [tabNavigation, setActiveRoute]);

  return <BottomTabBar {...props} />;
});

DrawerTabBar.displayName = 'DrawerTabBar';

export const MainTabNavigator: React.FC = () => {
  const { colors } = useAppTheme();
  const { t } = useLocalization();

  const tabTitles = useMemo(
    () => ({
      Dashboard: t('tab.dashboard'),
      Inventory: t('tab.inventory'),
      Sales: t('tab.sales'),
      Purchases: t('tab.purchases'),
      Profile: t('tab.profile'),
    }),
    [t],
  );

  const screenOptions = useMemo(
    () =>
      ({ route }: { route: { name: string } }) => ({
        ...tabPerformanceOptions,
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.borderLight,
          borderTopWidth: 1,
          paddingBottom: 6,
          paddingTop: 4,
          height: layout.tabBarHeight,
          elevation: 8,
          shadowColor: colors.cardShadow,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 1,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          ...(typography.caption as object),
          fontWeight: '600' as const,
          marginTop: -2,
        },
        tabBarIcon: ({
          color,
          size,
          focused,
        }: {
          color: string;
          size: number;
          focused: boolean;
        }) => {
          const icons: Record<string, string> = {
            Dashboard: focused ? 'view-dashboard' : 'view-dashboard-outline',
            Inventory: focused ? 'package-variant' : 'package-variant-closed',
            Sales: focused ? 'cart' : 'cart-outline',
            Purchases: focused ? 'truck' : 'truck-outline',
            Profile: focused ? 'account-circle' : 'account-circle-outline',
          };
          return <Icon name={icons[route.name] || 'circle'} size={size - 1} color={color} />;
        },
      }),
    [colors],
  );

  return (
    <Tab.Navigator tabBar={props => <DrawerTabBar {...props} />} screenOptions={screenOptions}>
      <Tab.Screen name="Dashboard" component={DashboardNavigator} options={{ title: tabTitles.Dashboard }} />
      <Tab.Screen name="Inventory" component={InventoryNavigator} options={{ title: tabTitles.Inventory }} />
      <Tab.Screen name="Sales" component={SalesNavigator} options={{ title: tabTitles.Sales }} />
      <Tab.Screen name="Purchases" component={PurchaseNavigator} options={{ title: tabTitles.Purchases }} />
      <Tab.Screen name="Profile" component={ProfileNavigator} options={{ title: tabTitles.Profile }} />
    </Tab.Navigator>
  );
};
