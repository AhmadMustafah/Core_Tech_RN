import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Text, FAB, Chip, IconButton } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  SearchBar,
  FilterChips,
  EmptyState,
  LoadingState,
  ErrorState,
} from '@/components/common';
import { productService } from '@/services/productService';
import { useAppTheme } from '@/hooks/useAppTheme';
import { formatCurrency, isLowStock } from '@/utils/formatters';
import { PRODUCT_CATEGORIES } from '@/constants';
import type { Product } from '@/types';
import type { InventoryStackParamList } from '@/types/navigation';
import { spacing, borderRadius } from '@/theme';

type Props = NativeStackScreenProps<InventoryStackParamList, 'ProductList'>;

export const ProductListScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useAppTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productService.getAll({ search, category: category || undefined });
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [loadProducts]),
  );

  const renderItem = ({ item }: { item: Product }) => {
    const lowStock = isLowStock(item.stockQuantity, item.lowStockThreshold);

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text variant="titleSmall" style={{ color: colors.text, fontWeight: '600' }}>
              {item.name}
            </Text>
            <Text variant="bodySmall" style={{ color: colors.textSecondary }}>
              SKU: {item.sku} • {item.category}
            </Text>
          </View>
          {lowStock && (
            <Chip compact textStyle={{ fontSize: 10 }} style={{ backgroundColor: colors.lowStock + '20' }}>
              Low Stock
            </Chip>
          )}
        </View>
        <View style={styles.cardFooter}>
          <Text variant="bodyMedium" style={{ color: colors.primary, fontWeight: '600' }}>
            {formatCurrency(item.price)}
          </Text>
          <Text variant="bodySmall" style={{ color: lowStock ? colors.lowStock : colors.textSecondary }}>
            Stock: {item.stockQuantity} {item.unit}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && products.length === 0) {
    return <LoadingState message="Loading products..." />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search products..." />
        <FilterChips options={PRODUCT_CATEGORIES} selected={category} onSelect={setCategory} />
      </View>

      {error ? (
        <ErrorState message={error} onRetry={loadProducts} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadProducts} />}
          ListEmptyComponent={
            <EmptyState
              icon="package-variant"
              title="No Products Found"
              message="Add your first product to get started"
            />
          }
        />
      )}

      <FAB
        icon="plus"
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
  fab: { position: 'absolute', right: spacing.md, bottom: spacing.md },
});
