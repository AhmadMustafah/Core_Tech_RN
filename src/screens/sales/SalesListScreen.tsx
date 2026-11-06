import React, { useState, useCallback } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, FAB, Chip } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EmptyState, LoadingState, ErrorState } from '@/components/common';
import { useCachedFocusLoad } from '@/hooks/useCachedFocusLoad';
import { saleService } from '@/services/saleService';
import { getErrorMessage } from '@/services/api';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { formatCurrency, formatDate } from '@/utils/formatters';
import type { Sale } from '@/types';
import type { SalesStackParamList } from '@/types/navigation';
import { PAYMENT_STATUS_KEYS } from '@/localization';
import { spacing, borderRadius, listContentStyle, listPerformanceProps } from '@/theme';

type Props = NativeStackScreenProps<SalesStackParamList, 'SalesList'>;

export const SalesListScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useAppTheme();
  const { t, language } = useLocalization();
  const [sales, setSales] = useState<Sale[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSales = useCallback(async (nextPage = 1, append = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await saleService.getPage({ page: nextPage, limit: 40 });
      setPage(nextPage);
      setTotal(data.total);
      setSales(prev => (append ? [...prev, ...data.items] : data.items));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useCachedFocusLoad(() => { void loadSales(1, false); });

  const getStatusColor = (status: Sale['paymentStatus']) => {
    switch (status) {
      case 'paid': return colors.success;
      case 'pending': return colors.warning;
      default: return colors.info;
    }
  };

  if (loading && sales.length === 0) return <LoadingState message="sale.loading" />;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {error ? (
        <ErrorState message={error} onRetry={loadSales} />
      ) : (
        <FlatList
          data={sales}
          keyExtractor={item => item.id}
          contentContainerStyle={listContentStyle}
          {...listPerformanceProps}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={() => loadSales(1, false)} />}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (!loading && !loadingMore && sales.length < total) {
              void loadSales(page + 1, true);
            }
          }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => navigation.navigate('SaleDetails', { saleId: item.id })}>
              <View style={styles.cardHeader}>
                <Text
                  variant="titleSmall"
                  numberOfLines={1}
                  style={{ color: colors.text, fontWeight: '600', flex: 1, marginEnd: spacing.sm }}>
                  {item.invoiceNumber}
                </Text>
                <Chip compact style={{ backgroundColor: getStatusColor(item.paymentStatus) + '20' }}>
                  {t(PAYMENT_STATUS_KEYS[item.paymentStatus])}
                </Chip>
              </View>
              <Text variant="bodySmall" numberOfLines={1} style={{ color: colors.textSecondary }}>
                {item.customerName} • {formatDate(item.createdAt, language)}
              </Text>
              <Text variant="titleMedium" style={{ color: colors.primary, marginTop: spacing.sm, fontWeight: '700' }}>
                {formatCurrency(item.totalAmount)}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<EmptyState icon="cart-outline" title={t('sale.empty')} message={t('sale.emptyMsg')} />}
        />
      )}
      <FAB icon="plus" color={colors.onPrimary} style={[styles.fab, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('CreateSale')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: spacing.md, paddingBottom: 80 },
  card: { padding: spacing.md, borderRadius: borderRadius.md, marginBottom: spacing.sm, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  fab: { position: 'absolute', end: spacing.md, bottom: spacing.md },
});
