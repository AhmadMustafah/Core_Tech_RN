import React, { useMemo } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DashboardScreen } from '@/screens/dashboard/DashboardScreen';
import { ActivityScreen } from '@/screens/dashboard/ActivityScreen';
import { renderDrawerHeaderLeft } from './drawerContext';
import type { DashboardStackParamList } from '@/types/navigation';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { getStackScreenOptions } from '@/theme';

const Stack = createNativeStackNavigator<DashboardStackParamList>();

export const DashboardNavigator: React.FC = () => {
  const { colors } = useAppTheme();
  const { t } = useLocalization();
  const screenOptions = useMemo(() => getStackScreenOptions(colors), [colors]);

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="DashboardHome"
        component={DashboardScreen}
        options={{
          title: t('screen.dashboard'),
          headerLeft: renderDrawerHeaderLeft,
        }}
      />
      <Stack.Screen
        name="Activity"
        component={ActivityScreen}
        options={{
          title: t('screen.activity'),
        }}
      />
    </Stack.Navigator>
  );
};
