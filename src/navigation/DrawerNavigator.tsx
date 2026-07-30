import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Text, Avatar, Divider, IconButton, TouchableRipple } from 'react-native-paper';
import {
  CommonActions,
  useNavigation,
  type NavigationProp,
} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { MainTabNavigator } from './MainTabNavigator';
import { DrawerContext } from './drawerContext';
import type {
  DashboardStackParamList,
  InventoryStackParamList,
  MainTabParamList,
  ProfileStackParamList,
  PurchaseStackParamList,
  RootStackParamList,
  SalesStackParamList,
} from '@/types/navigation';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAuth } from '@/hooks/useAuth';
import { useAppSelector } from '@/redux/hooks';
import { getInitials } from '@/utils/formatters';
import { borderRadius, spacing } from '@/theme';

const DRAWER_WIDTH = 280;
const OPEN_DURATION = 260;
const CLOSE_DURATION = 220;

type DrawerAction =
  | {
      label: string;
      icon: string;
      tab: 'Inventory';
      screen: keyof InventoryStackParamList;
    }
  | {
      label: string;
      icon: string;
      tab: 'Sales';
      screen: keyof SalesStackParamList;
    }
  | {
      label: string;
      icon: string;
      tab: 'Purchases';
      screen: keyof PurchaseStackParamList;
    }
  | {
      label: string;
      icon: string;
      tab: 'Profile';
      screen: keyof ProfileStackParamList;
    }
  | {
      label: string;
      icon: string;
      tab: 'Dashboard';
      screen: keyof DashboardStackParamList;
    };

const drawerActions: DrawerAction[] = [
  { label: 'Add Product', icon: 'plus-box', tab: 'Inventory', screen: 'AddProduct' },
  { label: 'New Sale', icon: 'cart-plus', tab: 'Sales', screen: 'CreateSale' },
  { label: 'New Purchase', icon: 'truck-plus', tab: 'Purchases', screen: 'CreatePurchase' },
  { label: 'Customers', icon: 'account-group', tab: 'Profile', screen: 'CustomerList' },
  { label: 'Activity', icon: 'history', tab: 'Dashboard', screen: 'Activity' },
];

const DrawerPanel: React.FC<{
  visible: boolean;
  slideAnim: Animated.Value;
  onClose: (onClosed?: () => void) => void;
  tabNavigationRef: React.RefObject<NavigationProp<MainTabParamList> | null>;
}> = ({ visible, slideAnim, onClose, tabNavigationRef }) => {
  const { colors } = useAppTheme();
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

  const navigateTo = (action: DrawerAction) => {
    onClose(() => {
      const tabNavigation = tabNavigationRef.current;
      if (!tabNavigation) {
        return;
      }

      tabNavigation.dispatch(
        CommonActions.navigate({
          name: action.tab,
          params: { screen: action.screen },
        }),
      );
    });
  };

  const handleLogout = () => {
    onClose(() => {
      logout();
      rootNavigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Auth', params: { screen: 'Login' } }],
        }),
      );
    });
  };

  if (!visible) {
    return null;
  }

  return (
    <>
      <Pressable
        style={styles.backdrop}
        onPress={() => onClose()}
        accessibilityLabel="Close menu"
        accessibilityRole="button"
      />
      <Animated.View
        style={[
          styles.drawerPanel,
          {
            width: DRAWER_WIDTH,
            backgroundColor: colors.surface,
            borderRightColor: colors.border,
            transform: [{ translateX: slideAnim }],
          },
        ]}>
        <ScrollView contentContainerStyle={styles.drawerContent}>
          <View style={styles.drawerHeader}>
            <View style={styles.drawerHeaderTop}>
              <Avatar.Text
                size={56}
                label={getInitials(user?.name || 'User')}
                style={{ backgroundColor: colors.primary }}
              />
              <IconButton
                icon="close"
                size={20}
                iconColor={colors.textSecondary}
                onPress={() => onClose()}
                accessibilityLabel="Close menu"
              />
            </View>
            <Text variant="titleMedium" style={[styles.drawerName, { color: colors.text }]}>
              {user?.name || 'User'}
            </Text>
            <Text variant="bodySmall" style={{ color: colors.textSecondary }}>
              {user?.company || 'CoreTech ERP'}
            </Text>
          </View>

          <Divider style={{ backgroundColor: colors.border }} />

          <Text
            variant="labelMedium"
            style={[styles.drawerSectionLabel, { color: colors.textSecondary }]}>
            MENU
          </Text>

          {drawerActions.map(action => (
            <TouchableRipple
              key={action.label}
              onPress={() => navigateTo(action)}
              style={styles.drawerItem}
              borderless
              rippleColor={colors.primary + '22'}>
              <View style={styles.drawerItemContent}>
                <View style={[styles.drawerItemIcon, { backgroundColor: colors.primary + '15' }]}>
                  <Icon name={action.icon} size={20} color={colors.primary} />
                </View>
                <Text variant="bodyLarge" style={{ color: colors.text, flex: 1 }}>
                  {action.label}
                </Text>
                <Icon name="chevron-right" size={18} color={colors.textSecondary} />
              </View>
            </TouchableRipple>
          ))}

          <View style={[styles.logoutSection, { borderTopColor: colors.border }]}>
            <TouchableRipple
              onPress={handleLogout}
              style={styles.drawerItem}
              borderless
              rippleColor={colors.error + '22'}>
              <View style={styles.drawerItemContent}>
                <View style={[styles.drawerItemIcon, { backgroundColor: colors.error + '15' }]}>
                  <Icon name="logout" size={20} color={colors.error} />
                </View>
                <Text
                  variant="bodyLarge"
                  style={{ color: colors.error, flex: 1, fontWeight: '600' }}>
                  Logout
                </Text>
              </View>
            </TouchableRipple>
          </View>
        </ScrollView>
      </Animated.View>
    </>
  );
};

export const DrawerNavigator: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const tabNavigationRef = useRef<NavigationProp<MainTabParamList> | null>(null);

  const setTabNavigation = useCallback(
    (navigation: NavigationProp<MainTabParamList> | null) => {
      tabNavigationRef.current = navigation;
    },
    [],
  );

  const animateDrawer = useCallback(
    (open: boolean, onFinished?: () => void) => {
      Animated.timing(slideAnim, {
        toValue: open ? 0 : -DRAWER_WIDTH,
        duration: open ? OPEN_DURATION : CLOSE_DURATION,
        easing: open ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          onFinished?.();
        }
      });
    },
    [slideAnim],
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
    }),
    [openDrawer, closeDrawer, setTabNavigation],
  );

  return (
    <DrawerContext.Provider value={contextValue}>
      <View style={styles.container}>
        <MainTabNavigator />
        <DrawerPanel
          visible={visible}
          slideAnim={slideAnim}
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
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    zIndex: 10,
  },
  drawerPanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 11,
    borderRightWidth: StyleSheet.hairlineWidth,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  drawerContent: {
    paddingTop: spacing.xl,
    flexGrow: 1,
  },
  drawerHeader: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  drawerHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  drawerName: {
    marginTop: spacing.sm,
    fontWeight: '700',
  },
  drawerSectionLabel: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    letterSpacing: 0.8,
  },
  drawerItem: {
    marginHorizontal: spacing.sm,
    marginBottom: spacing.xs,
    borderRadius: borderRadius.md,
  },
  drawerItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    gap: spacing.sm,
  },
  drawerItemIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutSection: {
    borderTopWidth: 1,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
});
