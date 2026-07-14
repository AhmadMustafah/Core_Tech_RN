import React, { useState, useCallback } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { Text, Menu, Button } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomButton } from '@/components/common';
import { purchaseService } from '@/services/purchaseService';
import { productService } from '@/services/productService';
import { supplierService } from '@/services/supplierService';
import { useAppTheme } from '@/hooks/useAppTheme';
import { formatCurrency } from '@/utils/formatters';
import type { Product, PurchaseItem, Supplier } from '@/types';
import type { PurchaseStackParamList } from '@/types/navigation';
import { spacing } from '@/theme';

type Props = NativeStackScreenProps<PurchaseStackParamList, 'CreatePurchase'>;

export const CreatePurchaseScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useAppTheme();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [supplierMenu, setSupplierMenu] = useState(false);
  const [productMenu, setProductMenu] = useState(false);

  useFocusEffect(useCallback(() => {
    supplierService.getAll().then(setSuppliers);
    productService.getAll().then(setProducts);
  }, []));

  const addProduct = (product: Product) => {
    setItems(prev => [...prev, {
      productId: product.id, productName: product.name, quantity: 1,
      purchasePrice: product.costPrice, total: product.costPrice,
    }]);
    setProductMenu(false);
  };

  const totalAmount = items.reduce((s, i) => s + i.total, 0);

  const handleSubmit = async () => {
    if (!selectedSupplier || items.length === 0) return;
    setLoading(true);
    try {
      await purchaseService.create({
        supplierId: selectedSupplier.id,
        supplierName: selectedSupplier.name,
        items,
        totalAmount,
      });
      navigation.goBack();
    } finally { setLoading(false); }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Text variant="titleLarge" style={{ color: colors.text, marginBottom: spacing.md }}>Create Purchase</Text>

      <Menu visible={supplierMenu} onDismiss={() => setSupplierMenu(false)} anchor={
        <Button mode="outlined" onPress={() => setSupplierMenu(true)} icon="truck" style={styles.menuBtn}>
          {selectedSupplier ? selectedSupplier.name : 'Select Supplier'}
        </Button>
      }>
        {suppliers.map(s => <Menu.Item key={s.id} onPress={() => { setSelectedSupplier(s); setSupplierMenu(false); }} title={s.name} />)}
      </Menu>

      <Menu visible={productMenu} onDismiss={() => setProductMenu(false)} anchor={
        <Button mode="outlined" onPress={() => setProductMenu(true)} icon="plus" style={styles.menuBtn}>Add Product</Button>
      }>
        {products.map(p => <Menu.Item key={p.id} onPress={() => addProduct(p)} title={`${p.name} - ${formatCurrency(p.costPrice)}`} />)}
      </Menu>

      {items.map((item, i) => (
        <View key={i} style={[styles.itemCard, { backgroundColor: colors.surface }]}>
          <Text style={{ color: colors.text, fontWeight: '600' }}>{item.productName}</Text>
          <Text style={{ color: colors.textSecondary }}>Qty: {item.quantity} • {formatCurrency(item.purchasePrice)}</Text>
        </View>
      ))}

      <Text variant="titleMedium" style={{ color: colors.secondary, fontWeight: '700', marginTop: spacing.md }}>
        Total: {formatCurrency(totalAmount)}
      </Text>

      <CustomButton title="Create Purchase" onPress={handleSubmit} loading={loading} fullWidth
        disabled={!selectedSupplier || items.length === 0} style={{ marginTop: spacing.lg }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  menuBtn: { marginBottom: spacing.md },
  itemCard: { padding: spacing.md, borderRadius: 8, marginBottom: spacing.sm },
});
