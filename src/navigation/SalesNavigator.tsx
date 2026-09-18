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
  const { t, isRTL } = useLocalization();
  const screenOptions = useMemo(() => getStackScreenOptions(colors, isRTL), [colors, isRTL]);

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="SalesList"
        component={SalesListScreen}
        options={{ title: t('screen.sales'), headerLeft: renderDrawerHeaderLeft }}
      />
      <Stack.Screen name="SaleDetails" component={SaleDetailsScreen} options={{ title: t('screen.saleDetails') }} />
      <Stack.Screen name="CreateSale" component={CreateSaleScreen} options={{ title: t('screen.createSale') }} />
      <Stack.Screen name="InvoicePreview" component={InvoicePreviewScreen} options={{ title: t('screen.invoice') }} />
    </Stack.Navigator>
  );
};
