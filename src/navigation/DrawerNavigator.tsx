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
  type NavigationProp,
} from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { MainTabNavigator } from './MainTabNavigator';
import { DrawerContext, type ActiveRoute } from './drawerContext';
import type { MainTabParamList } from '@/types/navigation';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAppSelector } from '@/redux/hooks';
import { getInitials } from '@/utils/formatters';
import { borderRadius, getDrawerShadow, layout, spacing, typography } from '@/theme';
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
    id: 'dashboard',
    labelKey: 'drawer.dashboard',
    icon: 'view-dashboard-outline',
    tab: 'Dashboard',
    screen: 'DashboardHome',
    section: 'overview',
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
  open: boolean;
  slideAnim: Animated.Value;
  backdropAnim: Animated.Value;
  activeRoute: ActiveRoute | null;
  onClose: (onClosed?: () => void) => void;
  tabNavigationRef: React.RefObject<NavigationProp<MainTabParamList> | null>;
  isRTL: boolean;
}>(({ open, slideAnim, backdropAnim, activeRoute, onClose, tabNavigationRef, isRTL }) => {
  const { colors } = useAppTheme();
  const { t } = useLocalization();
  const insets = useSafeAreaInsets();
  const { user } = useAppSelector(state => state.auth);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });

    return () => subscription.remove();
  }, [open, onClose]);

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

  const goToProfile = useCallback(() => {
    const tabNavigation = tabNavigationRef.current;
    if (tabNavigation) {
      tabNavigation.dispatch(
        CommonActions.navigate({
          name: 'Profile',
          params: { screen: 'ProfileHome' },
        }),
      );
    }
    onClose();
  }, [onClose, tabNavigationRef]);

  return (
    <View
      pointerEvents={open ? 'auto' : 'none'}
      importantForAccessibility={open ? 'yes' : 'no-hide-descendants'}
      accessibilityViewIsModal={open}
      style={[StyleSheet.absoluteFill, styles.overlayHost]}
      collapsable={false}>
      <Animated.View
        style={[
          styles.backdrop,
          {
            backgroundColor: colors.overlay,
            opacity: backdropAnim,
          },
        ]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => onClose()}
          accessibilityLabel={t('drawer.closeMenu')}
          accessibilityRole="button"
        />
      </Animated.View>
      <Animated.View
        collapsable={false}
        style={[
          styles.drawerPanel,
          getDrawerShadow(isRTL),
          isRTL ? styles.drawerEnd : styles.drawerStart,
          {
            width: layout.drawerWidth,
            backgroundColor: colors.drawerSurface,
            paddingTop: insets.top,
            transform: [{ translateX: slideAnim }],
          },
        ]}>
        <Pressable
          onPress={goToProfile}
          accessibilityRole="button"
          accessibilityLabel={t('drawer.openProfile')}
          style={({ pressed }) => [
            styles.drawerHeader,
            { backgroundColor: colors.drawerHeader },
            pressed && styles.drawerHeaderPressed,
          ]}>
          <Avatar.Text
            size={52}
            label={getInitials(user?.name || t('common.user'))}
            style={{ backgroundColor: 'rgba(255,255,255,0.22)' }}
            color="#FFFFFF"
          />
          <Text style={styles.drawerName}>{user?.name || t('common.user')}</Text>
          <Text style={styles.drawerCompany}>{user?.company || t('common.appName')}</Text>
        </Pressable>

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
        </ScrollView>
      </Animated.View>
    </View>
  );
});

DrawerPanel.displayName = 'DrawerPanel';

export const DrawerNavigator: React.FC = () => {
  const { isRTL } = useLocalization();
  const closedOffset = isRTL ? layout.drawerWidth : -layout.drawerWidth;
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeRoute, setActiveRoute] = useState<ActiveRoute | null>(null);
  const slideAnim = useRef(new Animated.Value(closedOffset)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const tabNavigationRef = useRef<NavigationProp<MainTabParamList> | null>(null);

  useEffect(() => {
    if (!open) {
      slideAnim.setValue(closedOffset);
      backdropAnim.setValue(0);
    }
  }, [backdropAnim, closedOffset, open, slideAnim]);

  const setTabNavigation = useCallback(
    (navigation: NavigationProp<MainTabParamList> | null) => {
      tabNavigationRef.current = navigation;
    },
    [],
  );

  const animateDrawer = useCallback(
    (shouldOpen: boolean, onFinished?: () => void) => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: shouldOpen ? 0 : closedOffset,
          duration: shouldOpen ? OPEN_DURATION : CLOSE_DURATION,
          easing: shouldOpen ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: shouldOpen ? 1 : 0,
          duration: shouldOpen ? OPEN_DURATION : CLOSE_DURATION,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          onFinished?.();
        }
      });
    },
    [backdropAnim, closedOffset, slideAnim],
  );

  const openDrawer = useCallback(() => {
    if (open) {
      return;
    }

    slideAnim.setValue(closedOffset);
    backdropAnim.setValue(0);
    setMounted(true);
    setOpen(true);
    requestAnimationFrame(() => animateDrawer(true));
  }, [animateDrawer, backdropAnim, closedOffset, open, slideAnim]);

  const closeDrawer = useCallback(
    (onClosed?: () => void) => {
      if (!open) {
        setMounted(false);
        onClosed?.();
        return;
      }

      animateDrawer(false, () => {
        setOpen(false);
        setMounted(false);
        onClosed?.();
      });
    },
    [animateDrawer, open],
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
        {mounted ? (
          <DrawerPanel
            open={open}
            slideAnim={slideAnim}
            backdropAnim={backdropAnim}
            activeRoute={activeRoute}
            onClose={closeDrawer}
            tabNavigationRef={tabNavigationRef}
            isRTL={isRTL}
          />
        ) : null}
      </View>
    </DrawerContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlayHost: {
    zIndex: 10,
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
    overflow: 'hidden',
  },
  drawerStart: {
    left: 0,
  },
  drawerEnd: {
    right: 0,
  },
  drawerHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  drawerHeaderPressed: {
    opacity: 0.86,
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
});
