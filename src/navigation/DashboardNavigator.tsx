import React, { memo, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { DashboardScreen } from '@/screens/dashboard/DashboardScreen';
import { ActivityScreen } from '@/screens/dashboard/ActivityScreen';
import { NotificationsScreen } from '@/screens/notifications/NotificationsScreen';
import { NotificationDetailsScreen } from '@/screens/notifications/NotificationDetailsScreen';
import { TransactionsScreen } from '@/screens/dashboard/TransactionsScreen';
import { AlertsScreen } from '@/screens/dashboard/AlertsScreen';
import { renderDrawerHeaderLeft } from './drawerContext';
import { notificationService } from '@/services/notificationService';
import type { DashboardStackParamList } from '@/types/navigation';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { getStackScreenOptions } from '@/theme';

const Stack = createNativeStackNavigator<DashboardStackParamList>();

const DashboardNotificationButton = memo(() => {
  const navigation = useNavigation<NavigationProp<DashboardStackParamList>>();
  const { colors } = useAppTheme();
  const { t } = useLocalization();
  const [unreadCount, setUnreadCount] = useState(() => notificationService.getUnreadCount());

  useEffect(() => {
    const refresh = () => setUnreadCount(notificationService.getUnreadCount());
    refresh();
    return notificationService.subscribe(refresh);
  }, []);

  return (
    <View style={styles.bellWrap}>
      <IconButton
        icon="bell-outline"
        iconColor={colors.text}
        size={22}
        onPress={() => navigation.navigate('Notifications')}
        accessibilityLabel={t('screen.notifications')}
        style={styles.bellButton}
      />
      {unreadCount > 0 ? (
        unreadCount === 1 ? (
          <View
            pointerEvents="none"
            style={[styles.unreadDot, { backgroundColor: colors.error, borderColor: colors.surface }]}
          />
        ) : (
          <View
            pointerEvents="none"
            style={[styles.unreadBadge, { backgroundColor: colors.error, borderColor: colors.surface }]}>
            <Text style={styles.unreadCount}>{unreadCount > 9 ? '9+' : String(unreadCount)}</Text>
          </View>
        )
      ) : null}
    </View>
  );
});

DashboardNotificationButton.displayName = 'DashboardNotificationButton';

const renderDashboardHeaderRight = () => <DashboardNotificationButton />;

export const DashboardNavigator: React.FC = () => {
  const { colors } = useAppTheme();
  const { t, isRTL } = useLocalization();
  const screenOptions = useMemo(() => getStackScreenOptions(colors, isRTL), [colors, isRTL]);

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="DashboardHome"
        component={DashboardScreen}
        options={{
          title: t('screen.dashboard'),
          headerLeft: renderDrawerHeaderLeft,
          headerRight: renderDashboardHeaderRight,
        }}
      />
      <Stack.Screen
        name="Activity"
        component={ActivityScreen}
        options={{
          title: t('screen.activity'),
        }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: t('screen.notifications'),
        }}
      />
      <Stack.Screen
        name="NotificationDetails"
        component={NotificationDetailsScreen}
        options={{
          title: t('screen.notificationDetails'),
        }}
      />
      <Stack.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{
          title: t('screen.transactions'),
        }}
      />
      <Stack.Screen
        name="Alerts"
        component={AlertsScreen}
        options={{
          title: t('screen.alerts'),
        }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  bellWrap: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellButton: {
    margin: 0,
  },
  unreadDot: {
    position: 'absolute',
    top: 6,
    end: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
  },
  unreadBadge: {
    position: 'absolute',
    top: 3,
    end: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
  },
  unreadCount: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    lineHeight: 11,
  },
});
