import React, { useMemo } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SalesListScreen } from '@/screens/sales/SalesListScreen';
import { SaleDetailsScreen } from '@/screens/sales/SaleDetailsScreen';
import { CreateSaleScreen } from '@/screens/sales/CreateSaleScreen';
import { InvoicePreviewScreen } from '@/screens/sales/InvoicePreviewScreen';
import { renderDrawerHeaderLeft } from './drawerContext';
import type { SalesStackParamList } from '@/types/navigation';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { getStackScreenOptions } from '@/theme';

const Stack = createNativeStackNavigator<SalesStackParamList>();

export const SalesNavigator: React.FC = () => {
  const { colors } = useAppTheme();
  const { t } = useLocalization();
  const screenOptions = useMemo(() => getStackScreenOptions(colors), [colors]);

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="SalesList"
        component={SalesListScreen}
        options={{ title: t('screen.sales'), headerLeft: renderDrawerHeaderLeft }}
      />
      <Stack.Screen name="SaleDetails" component={SaleDetailsScreen} options={{ title: 'Sale Details' }} />
      <Stack.Screen name="CreateSale" component={CreateSaleScreen} options={{ title: 'Create Sale' }} />
      <Stack.Screen name="InvoicePreview" component={InvoicePreviewScreen} options={{ title: 'Invoice' }} />
    </Stack.Navigator>
  );
};
