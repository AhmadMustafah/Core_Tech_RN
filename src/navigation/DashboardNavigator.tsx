import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { IconButton } from 'react-native-paper';
import { DashboardScreen } from '@/screens/dashboard/DashboardScreen';
import { ActivityScreen } from '@/screens/dashboard/ActivityScreen';
import { useDrawer } from './drawerContext';
import type { DashboardStackParamList } from '@/types/navigation';
import { useAppTheme } from '@/hooks/useAppTheme';

const Stack = createNativeStackNavigator<DashboardStackParamList>();

export const DashboardNavigator: React.FC = () => {
  const { colors } = useAppTheme();
  const { openDrawer } = useDrawer();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.background },
      }}>
      <Stack.Screen
        name="DashboardHome"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          headerLeft: () => (
            <IconButton
              icon="menu"
              iconColor={colors.text}
              size={24}
              onPress={openDrawer}
              accessibilityLabel="Open navigation menu"
            />
          ),
        }}
      />
      <Stack.Screen
        name="Activity"
        component={ActivityScreen}
        options={{ title: 'Activity History' }}
      />
    </Stack.Navigator>
  );
};
