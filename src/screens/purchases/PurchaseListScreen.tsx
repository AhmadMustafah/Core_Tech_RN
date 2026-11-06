import React, { useState, useCallback } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, FAB } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EmptyState, LoadingState, ErrorState } from '@/components/common';
import { useCachedFocusLoad } from '@/hooks/useCachedFocusLoad';
import { purchaseService } from '@/services/purchaseService';
import { getErrorMessage } from '@/services/api';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { formatCurrency, formatDate } from '@/utils/formatters';
import type { Purchase } from '@/types';
import type { PurchaseStackParamList } from '@/types/navigation';
import { spacing, borderRadius, listContentStyle, listPerformanceProps } from '@/theme';

type Props = NativeStackScreenProps<PurchaseStackParamList, 'PurchaseList'>;

export const PurchaseListScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useAppTheme();
  const { t, language } = useLocalization();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (nextPage = 1, append = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await purchaseService.getPage({ page: nextPage, limit: 40 });
      setPage(nextPage);
      setTotal(data.total);
      setPurchases(prev => (append ? [...prev, ...data.items] : data.items));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useCachedFocusLoad(() => { void load(1, false); });

  if (loading && purchases.length === 0) return <LoadingState message="purchase.loading" />;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {error ? <ErrorState message={error} onRetry={() => load(1, false)} /> : (
        <FlatList
          data={purchases}
          keyExtractor={item => item.id}
          contentContainerStyle={listContentStyle}
          {...listPerformanceProps}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={() => load(1, false)} />}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (!loading && !loadingMore && purchases.length < total) {
              void load(page + 1, true);
            }
          }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => navigation.navigate('PurchaseDetails', { purchaseId: item.id || String((item as { _id?: string })._id || '') })}>
              <Text variant="titleSmall" numberOfLines={1} style={{ color: colors.text, fontWeight: '600' }}>{item.purchaseNumber}</Text>
              <Text variant="bodySmall" numberOfLines={1} style={{ color: colors.textSecondary }}>{item.supplierName} • {formatDate(item.createdAt, language)}</Text>
              <Text variant="titleMedium" style={{ color: colors.secondary, marginTop: spacing.sm, fontWeight: '700' }}>{formatCurrency(item.totalAmount)}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<EmptyState icon="truck-outline" title={t('purchase.empty')} message={t('purchase.emptyMsg')} />}
        />
      )}
      <FAB icon="plus" color={colors.onPrimary} style={[styles.fab, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('CreatePurchase')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: spacing.md, paddingBottom: 80 },
  card: { padding: spacing.md, borderRadius: borderRadius.md, marginBottom: spacing.sm, borderWidth: 1 },
  fab: { position: 'absolute', end: spacing.md, bottom: spacing.md },
});
