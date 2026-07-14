import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PurchaseListScreen } from '@/screens/purchases/PurchaseListScreen';
import { PurchaseDetailsScreen } from '@/screens/purchases/PurchaseDetailsScreen';
import { CreatePurchaseScreen } from '@/screens/purchases/CreatePurchaseScreen';
import type { PurchaseStackParamList } from '@/types/navigation';
import { useAppTheme } from '@/hooks/useAppTheme';

const Stack = createNativeStackNavigator<PurchaseStackParamList>();

export const PurchaseNavigator: React.FC = () => {
  const { colors } = useAppTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.background },
      }}>
      <Stack.Screen name="PurchaseList" component={PurchaseListScreen} options={{ title: 'Purchases' }} />
      <Stack.Screen name="PurchaseDetails" component={PurchaseDetailsScreen} options={{ title: 'Purchase Details' }} />
      <Stack.Screen name="CreatePurchase" component={CreatePurchaseScreen} options={{ title: 'Create Purchase' }} />
    </Stack.Navigator>
  );
};
