import React, { useMemo } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProductListScreen } from '@/screens/inventory/ProductListScreen';
import { ProductDetailsScreen } from '@/screens/inventory/ProductDetailsScreen';
import { ProductFormScreen } from '@/screens/inventory/ProductFormScreen';
import { renderDrawerHeaderLeft } from './drawerContext';
import type { InventoryStackParamList } from '@/types/navigation';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { getStackScreenOptions } from '@/theme';

const Stack = createNativeStackNavigator<InventoryStackParamList>();

export const InventoryNavigator: React.FC = () => {
  const { colors } = useAppTheme();
  const { t, isRTL } = useLocalization();
  const screenOptions = useMemo(() => getStackScreenOptions(colors, isRTL), [colors, isRTL]);

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="ProductList"
        component={ProductListScreen}
        options={{ title: t('screen.inventory'), headerLeft: renderDrawerHeaderLeft }}
      />
      <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} options={{ title: t('screen.productDetails') }} />
      <Stack.Screen name="AddProduct" component={ProductFormScreen} options={{ title: t('screen.addProduct') }} />
      <Stack.Screen name="EditProduct" component={ProductFormScreen} options={{ title: t('screen.editProduct') }} />
    </Stack.Navigator>
  );
};
