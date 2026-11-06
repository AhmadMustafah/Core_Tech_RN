import React, { useState, useCallback, memo } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Text, FAB, Chip } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  SearchBar,
  FilterChips,
  EmptyState,
  LoadingState,
  ErrorState,
} from '@/components/common';
import { productService } from '@/services/productService';
import { getErrorMessage } from '@/services/api';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useCachedFocusLoad } from '@/hooks/useCachedFocusLoad';
import { useLocalization } from '@/hooks/useLocalization';
import { formatCurrency, isLowStock } from '@/utils/formatters';
import { PRODUCT_CATEGORIES } from '@/constants';
import type { Product } from '@/types';
import type { InventoryStackParamList } from '@/types/navigation';
import { spacing, borderRadius, listContentStyle, listPerformanceProps } from '@/theme';

type Props = NativeStackScreenProps<InventoryStackParamList, 'ProductList'>;

export const ProductListScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useAppTheme();
  const { t, catalogLabel } = useLocalization();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productService.getAll({
        search: debouncedSearch,
        category: category || undefined,
      });
      setProducts(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, category]);

  useCachedFocusLoad(loadProducts, `${debouncedSearch}|${category ?? ''}`);

  const renderItem = useCallback(
    ({ item }: { item: Product }) => (
      <ProductRow
        item={item}
        onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
      />
    ),
    [navigation],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <SearchBar value={search} onChangeText={setSearch} placeholder={t('product.search')} />
        <FilterChips options={PRODUCT_CATEGORIES} selected={category} onSelect={setCategory} />
      </View>

      {loading && products.length === 0 ? (
        <LoadingState message="product.loading" />
      ) : error ? (
        <ErrorState message={error} onRetry={loadProducts} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={listContentStyle}
          {...listPerformanceProps}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadProducts} />}
          ListEmptyComponent={
            <EmptyState
              icon="package-variant"
              title={t('product.empty')}
              message={t('product.emptyMsg')}
            />
          }
        />
      )}

      <FAB
        icon="plus"
        color={colors.onPrimary}
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('AddProduct')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: spacing.md, paddingBottom: 0 },
  list: { padding: spacing.md, paddingBottom: 80 },
  card: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.sm },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fab: { position: 'absolute', end: spacing.md, bottom: spacing.md },
});

const ProductRow = memo<{ item: Product; onPress: () => void }>(({ item, onPress }) => {
  const { colors } = useAppTheme();
  const { t, catalogLabel } = useLocalization();
  const lowStock = isLowStock(item.stockQuantity, item.lowStockThreshold);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1, minWidth: 0, marginEnd: spacing.sm }}>
          <Text
            variant="titleSmall"
            numberOfLines={1}
            style={{ color: colors.text, fontWeight: '600' }}>
            {item.name}
          </Text>
          <Text variant="bodySmall" numberOfLines={1} style={{ color: colors.textSecondary }}>
            {t('product.sku')}: {item.sku} • {catalogLabel(item.category)}
          </Text>
        </View>
        {lowStock ? (
          <Chip compact textStyle={{ fontSize: 10 }} style={{ backgroundColor: colors.lowStock + '20' }}>
            {t('product.lowStock')}
          </Chip>
        ) : null}
      </View>
      <View style={styles.cardFooter}>
        <Text variant="bodyMedium" style={{ color: colors.primary, fontWeight: '600' }}>
          {formatCurrency(item.price)}
        </Text>
        <Text
          variant="bodySmall"
          numberOfLines={1}
          style={{ color: lowStock ? colors.lowStock : colors.textSecondary }}>
          {t('product.stock')}: {item.stockQuantity} {catalogLabel(item.unit)}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

ProductRow.displayName = 'ProductRow';
