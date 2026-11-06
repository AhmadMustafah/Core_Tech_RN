import React, { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, ScrollView, View } from 'react-native';
import { Text, Chip } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomButton, CustomCard, CustomInput, LoadingState, ErrorState } from '@/components/common';
import { productService } from '@/services/productService';
import { useAppDispatch } from '@/redux/hooks';
import { markAppDataStale } from '@/redux/slices/dataSyncSlice';
import { inventoryService, type StockMovement } from '@/services/inventoryService';
import { getErrorMessage } from '@/services/api';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { formatCurrency, formatDate, isLowStock } from '@/utils/formatters';
import type { Product } from '@/types';
import type { InventoryStackParamList } from '@/types/navigation';
import { spacing } from '@/theme';

type Props = NativeStackScreenProps<InventoryStackParamList, 'ProductDetails'>;

export const ProductDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const { productId } = route.params;
  const { colors } = useAppTheme();
  const { t, catalogLabel, language } = useLocalization();
  const [product, setProduct] = useState<Product | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adjustQty, setAdjustQty] = useState('1');

  const load = useCallback(async () => {
    try {
      const data = await productService.getById(productId);
      setProduct(data);
      const rows = await inventoryService.getMovements(productId);
      setMovements(rows);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    load();
  }, [load]);

  const adjust = async (direction: 'in' | 'out') => {
    const quantity = parseInt(adjustQty, 10);
    if (!quantity || quantity < 1 || busy) return;
    setBusy(true);
    try {
      await inventoryService.adjust({ productId, direction, quantity });
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const onDelete = () => {
    Alert.alert(t('common.delete'), t('common.confirmDelete'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          if (busy) return;
          setBusy(true);
          try {
            await productService.delete(productId);
            dispatch(markAppDataStale());
            navigation.goBack();
          } catch (err) {
            setError(getErrorMessage(err));
            setBusy(false);
          }
        },
      },
    ]);
  };

  if (loading) return <LoadingState />;
  if (error && !product) return <ErrorState message={error} onRetry={load} />;
  if (!product) return <ErrorState message="product.notFound" />;

  const lowStock = isLowStock(product.stockQuantity, product.lowStockThreshold);
  const details = [
    { label: t('product.sku'), value: product.sku },
    { label: t('product.category'), value: catalogLabel(product.category) },
    { label: t('product.unit'), value: catalogLabel(product.unit) },
    { label: t('product.sellingPrice'), value: formatCurrency(product.price) },
    { label: t('product.costPrice'), value: formatCurrency(product.costPrice) },
    { label: t('product.stockQty'), value: `${product.stockQuantity} ${catalogLabel(product.unit)}` },
    { label: t('product.lowStockThreshold'), value: String(product.lowStockThreshold) },
    { label: t('product.created'), value: formatDate(product.createdAt, language) },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {error ? (
        <Text style={{ color: colors.error, marginBottom: spacing.sm }}>{error}</Text>
      ) : null}
      <CustomCard>
        <View style={styles.header}>
          <Text variant="headlineSmall" numberOfLines={2} style={{ color: colors.text, fontWeight: '700' }}>
            {product.name}
          </Text>
          {lowStock && (
            <Chip style={{ backgroundColor: colors.lowStock + '20', marginTop: spacing.sm }}>
              {t('product.lowStockAlert')}
            </Chip>
          )}
          {product.description ? (
            <Text variant="bodyMedium" style={{ color: colors.textSecondary, marginTop: spacing.sm }}>
              {product.description}
            </Text>
          ) : null}
        </View>
      </CustomCard>

      <CustomCard>
        {details.map(item => (
          <View key={item.label} style={[styles.row, { borderBottomColor: colors.border }]}>
            <Text variant="bodyMedium" style={{ color: colors.textSecondary, flex: 1, marginEnd: spacing.sm }}>
              {item.label}
            </Text>
            <Text
              variant="bodyMedium"
              numberOfLines={2}
              style={{
                color: colors.text,
                fontWeight: '500',
                flexShrink: 1,
                maxWidth: '62%',
                writingDirection: 'ltr',
              }}>
              {item.value}
            </Text>
          </View>
        ))}
      </CustomCard>

      <CustomCard title={t('product.adjustStock')}>
        <View style={{ paddingHorizontal: spacing.md, paddingBottom: spacing.md }}>
          <CustomInput
            label={t('product.adjustQty')}
            value={adjustQty}
            onChangeText={setAdjustQty}
            keyboardType="numeric"
          />
          <View style={styles.actions}>
            <CustomButton title={t('product.stockIn')} onPress={() => adjust('in')} loading={busy} style={styles.actionBtn} />
            <CustomButton title={t('product.stockOut')} variant="outline" onPress={() => adjust('out')} loading={busy} style={styles.actionBtn} />
          </View>
        </View>
      </CustomCard>

      {movements.length > 0 ? (
        <CustomCard title={t('product.stock')}>
          {movements.slice(0, 12).map(item => (
            <View key={item.id} style={[styles.row, { borderBottomColor: colors.border }]}>
              <Text variant="bodyMedium" style={{ color: colors.textSecondary }}>
                {item.direction} {item.quantity}
              </Text>
              <Text variant="bodyMedium" style={{ color: colors.text, fontWeight: '500' }}>
                {item.previousQuantity} → {item.newQuantity}
              </Text>
            </View>
          ))}
        </CustomCard>
      ) : null}

      <View style={styles.actions}>
        <CustomButton
          title={t('common.edit')}
          onPress={() => navigation.navigate('EditProduct', { productId })}
          style={styles.actionBtn}
        />
        <CustomButton title={t('common.delete')} variant="outline" onPress={onDelete} loading={busy} style={styles.actionBtn} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.md },
  header: { padding: spacing.md },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  actionBtn: { flex: 1 },
});
