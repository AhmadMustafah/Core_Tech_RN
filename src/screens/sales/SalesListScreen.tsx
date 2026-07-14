import React, { useState, useCallback } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, FAB, Chip } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EmptyState, LoadingState, ErrorState } from '@/components/common';
import { saleService } from '@/services/saleService';
import { useAppTheme } from '@/hooks/useAppTheme';
import { formatCurrency, formatDate } from '@/utils/formatters';
import type { Sale } from '@/types';
import type { SalesStackParamList } from '@/types/navigation';
import { spacing, borderRadius } from '@/theme';

type Props = NativeStackScreenProps<SalesStackParamList, 'SalesList'>;

export const SalesListScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useAppTheme();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSales = useCallback(async () => {
    setLoading(true);
    try {
      const data = await saleService.getAll();
      setSales(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sales');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadSales(); }, [loadSales]));

  const getStatusColor = (status: Sale['paymentStatus']) => {
    switch (status) {
      case 'paid': return colors.success;
      case 'pending': return colors.warning;
      default: return colors.info;
    }
  };

  if (loading && sales.length === 0) return <LoadingState message="Loading sales..." />;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {error ? (
        <ErrorState message={error} onRetry={loadSales} />
      ) : (
        <FlatList
          data={sales}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadSales} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: colors.surface }]}
              onPress={() => navigation.navigate('SaleDetails', { saleId: item.id })}>
              <View style={styles.cardHeader}>
                <Text variant="titleSmall" style={{ color: colors.text, fontWeight: '600' }}>
                  {item.invoiceNumber}
                </Text>
                <Chip compact style={{ backgroundColor: getStatusColor(item.paymentStatus) + '20' }}>
                  {item.paymentStatus}
                </Chip>
              </View>
              <Text variant="bodySmall" style={{ color: colors.textSecondary }}>
                {item.customerName} • {formatDate(item.createdAt)}
              </Text>
              <Text variant="titleMedium" style={{ color: colors.primary, marginTop: spacing.sm, fontWeight: '700' }}>
                {formatCurrency(item.totalAmount)}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<EmptyState icon="cart-outline" title="No Sales Yet" message="Create your first sale" />}
        />
      )}
      <FAB icon="plus" style={[styles.fab, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('CreateSale')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: spacing.md, paddingBottom: 80 },
  card: { padding: spacing.md, borderRadius: borderRadius.md, marginBottom: spacing.sm, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  fab: { position: 'absolute', right: spacing.md, bottom: spacing.md },
});
