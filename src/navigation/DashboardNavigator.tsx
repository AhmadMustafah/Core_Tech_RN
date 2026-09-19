import React, { memo, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { DashboardScreen } from '@/screens/dashboard/DashboardScreen';
import { ActivityScreen } from '@/screens/dashboard/ActivityScreen';
import { NotificationsScreen } from '@/screens/notifications/NotificationsScreen';
import { renderDrawerHeaderLeft } from './drawerContext';
import type { DashboardStackParamList } from '@/types/navigation';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { getStackScreenOptions } from '@/theme';

const Stack = createNativeStackNavigator<DashboardStackParamList>();

const DashboardNotificationButton = memo(() => {
  const navigation = useNavigation<NavigationProp<DashboardStackParamList>>();
  const { colors } = useAppTheme();
  const { t } = useLocalization();

  return (
    <IconButton
      icon="bell-outline"
      iconColor={colors.text}
      size={22}
      onPress={() => navigation.navigate('Notifications')}
      accessibilityLabel={t('screen.notifications')}
      style={styles.bellButton}
    />
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
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  bellButton: {
    marginEnd: -4,
  },
});
