import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { Text, Chip } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomCard, LoadingState, ErrorState } from '@/components/common';
import { productService } from '@/services/productService';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { formatCurrency, formatDate, isLowStock } from '@/utils/formatters';
import type { Product } from '@/types';
import type { InventoryStackParamList } from '@/types/navigation';
import { spacing } from '@/theme';

type Props = NativeStackScreenProps<InventoryStackParamList, 'ProductDetails'>;

export const ProductDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { productId } = route.params;
  const { colors } = useAppTheme();
  const { t, catalogLabel, language } = useLocalization();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await productService.getById(productId);
        setProduct(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'product.failedLoad');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [productId]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => null,
    });
  }, [navigation]);

  if (loading) return <LoadingState />;
  if (error || !product) return <ErrorState message={error || 'product.notFound'} />;

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
      <CustomCard>
        <View style={styles.header}>
          <Text variant="headlineSmall" style={{ color: colors.text, fontWeight: '700' }}>
            {product.name}
          </Text>
          {lowStock && (
            <Chip style={{ backgroundColor: colors.lowStock + '20', marginTop: spacing.sm }}>
              {t('product.lowStockAlert')}
            </Chip>
          )}
          {product.description && (
            <Text variant="bodyMedium" style={{ color: colors.textSecondary, marginTop: spacing.sm }}>
              {product.description}
            </Text>
          )}
        </View>
      </CustomCard>

      <CustomCard title={t('product.details')}>
        {details.map(item => (
          <View key={item.label} style={[styles.row, { borderBottomColor: colors.border }]}>
            <Text variant="bodyMedium" style={{ color: colors.textSecondary }}>
              {item.label}
            </Text>
            <Text variant="bodyMedium" style={{ color: colors.text, fontWeight: '500' }}>
              {item.value}
            </Text>
          </View>
        ))}
      </CustomCard>
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
});
