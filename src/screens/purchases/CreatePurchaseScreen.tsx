import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomButton, FormScrollView, FormIntro, FormErrorBanner, formScreenStyles, AppSelect } from '@/components/common';
import { purchaseService } from '@/services/purchaseService';
import { productService } from '@/services/productService';
import { supplierService } from '@/services/supplierService';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { formatCurrency } from '@/utils/formatters';
import type { Product, PurchaseItem, Supplier } from '@/types';
import type { PurchaseStackParamList } from '@/types/navigation';
import { spacing } from '@/theme';
import { requiredField } from '@/utils/validators';

type Props = NativeStackScreenProps<PurchaseStackParamList, 'CreatePurchase'>;

export const CreatePurchaseScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useAppTheme();
  const { t } = useLocalization();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [listsLoading, setListsLoading] = useState(true);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [supplierError, setSupplierError] = useState<string | undefined>();

  useFocusEffect(useCallback(() => {
    setListsLoading(true);
    Promise.all([supplierService.getAll(), productService.getAll()])
      .then(([nextSuppliers, nextProducts]) => {
        setSuppliers(nextSuppliers);
        setProducts(nextProducts);
      })
      .finally(() => setListsLoading(false));
  }, []));

  const addProduct = (product: Product) => {
    setItems(prev => [...prev, {
      productId: product.id, productName: product.name, quantity: 1,
      purchasePrice: product.costPrice, total: product.costPrice,
    }]);
  };

  const totalAmount = items.reduce((s, i) => s + i.total, 0);
  const supplierOptions = useMemo(
    () => suppliers.map(s => ({ value: s.id, label: s.name, subtitle: s.company || s.email })),
    [suppliers],
  );
  const productOptions = useMemo(
    () => products.map(p => ({ value: p.id, label: p.name, subtitle: `${p.sku} · ${formatCurrency(p.costPrice)}` })),
    [products],
  );

  const handleSubmit = async () => {
    const supplierCheck = requiredField(selectedSupplier?.id, 'purchase.pleaseSupplier');
    setSupplierError(supplierCheck === true ? undefined : supplierCheck);

    if (supplierCheck !== true) {
      setFormError(t('purchase.pleaseSupplier'));
      return;
    }
    if (items.length === 0) {
      setFormError(t('purchase.pleaseProduct'));
      return;
    }

    setFormError(null);
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
    <FormScrollView style={[formScreenStyles.screen, { backgroundColor: colors.background }]} contentContainerStyle={formScreenStyles.content}>
      <FormIntro
        icon="cart-outline"
        title={t('form.createPurchaseTitle')}
        description={t('form.createPurchaseHint')}
      />
      <FormErrorBanner message={formError} />
      <AppSelect
        label={t('purchase.supplier')}
        placeholder={t('purchase.selectSupplier')}
        icon="truck-outline"
        variant="sheet"
        searchable
        required
        loading={listsLoading}
        value={selectedSupplier?.id ?? null}
        error={supplierError}
        options={supplierOptions}
        onChange={id => {
          setSelectedSupplier(suppliers.find(s => s.id === id) || null);
          setSupplierError(undefined);
          setFormError(null);
        }}
      />
      <AppSelect
        label={t('sale.addProduct')}
        placeholder={t('sale.addProduct')}
        icon="package-variant"
        variant="sheet"
        searchable
        resetOnSelect
        loading={listsLoading}
        value={null}
        options={productOptions}
        onChange={(_, option) => {
          const product = products.find(p => p.id === option?.value);
          if (product) addProduct(product);
        }}
      />

      {items.map((item, i) => (
        <View key={`${item.productId}-${i}`} style={[styles.itemCard, { backgroundColor: colors.surface }]}>
          <Text style={{ color: colors.text, fontWeight: '600' }}>{item.productName}</Text>
          <Text style={{ color: colors.textSecondary }}>{t('common.qty')}: {item.quantity} • {formatCurrency(item.purchasePrice)}</Text>
        </View>
      ))}

      <Text variant="titleMedium" style={{ color: colors.primary, fontWeight: '700', marginTop: spacing.md }}>
        {t('common.total')}: {formatCurrency(totalAmount)}
      </Text>

      <CustomButton title={t('purchase.create')} onPress={handleSubmit} loading={loading} fullWidth
        style={{ marginTop: spacing.lg }} />
    </FormScrollView>
  );
};

const styles = StyleSheet.create({
  itemCard: { padding: spacing.md, borderRadius: 8, marginBottom: spacing.sm },
});
