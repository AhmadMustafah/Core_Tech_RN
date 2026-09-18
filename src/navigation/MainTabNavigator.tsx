import React, { memo, useEffect, useMemo, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  BottomTabBar,
  createBottomTabNavigator,
  type BottomTabBarButtonProps,
  type BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import {
  getFocusedRouteNameFromRoute,
  type NavigationProp,
} from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
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

const TAB_ROOT_SCREENS: Record<keyof MainTabParamList, string> = {
  Dashboard: 'DashboardHome',
  Inventory: 'ProductList',
  Sales: 'SalesList',
  Purchases: 'PurchaseList',
  Profile: 'ProfileHome',
};

const TAB_ICONS: Record<string, { active: string; inactive: string }> = {
  Dashboard: { active: 'view-dashboard', inactive: 'view-dashboard-outline' },
  Inventory: { active: 'package-variant', inactive: 'package-variant-closed' },
  Sales: { active: 'cart', inactive: 'cart-outline' },
  Purchases: { active: 'truck', inactive: 'truck-outline' },
  Profile: { active: 'account-circle', inactive: 'account-circle-outline' },
};

const ACTIVE_ICON_SCALE = 1.08;
const ACTIVE_ICON_LIFT = -5;
const TAB_ICON_ANIMATION = {
  duration: 220,
  easing: Easing.out(Easing.cubic),
};

const TabIcon = memo<{
  routeName: string;
  color: string;
  size: number;
  focused: boolean;
  pipColor: string;
}>(({ routeName, color, size, focused, pipColor }) => {
  const scale = useSharedValue(focused ? ACTIVE_ICON_SCALE : 1);
  const translateY = useSharedValue(focused ? ACTIVE_ICON_LIFT : 0);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    scale.value = withTiming(focused ? ACTIVE_ICON_SCALE : 1, TAB_ICON_ANIMATION);
    translateY.value = withTiming(focused ? ACTIVE_ICON_LIFT : 0, TAB_ICON_ANIMATION);
  }, [focused, scale, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  const icons = TAB_ICONS[routeName];
  const iconName = focused ? icons?.active : icons?.inactive;

  return (
    <Animated.View style={[styles.iconWrap, animatedStyle]}>
      <View
        style={[
          styles.activePip,
          { backgroundColor: focused ? pipColor : 'transparent' },
        ]}
      />
      <Icon name={iconName || 'circle'} size={size - 1} color={color} />
    </Animated.View>
  );
});

TabIcon.displayName = 'TabIcon';

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

const TabBarButton: React.FC<BottomTabBarButtonProps> = ({
  children,
  onPress,
  onLongPress,
  style,
  accessibilityState,
  accessibilityLabel,
  testID,
}) => {
  const focused = Boolean(accessibilityState?.selected);
  const { colors } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={accessibilityState}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      onPress={onPress}
      onLongPress={onLongPress}
      android_ripple={{ color: colors.primaryMuted, borderless: true }}
      style={({ pressed }) => [
        style,
        styles.tabButton,
        focused && { backgroundColor: colors.primaryMuted },
        pressed && styles.tabButtonPressed,
      ]}>
      {children}
    </Pressable>
  );
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
  const insets = useSafeAreaInsets();
  const tabBarHeight = layout.tabBarHeight + Math.max(insets.bottom, 8);

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
      ({ route }: { route: { name: string } }) => {
        const focusedRoute = getFocusedRouteNameFromRoute(route);
        const rootScreen = TAB_ROOT_SCREENS[route.name as keyof MainTabParamList];
        const showTabBar = focusedRoute == null || focusedRoute === rootScreen;

        return {
          ...tabPerformanceOptions,
          headerShown: false,
          tabBarHideOnKeyboard: true,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarButton: (props: BottomTabBarButtonProps) => <TabBarButton {...props} />,
          tabBarStyle: showTabBar
            ? {
                backgroundColor: colors.surface,
                borderTopColor: colors.borderLight,
                borderTopWidth: 1,
                paddingBottom: Math.max(insets.bottom, 6),
                paddingTop: 6,
                height: tabBarHeight,
                elevation: 8,
                shadowColor: colors.cardShadow,
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 1,
                shadowRadius: 8,
              }
            : { display: 'none' as const, height: 0 },
          tabBarLabelStyle: {
            ...(typography.caption as object),
            fontWeight: '600' as const,
            marginTop: 0,
          },
          tabBarIcon: ({
            color,
            size,
            focused,
          }: {
            color: string;
            size: number;
            focused: boolean;
          }) => (
            <TabIcon
              routeName={route.name}
              color={color}
              size={size}
              focused={focused}
              pipColor={colors.primary}
            />
          ),
        };
      },
    [colors, insets.bottom, tabBarHeight],
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

const styles = StyleSheet.create({
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonPressed: {
    opacity: 0.72,
  },
  iconWrap: {
    alignItems: 'center',
  },
  activePip: {
    width: 16,
    height: 3,
    borderRadius: 99,
    marginBottom: 3,
  },
});
