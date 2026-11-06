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
import { Text, Avatar, IconButton, TouchableRipple } from 'react-native-paper';
import { CommonActions, type NavigationProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { MainShellNavigator } from './MainShellNavigator';
import { popToTabs } from './navHelpers';
import { DrawerContext, type ActiveRoute } from './drawerContext';
import type { MainTabParamList } from '@/types/navigation';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAppSelector } from '@/redux/hooks';
import { getInitials } from '@/utils/formatters';
import { borderRadius, getDrawerShadow, layout, spacing, typography } from '@/theme';
import { useLocalization } from '@/hooks/useLocalization';
import { getDirectionalIconStyle } from '@/localization';
import type { TranslationKey } from '@/localization';

const OPEN_DURATION = 200;
const CLOSE_DURATION = 180;

type DrawerMenuItem = {
  id: string;
  labelKey: TranslationKey;
  icon: string;
  tab: keyof MainTabParamList;
  screen: string;
};

const DRAWER_MENU_ITEMS: DrawerMenuItem[] = [
  {
    id: 'products',
    labelKey: 'drawer.products',
    icon: 'package-variant-closed',
    tab: 'Inventory',
    screen: 'ProductList',
  },
  {
    id: 'history',
    labelKey: 'drawer.history',
    icon: 'history',
    tab: 'Dashboard',
    screen: 'Activity',
  },
  {
    id: 'profile',
    labelKey: 'drawer.profile',
    icon: 'account-circle-outline',
    tab: 'Profile',
    screen: 'ProfileHome',
  },
];

const SETTINGS_ITEM: DrawerMenuItem = {
  id: 'settings',
  labelKey: 'drawer.settings',
  icon: 'cog-outline',
  tab: 'Profile',
  screen: 'Settings',
};

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
  const { isRTL } = useLocalization();

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
          numberOfLines={1}
          style={[
            styles.menuLabel,
            { color: active ? colors.primary : colors.text },
            active && styles.menuLabelActive,
          ]}>
          {label}
        </Text>
        <Icon
          name="chevron-right"
          size={18}
          color={active ? colors.primary : colors.textMuted}
          style={getDirectionalIconStyle(isRTL)}
        />
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
        popToTabs(tabNavigation);
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

  const openSettings = useCallback(() => {
    navigateTo(SETTINGS_ITEM);
  }, [navigateTo]);

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
        <View style={[styles.drawerHeader, { backgroundColor: colors.drawerHeader }]}>
          <View style={styles.headerTop}>
            <Avatar.Text
              size={44}
              label={getInitials(user?.name || t('common.user'))}
              style={styles.headerAvatar}
              color="#FFFFFF"
            />
            <View style={styles.headerIdentity}>
              <Text style={styles.drawerName} numberOfLines={1}>
                {user?.name || t('common.user')}
              </Text>
              {user?.role ? (
                <Text style={styles.drawerRole} numberOfLines={1}>
                  {user.role}
                </Text>
              ) : null}
              <Text style={styles.drawerCompany} numberOfLines={1}>
                {user?.company || t('common.appName')}
              </Text>
            </View>
            <IconButton
              icon="cog-outline"
              iconColor="#FFFFFF"
              size={20}
              onPress={openSettings}
              accessibilityLabel={t('drawer.settings')}
              style={styles.settingsButton}
            />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.drawerScroll,
            { paddingBottom: spacing.lg + insets.bottom },
          ]}
          showsVerticalScrollIndicator={false}>
          <Text style={[styles.menuHeading, { color: colors.textMuted }]}>{t('drawer.menu')}</Text>
          {DRAWER_MENU_ITEMS.map(item => (
            <DrawerMenuRow
              key={item.id}
              item={item}
              label={t(item.labelKey)}
              active={isItemActive(item, activeRoute)}
              onPress={() => navigateTo(item)}
            />
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
        <MainShellNavigator />
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
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.12)',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerAvatar: {
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  headerIdentity: {
    flex: 1,
    minWidth: 0,
  },
  settingsButton: {
    margin: 0,
  },
  drawerName: {
    ...(typography.h4 as object),
    color: '#FFFFFF',
  },
  drawerRole: {
    ...(typography.caption as object),
    color: 'rgba(255,255,255,0.92)',
    marginTop: 2,
    textTransform: 'capitalize',
    fontWeight: '600',
  },
  drawerCompany: {
    ...(typography.caption as object),
    color: 'rgba(255,255,255,0.68)',
    marginTop: 2,
  },
  menuHeading: {
    ...(typography.caption as object),
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  drawerScroll: {
    paddingTop: spacing.xs,
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
