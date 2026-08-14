import React, { useMemo } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PurchaseListScreen } from '@/screens/purchases/PurchaseListScreen';
import { PurchaseDetailsScreen } from '@/screens/purchases/PurchaseDetailsScreen';
import { CreatePurchaseScreen } from '@/screens/purchases/CreatePurchaseScreen';
import { renderDrawerHeaderLeft } from './drawerContext';
import type { PurchaseStackParamList } from '@/types/navigation';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { getStackScreenOptions } from '@/theme';

const Stack = createNativeStackNavigator<PurchaseStackParamList>();

export const PurchaseNavigator: React.FC = () => {
  const { colors } = useAppTheme();
  const { t } = useLocalization();
  const screenOptions = useMemo(() => getStackScreenOptions(colors), [colors]);

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="PurchaseList"
        component={PurchaseListScreen}
        options={{ title: t('screen.purchases'), headerLeft: renderDrawerHeaderLeft }}
      />
      <Stack.Screen name="PurchaseDetails" component={PurchaseDetailsScreen} options={{ title: t('screen.purchaseDetails') }} />
      <Stack.Screen name="CreatePurchase" component={CreatePurchaseScreen} options={{ title: t('screen.createPurchase') }} />
    </Stack.Navigator>
  );
};
