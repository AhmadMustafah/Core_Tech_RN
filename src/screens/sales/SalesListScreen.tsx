import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Chip, FAB, Text } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EmptyState, ErrorState, FilterChips, LoadingState, SearchBar } from '@/components/common';
import { saleService } from '@/services/saleService';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { formatCurrency, formatDate } from '@/utils/formatters';
import type { Sale } from '@/types';
import type { SalesStackParamList } from '@/types/navigation';
import { PAYMENT_STATUS_KEYS } from '@/localization';
import { borderRadius, spacing } from '@/theme';

type Props = NativeStackScreenProps<SalesStackParamList, 'SalesList'>;
type StatusFilter = 'paid' | 'unpaid' | 'pending' | 'partial';
type DateFilter = 'today' | 'week' | 'month';

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const matchesDate = (createdAt: string, filter: DateFilter | null) => {
  if (!filter) return true;
  const created = new Date(createdAt);
  const today = startOfDay(new Date());
  if (filter === 'today') return created >= today;
  if (filter === 'week') {
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    return created >= weekAgo;
  }
  const monthAgo = new Date(today);
  monthAgo.setMonth(today.getMonth() - 1);
  return created >= monthAgo;
};

const matchesStatus = (status: Sale['paymentStatus'], filter: StatusFilter | null) => {
  if (!filter) return true;
  if (filter === 'unpaid') return status === 'pending' || status === 'partial';
  return status === filter;
};

export const SalesListScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useAppTheme();
  const { t, language } = useLocalization();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter | null>(null);

  const loadSales = useCallback(async () => {
    setLoading(true);
    try {
      const data = await saleService.getAll();
      setSales(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'sale.failedLoad');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadSales(); }, [loadSales]));

  const filteredSales = useMemo(() => {
    const query = search.trim().toLowerCase();
    return sales.filter(sale => {
      const matchesQuery =
        !query ||
        sale.invoiceNumber.toLowerCase().includes(query) ||
        sale.customerName.toLowerCase().includes(query) ||
        (sale.notes || '').toLowerCase().includes(query) ||
        sale.items.some(item => item.productName.toLowerCase().includes(query));
      return matchesQuery && matchesStatus(sale.paymentStatus, statusFilter) && matchesDate(sale.createdAt, dateFilter);
    });
  }, [dateFilter, sales, search, statusFilter]);

  const hasActiveFilters = Boolean(search.trim() || statusFilter || dateFilter);

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
        <>
          <View style={styles.filters}>
            <SearchBar value={search} onChangeText={setSearch} placeholder={t('sale.search')} />
            <FilterChips
              options={['paid', 'unpaid', 'pending', 'partial']}
              selected={statusFilter}
              onSelect={value => setStatusFilter(value as StatusFilter | null)}
              labelFor={option => {
                if (option === 'paid') return t('sale.filterPaid');
                if (option === 'unpaid') return t('sale.filterUnpaid');
                if (option === 'pending') return t('sale.filterPending');
                return t('sale.filterPartial');
              }}
            />
            <FilterChips
              options={['today', 'week', 'month']}
              selected={dateFilter}
              onSelect={value => setDateFilter(value as DateFilter | null)}
              allLabel={t('sale.filterAllDates')}
              labelFor={option => {
                if (option === 'today') return t('sale.filterToday');
                if (option === 'week') return t('sale.filterWeek');
                return t('sale.filterMonth');
              }}
            />
            {hasActiveFilters ? (
              <Chip
                icon="filter-off-outline"
                onPress={() => {
                  setSearch('');
                  setStatusFilter(null);
                  setDateFilter(null);
                }}
                style={styles.clearChip}
                selectedColor={colors.primary}>
                {t('sale.clearFilters')}
              </Chip>
            ) : null}
          </View>
          <FlatList
            data={filteredSales}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={loadSales} />}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.82}
                style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
                onPress={() => navigation.navigate('SaleDetails', { saleId: item.id })}>
                <View style={styles.cardHeader}>
                  <Text variant="titleSmall" style={{ color: colors.text, fontWeight: '700' }}>
                    {item.invoiceNumber}
                  </Text>
                  <Chip compact style={{ backgroundColor: getStatusColor(item.paymentStatus) + '20' }} textStyle={{ color: getStatusColor(item.paymentStatus) }}>
                    {t(PAYMENT_STATUS_KEYS[item.paymentStatus])}
                  </Chip>
                </View>
                <Text variant="bodySmall" style={{ color: colors.textSecondary }}>
                  {item.customerName} · {formatDate(item.createdAt, language)}
                </Text>
                <Text variant="titleMedium" style={{ color: colors.primary, marginTop: spacing.sm, fontWeight: '700' }}>
                  {formatCurrency(item.totalAmount)}
                </Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <EmptyState
                icon="cart-outline"
                title={t(hasActiveFilters ? 'sale.noFilterResults' : 'sale.empty')}
                message={t(hasActiveFilters ? 'sale.noFilterResultsMsg' : 'sale.emptyMsg')}
              />
            }
          />
        </>
      )}
      <FAB icon="plus" style={[styles.fab, { backgroundColor: colors.primary }]} color={colors.onPrimary} onPress={() => navigation.navigate('CreateSale')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  filters: { paddingHorizontal: spacing.md, paddingTop: spacing.md },
  clearChip: { alignSelf: 'flex-start', marginBottom: spacing.sm },
  list: { padding: spacing.md, paddingTop: 0, paddingBottom: 80 },
  card: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    elevation: 1,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  fab: { position: 'absolute', end: spacing.md, bottom: spacing.md },
});
