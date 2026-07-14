import React, { useState, useCallback } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import { Text, Menu, Button, Divider } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomButton, CustomInput } from '@/components/common';
import { saleService } from '@/services/saleService';
import { productService } from '@/services/productService';
import { customerService } from '@/services/customerService';
import { useAppTheme } from '@/hooks/useAppTheme';
import { formatCurrency } from '@/utils/formatters';
import type { Customer, Product, SaleItem } from '@/types';
import type { SalesStackParamList } from '@/types/navigation';
import { spacing } from '@/theme';

type Props = NativeStackScreenProps<SalesStackParamList, 'CreateSale'>;

export const CreateSaleScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useAppTheme();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [items, setItems] = useState<SaleItem[]>([]);
  const [discount, setDiscount] = useState('0');
  const [tax, setTax] = useState('0');
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'pending' | 'partial'>('pending');
  const [loading, setLoading] = useState(false);
  const [customerMenu, setCustomerMenu] = useState(false);
  const [productMenu, setProductMenu] = useState(false);

  useFocusEffect(useCallback(() => {
    customerService.getAll().then(setCustomers);
    productService.getAll().then(setProducts);
  }, []));

  const addProduct = (product: Product) => {
    setItems(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        return prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.price } : i);
      }
      return [...prev, { productId: product.id, productName: product.name, quantity: 1, price: product.price, discount: 0, tax: 0, total: product.price }];
    });
    setProductMenu(false);
  };

  const subtotal = items.reduce((s, i) => s + i.quantity * i.price, 0);
  const totalDiscount = parseFloat(discount) || 0;
  const totalTax = parseFloat(tax) || 0;
  const totalAmount = subtotal - totalDiscount + totalTax;

  const handleSubmit = async () => {
    if (!selectedCustomer || items.length === 0) return;
    setLoading(true);
    try {
      await saleService.create({
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        items,
        subtotal,
        discount: totalDiscount,
        tax: totalTax,
        totalAmount,
        paymentStatus,
      });
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Text variant="titleLarge" style={{ color: colors.text, marginBottom: spacing.md }}>Create Sale</Text>

      <Menu visible={customerMenu} onDismiss={() => setCustomerMenu(false)} anchor={
        <Button mode="outlined" onPress={() => setCustomerMenu(true)} icon="account" style={styles.menuBtn}>
          {selectedCustomer ? selectedCustomer.name : 'Select Customer'}
        </Button>
      }>
        {customers.map(c => (
          <Menu.Item key={c.id} onPress={() => { setSelectedCustomer(c); setCustomerMenu(false); }} title={c.name} />
        ))}
      </Menu>

      <Menu visible={productMenu} onDismiss={() => setProductMenu(false)} anchor={
        <Button mode="outlined" onPress={() => setProductMenu(true)} icon="plus" style={styles.menuBtn}>Add Product</Button>
      }>
        {products.map(p => (
          <Menu.Item key={p.id} onPress={() => addProduct(p)} title={`${p.name} - ${formatCurrency(p.price)}`} />
        ))}
      </Menu>

      {items.map((item, index) => (
        <View key={index} style={[styles.itemCard, { backgroundColor: colors.surface }]}>
          <Text style={{ color: colors.text, fontWeight: '600' }}>{item.productName}</Text>
          <Text style={{ color: colors.textSecondary }}>Qty: {item.quantity} • {formatCurrency(item.price)}</Text>
        </View>
      ))}

      <CustomInput label="Discount" value={discount} onChangeText={setDiscount} keyboardType="numeric" />
      <CustomInput label="Tax" value={tax} onChangeText={setTax} keyboardType="numeric" />

      <View style={styles.paymentRow}>
        {(['paid', 'pending', 'partial'] as const).map(status => (
          <TouchableOpacity
            key={status}
            onPress={() => setPaymentStatus(status)}
            style={[
              styles.paymentChip,
              {
                backgroundColor:
                  paymentStatus === status ? colors.primary : colors.surfaceVariant,
              },
            ]}>
            <Text style={{ color: paymentStatus === status ? '#FFF' : colors.text }}>
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Divider style={{ marginVertical: spacing.md }} />
      <View style={styles.totalRow}><Text variant="titleMedium" style={{ color: colors.text }}>Total</Text><Text variant="titleLarge" style={{ color: colors.primary, fontWeight: '700' }}>{formatCurrency(totalAmount)}</Text></View>

      <CustomButton title="Create Sale" onPress={handleSubmit} loading={loading} fullWidth disabled={!selectedCustomer || items.length === 0} style={{ marginTop: spacing.lg }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  menuBtn: { marginBottom: spacing.md },
  itemCard: { padding: spacing.md, borderRadius: 8, marginBottom: spacing.sm },
  paymentRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  paymentChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 20 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
