import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SalesListScreen } from '@/screens/sales/SalesListScreen';
import { SaleDetailsScreen } from '@/screens/sales/SaleDetailsScreen';
import { CreateSaleScreen } from '@/screens/sales/CreateSaleScreen';
import { InvoicePreviewScreen } from '@/screens/sales/InvoicePreviewScreen';
import type { SalesStackParamList } from '@/types/navigation';
import { useAppTheme } from '@/hooks/useAppTheme';

const Stack = createNativeStackNavigator<SalesStackParamList>();

export const SalesNavigator: React.FC = () => {
  const { colors } = useAppTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.background },
      }}>
      <Stack.Screen name="SalesList" component={SalesListScreen} options={{ title: 'Sales' }} />
      <Stack.Screen name="SaleDetails" component={SaleDetailsScreen} options={{ title: 'Sale Details' }} />
      <Stack.Screen name="CreateSale" component={CreateSaleScreen} options={{ title: 'Create Sale' }} />
      <Stack.Screen name="InvoicePreview" component={InvoicePreviewScreen} options={{ title: 'Invoice' }} />
    </Stack.Navigator>
  );
};
