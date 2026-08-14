import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Text, Avatar, TouchableRipple } from 'react-native-paper';
import {
  CommonActions,
  useNavigation,
  type NavigationProp,
} from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { MainTabNavigator } from './MainTabNavigator';
import { DrawerContext, type ActiveRoute } from './drawerContext';
import type { MainTabParamList, RootStackParamList } from '@/types/navigation';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAuth } from '@/hooks/useAuth';
import { useAppSelector } from '@/redux/hooks';
import { getInitials } from '@/utils/formatters';
import { borderRadius, layout, shadows, spacing, typography } from '@/theme';
import { useLocalization } from '@/hooks/useLocalization';
import type { TranslationKey } from '@/localization';

const OPEN_DURATION = 200;
const CLOSE_DURATION = 180;

type DrawerMenuItem = {
  id: string;
  labelKey: TranslationKey;
  icon: string;
  tab: keyof MainTabParamList;
  screen: string;
  section: 'overview' | 'operations' | 'insights';
};

const MENU_SECTIONS: { key: DrawerMenuItem['section']; titleKey: TranslationKey }[] = [
  { key: 'overview', titleKey: 'drawer.section.overview' },
  { key: 'operations', titleKey: 'drawer.section.operations' },
  { key: 'insights', titleKey: 'drawer.section.insights' },
];

const DRAWER_MENU_ITEMS: DrawerMenuItem[] = [
  {
    id: 'profile',
    labelKey: 'drawer.profile',
    icon: 'account-circle-outline',
    tab: 'Profile',
    screen: 'ProfileHome',
    section: 'overview',
  },
  {
    id: 'dashboard',
    labelKey: 'drawer.dashboard',
    icon: 'view-dashboard-outline',
    tab: 'Dashboard',
    screen: 'DashboardHome',
    section: 'overview',
  },
  {
    id: 'sales',
    labelKey: 'drawer.sales',
    icon: 'cart-outline',
    tab: 'Sales',
    screen: 'SalesList',
    section: 'operations',
  },
  {
    id: 'purchases',
    labelKey: 'drawer.purchases',
    icon: 'truck-outline',
    tab: 'Purchases',
    screen: 'PurchaseList',
    section: 'operations',
  },
  {
    id: 'inventory',
    labelKey: 'drawer.inventory',
    icon: 'warehouse',
    tab: 'Inventory',
    screen: 'ProductList',
    section: 'operations',
  },
  {
    id: 'products',
    labelKey: 'drawer.products',
    icon: 'package-variant-closed',
    tab: 'Inventory',
    screen: 'AddProduct',
    section: 'operations',
  },
  {
    id: 'reports',
    labelKey: 'drawer.reports',
    icon: 'chart-line',
    tab: 'Dashboard',
    screen: 'Activity',
    section: 'insights',
  },
  {
    id: 'notifications',
    labelKey: 'drawer.notifications',
    icon: 'bell-outline',
    tab: 'Profile',
    screen: 'Notifications',
    section: 'insights',
  },
  {
    id: 'settings',
    labelKey: 'drawer.settings',
    icon: 'cog-outline',
    tab: 'Profile',
    screen: 'Settings',
    section: 'insights',
  },
  {
    id: 'help',
    labelKey: 'drawer.help',
    icon: 'help-circle-outline',
    tab: 'Profile',
    screen: 'AboutApp',
    section: 'insights',
  },
];

const isItemActive = (item: DrawerMenuItem, activeRoute: ActiveRoute | null) => {
  if (!activeRoute) {
    return false;
  }

  return item.tab === activeRoute.tab && item.screen === activeRoute.screen;
};

const DrawerMenuRow = memo<{
  item: DrawerMenuItem;
  label: string;
  active: boolean;
  onPress: () => void;
}>(({ item, label, active, onPress }) => {
  const { colors } = useAppTheme();

  return (
    <TouchableRipple
      onPress={onPress}
      style={[
        styles.menuItem,
        active && { backgroundColor: colors.primaryMuted },
      ]}
      borderless
      rippleColor={colors.primary + '18'}>
      <View style={styles.menuItemContent}>
        <View
          style={[
            styles.menuIconWrap,
            {
              backgroundColor: active ? colors.primary + '22' : colors.surfaceVariant,
            },
          ]}>
          <Icon
            name={item.icon}
            size={20}
            color={active ? colors.primary : colors.textSecondary}
          />
        </View>
        <Text
          style={[
            styles.menuLabel,
            { color: active ? colors.primary : colors.text },
            active && styles.menuLabelActive,
          ]}>
          {label}
        </Text>
      </View>
    </TouchableRipple>
  );
});

DrawerMenuRow.displayName = 'DrawerMenuRow';

const DrawerPanel = memo<{
  visible: boolean;
  slideAnim: Animated.Value;
  activeRoute: ActiveRoute | null;
  onClose: (onClosed?: () => void) => void;
  tabNavigationRef: React.RefObject<NavigationProp<MainTabParamList> | null>;
}>(({ visible, slideAnim, activeRoute, onClose, tabNavigationRef }) => {
  const { colors } = useAppTheme();
  const { t, directionalIconStyle } = useLocalization();
  const insets = useSafeAreaInsets();
  const { user } = useAppSelector(state => state.auth);
  const { logout } = useAuth();
  const rootNavigation = useNavigation<NavigationProp<RootStackParamList>>();

  useEffect(() => {
    if (!visible) {
      return undefined;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });

    return () => subscription.remove();
  }, [visible, onClose]);

  const navigateTo = useCallback(
    (item: DrawerMenuItem) => {
      const tabNavigation = tabNavigationRef.current;
      if (tabNavigation) {
        tabNavigation.dispatch(
          CommonActions.navigate({
            name: item.tab,
            params: { screen: item.screen },
          }),
        );
      }
      onClose();
    },
    [onClose, tabNavigationRef],
  );

  const handleLogout = useCallback(() => {
    onClose(() => {
      logout();
      rootNavigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Auth', params: { screen: 'Login' } }],
        }),
      );
    });
  }, [logout, onClose, rootNavigation]);

  if (!visible) {
    return null;
  }

  return (
    <>
      <Pressable
        style={[styles.backdrop, { backgroundColor: colors.overlay }]}
        onPress={() => onClose()}
        accessibilityLabel={t('drawer.closeMenu')}
        accessibilityRole="button"
      />
      <Animated.View
        style={[
          styles.drawerPanel,
          shadows.drawer,
          {
            width: layout.drawerWidth,
            backgroundColor: colors.drawerSurface,
            paddingTop: insets.top,
            start: 0,
            transform: [{ translateX: slideAnim }],
          },
        ]}>
        <View style={[styles.drawerHeader, { backgroundColor: colors.drawerHeader }]}>
          <Avatar.Text
            size={52}
            label={getInitials(user?.name || 'User')}
            style={{ backgroundColor: 'rgba(255,255,255,0.22)' }}
            color="#FFFFFF"
          />
          <Text style={styles.drawerName}>{user?.name || 'User'}</Text>
          <Text style={styles.drawerCompany}>{user?.company || 'CoreTech ERP'}</Text>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.drawerScroll,
            { paddingBottom: spacing.lg + insets.bottom },
          ]}
          showsVerticalScrollIndicator={false}>
          {MENU_SECTIONS.map((section, sectionIndex) => (
            <View key={section.key}>
              {sectionIndex > 0 ? (
                <View style={[styles.sectionDivider, { backgroundColor: colors.borderLight }]} />
              ) : null}
              <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
                {t(section.titleKey)}
              </Text>
              {DRAWER_MENU_ITEMS.filter(item => item.section === section.key).map(item => (
                <DrawerMenuRow
                  key={item.id}
                  item={item}
                  label={t(item.labelKey)}
                  active={isItemActive(item, activeRoute)}
                  onPress={() => navigateTo(item)}
                />
              ))}
            </View>
          ))}

          <View style={[styles.sectionDivider, { backgroundColor: colors.borderLight }]} />
          <TouchableRipple
            onPress={handleLogout}
            style={styles.logoutItem}
            borderless
            rippleColor={colors.error + '18'}>
            <View style={styles.menuItemContent}>
              <View style={[styles.menuIconWrap, { backgroundColor: colors.error + '14' }]}>
                <Icon name="logout" size={20} color={colors.error} style={directionalIconStyle} />
              </View>
              <Text style={[styles.menuLabel, { color: colors.error, fontWeight: '600' }]}>
                {t('drawer.logout')}
              </Text>
            </View>
          </TouchableRipple>
        </ScrollView>
      </Animated.View>
    </>
  );
});

DrawerPanel.displayName = 'DrawerPanel';

export const DrawerNavigator: React.FC = () => {
  const { isRTL } = useLocalization();
  const closedOffset = isRTL ? layout.drawerWidth : -layout.drawerWidth;
  const [visible, setVisible] = useState(false);
  const [activeRoute, setActiveRoute] = useState<ActiveRoute | null>(null);
  const slideAnim = useRef(new Animated.Value(closedOffset)).current;
  const tabNavigationRef = useRef<NavigationProp<MainTabParamList> | null>(null);

  useEffect(() => {
    if (!visible) {
      slideAnim.setValue(closedOffset);
    }
  }, [closedOffset, slideAnim, visible]);

  const setTabNavigation = useCallback(
    (navigation: NavigationProp<MainTabParamList> | null) => {
      tabNavigationRef.current = navigation;
    },
    [],
  );

  const animateDrawer = useCallback(
    (open: boolean, onFinished?: () => void) => {
      Animated.timing(slideAnim, {
        toValue: open ? 0 : closedOffset,
        duration: open ? OPEN_DURATION : CLOSE_DURATION,
        easing: open ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          onFinished?.();
        }
      });
    },
    [closedOffset, slideAnim],
  );

  const openDrawer = useCallback(() => {
    setVisible(true);
    requestAnimationFrame(() => animateDrawer(true));
  }, [animateDrawer]);

  const closeDrawer = useCallback(
    (onClosed?: () => void) => {
      if (!visible) {
        onClosed?.();
        return;
      }

      animateDrawer(false, () => {
        setVisible(false);
        onClosed?.();
      });
    },
    [animateDrawer, visible],
  );

  const contextValue = useMemo(
    () => ({
      openDrawer,
      closeDrawer,
      setTabNavigation,
      activeRoute,
      setActiveRoute,
    }),
    [openDrawer, closeDrawer, setTabNavigation, activeRoute],
  );

  return (
    <DrawerContext.Provider value={contextValue}>
      <View style={styles.container}>
        <MainTabNavigator />
        <DrawerPanel
          visible={visible}
          slideAnim={slideAnim}
          activeRoute={activeRoute}
          onClose={closeDrawer}
          tabNavigationRef={tabNavigationRef}
        />
      </View>
    </DrawerContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    zIndex: 10,
  },
  drawerPanel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    zIndex: 11,
  },
  drawerHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  drawerName: {
    ...(typography.h3 as object),
    color: '#FFFFFF',
    marginTop: spacing.md,
  },
  drawerCompany: {
    ...(typography.bodySmall as object),
    color: 'rgba(255,255,255,0.78)',
    marginTop: spacing.xs,
  },
  drawerScroll: {
    paddingTop: spacing.sm,
  },
  sectionLabel: {
    ...(typography.label as object),
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  sectionDivider: {
    height: 1,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  menuItem: {
    marginHorizontal: spacing.sm,
    marginBottom: 2,
    borderRadius: borderRadius.md,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  menuIconWrap: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.sm + 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    ...(typography.body as object),
    flex: 1,
    fontWeight: '500',
  },
  menuLabelActive: {
    fontWeight: '600',
  },
  logoutItem: {
    marginHorizontal: spacing.sm,
    marginTop: spacing.xs,
    borderRadius: borderRadius.md,
  },
});
