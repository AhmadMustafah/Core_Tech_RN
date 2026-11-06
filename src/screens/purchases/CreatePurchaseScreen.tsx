import React, { useState, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Menu, Button } from 'react-native-paper';
import { useCachedFocusLoad } from '@/hooks/useCachedFocusLoad';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomButton, FormScrollView } from '@/components/common';
import { useAppDispatch } from '@/redux/hooks';
import { markAppDataStale } from '@/redux/slices/dataSyncSlice';
import { purchaseService } from '@/services/purchaseService';
import { getErrorMessage } from '@/services/api';
import { productService } from '@/services/productService';
import { supplierService } from '@/services/supplierService';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { formatCurrency } from '@/utils/formatters';
import type { Product, PurchaseItem, Supplier } from '@/types';
import type { PurchaseStackParamList } from '@/types/navigation';
import { spacing } from '@/theme';

type Props = NativeStackScreenProps<PurchaseStackParamList, 'CreatePurchase'>;

export const CreatePurchaseScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { colors } = useAppTheme();
  const { t } = useLocalization();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [supplierMenu, setSupplierMenu] = useState(false);
  const [productMenu, setProductMenu] = useState(false);
  const [status, setStatus] = useState<'pending' | 'received'>('pending');

  const loadLookups = useCallback(() => {
    supplierService.getAll().then(setSuppliers);
    productService.getAll().then(setProducts);
  }, []);

  useCachedFocusLoad(loadLookups);

  const addProduct = (product: Product) => {
    setItems(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                total: (item.quantity + 1) * item.purchasePrice,
              }
            : item,
        );
      }
      return [...prev, {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        purchasePrice: product.costPrice,
        total: product.costPrice,
      }];
    });
    setProductMenu(false);
  };

  const changeQty = (productId: string, delta: number) => {
    setItems(prev =>
      prev
        .map(item =>
          item.productId === productId
            ? {
                ...item,
                quantity: item.quantity + delta,
                total: (item.quantity + delta) * item.purchasePrice,
              }
            : item,
        )
        .filter(item => item.quantity > 0),
    );
  };

  const totalAmount = items.reduce((s, i) => s + i.total, 0);

  const handleSubmit = async () => {
    if (loading) return;
    setFormError(null);
    if (!selectedSupplier) {
      setFormError(t('purchase.selectSupplier'));
      return;
    }
    if (items.length === 0) {
      setFormError(t('sale.pleaseProduct'));
      return;
    }
    setLoading(true);
    try {
      await purchaseService.create({
        supplierId: selectedSupplier.id,
        supplierName: selectedSupplier.name,
        items,
        totalAmount,
        status,
      });
      dispatch(markAppDataStale());
      navigation.goBack();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally { setLoading(false); }
  };

  return (
    <FormScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {formError ? <Text style={{ color: colors.error, marginBottom: spacing.sm }}>{formError}</Text> : null}

      <Menu visible={supplierMenu} onDismiss={() => setSupplierMenu(false)} anchor={
        <Button mode="outlined" onPress={() => setSupplierMenu(true)} icon="truck" style={styles.menuBtn}>
          {selectedSupplier ? selectedSupplier.name : t('purchase.selectSupplier')}
        </Button>
      }>
        {suppliers.map(s => <Menu.Item key={s.id} onPress={() => { setSelectedSupplier(s); setSupplierMenu(false); }} title={s.name} />)}
      </Menu>

      <Menu visible={productMenu} onDismiss={() => setProductMenu(false)} anchor={
        <Button mode="outlined" onPress={() => setProductMenu(true)} icon="plus" style={styles.menuBtn}>{t('sale.addProduct')}</Button>
      }>
        {products.map(p => <Menu.Item key={p.id} onPress={() => addProduct(p)} title={`${p.name} - ${formatCurrency(p.costPrice)}`} />)}
      </Menu>

      {items.map(item => (
        <View key={item.productId} style={[styles.itemCard, { backgroundColor: colors.surface }]}>
          <Text style={{ color: colors.text, fontWeight: '600' }}>{item.productName}</Text>
          <Text style={{ color: colors.textSecondary }}>{formatCurrency(item.purchasePrice)} · {formatCurrency(item.total)}</Text>
          <View style={styles.qtyRow}>
            <CustomButton title="−" compact onPress={() => changeQty(item.productId, -1)} />
            <Text style={{ color: colors.text, fontWeight: '700', minWidth: 24, textAlign: 'center' }}>{item.quantity}</Text>
            <CustomButton title="+" compact onPress={() => changeQty(item.productId, 1)} />
          </View>
        </View>
      ))}

      <Text variant="titleMedium" style={{ color: colors.secondary, fontWeight: '700', marginTop: spacing.md }}>
        {t('common.total')}: {formatCurrency(totalAmount)}
      </Text>

      <View style={styles.statusRow}>
        <CustomButton
          title={t('purchase.pending')}
          variant={status === 'pending' ? 'primary' : 'outline'}
          onPress={() => setStatus('pending')}
          style={styles.statusBtn}
        />
        <CustomButton
          title={t('purchase.received')}
          variant={status === 'received' ? 'primary' : 'outline'}
          onPress={() => setStatus('received')}
          style={styles.statusBtn}
        />
      </View>

      <CustomButton title={t('purchase.create')} onPress={handleSubmit} loading={loading} fullWidth
        disabled={!selectedSupplier || items.length === 0} style={{ marginTop: spacing.lg }} />
    </FormScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  menuBtn: { marginBottom: spacing.md },
  itemCard: { padding: spacing.md, borderRadius: 8, marginBottom: spacing.sm },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  statusRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  statusBtn: { flex: 1 },
});
