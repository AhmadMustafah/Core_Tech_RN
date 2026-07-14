import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProductListScreen } from '@/screens/inventory/ProductListScreen';
import { ProductDetailsScreen } from '@/screens/inventory/ProductDetailsScreen';
import { ProductFormScreen } from '@/screens/inventory/ProductFormScreen';
import type { InventoryStackParamList } from '@/types/navigation';
import { useAppTheme } from '@/hooks/useAppTheme';

const Stack = createNativeStackNavigator<InventoryStackParamList>();

export const InventoryNavigator: React.FC = () => {
  const { colors } = useAppTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.background },
      }}>
      <Stack.Screen name="ProductList" component={ProductListScreen} options={{ title: 'Inventory' }} />
      <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} options={{ title: 'Product Details' }} />
      <Stack.Screen name="AddProduct" component={ProductFormScreen} options={{ title: 'Add Product' }} />
      <Stack.Screen name="EditProduct" component={ProductFormScreen} options={{ title: 'Edit Product' }} />
    </Stack.Navigator>
  );
};
