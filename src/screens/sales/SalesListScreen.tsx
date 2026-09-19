import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Chip, FAB, Icon, Searchbar, Text } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EmptyState, ErrorState, LoadingState } from '@/components/common';
import { saleService } from '@/services/saleService';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { formatCurrency, formatDate } from '@/utils/formatters';
import type { Sale } from '@/types';
import type { SalesStackParamList } from '@/types/navigation';
import { PAYMENT_STATUS_KEYS } from '@/localization';
import { borderRadius, spacing, typography } from '@/theme';

type Props = NativeStackScreenProps<SalesStackParamList, 'SalesList'>;
type PaymentFilter = 'paid' | 'partial' | 'unpaid';
type SaleStatusFilter = Sale['paymentStatus'];
type DateFilter = 'today' | 'week' | 'month';

type SaleFilters = {
  payment: PaymentFilter | null;
  saleStatus: SaleStatusFilter | null;
  dateRange: DateFilter | null;
  customerId: string | null;
};

const EMPTY_FILTERS: SaleFilters = {
  payment: null,
  saleStatus: null,
  dateRange: null,
  customerId: null,
};

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

const matchesPayment = (status: Sale['paymentStatus'], filter: PaymentFilter | null) => {
  if (!filter) return true;
  if (filter === 'unpaid') return status === 'pending';
  return status === filter;
};

export const SalesListScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useAppTheme();
  const { t, language, isRTL, directionalIconStyle } = useLocalization();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<SaleFilters>(EMPTY_FILTERS);
  const [draftFilters, setDraftFilters] = useState<SaleFilters>(EMPTY_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);

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

  useFocusEffect(
    useCallback(() => {
      loadSales();
    }, [loadSales]),
  );

  const customers = useMemo(() => {
    const map = new Map<string, string>();
    sales.forEach(sale => {
      if (!map.has(sale.customerId)) {
        map.set(sale.customerId, sale.customerName);
      }
    });
    return Array.from(map, ([id, name]) => ({ id, name }));
  }, [sales]);

  const filteredSales = useMemo(() => {
    const query = search.trim().toLowerCase();
    return sales.filter(sale => {
      const matchesQuery =
        !query ||
        sale.invoiceNumber.toLowerCase().includes(query) ||
        sale.customerName.toLowerCase().includes(query) ||
        (sale.notes || '').toLowerCase().includes(query) ||
        sale.items.some(item => item.productName.toLowerCase().includes(query));
      return (
        matchesQuery &&
        matchesPayment(sale.paymentStatus, filters.payment) &&
        (!filters.saleStatus || sale.paymentStatus === filters.saleStatus) &&
        matchesDate(sale.createdAt, filters.dateRange) &&
        (!filters.customerId || sale.customerId === filters.customerId)
      );
    });
  }, [filters, sales, search]);

  const activeChips = useMemo(() => {
    const chips: { key: keyof SaleFilters; label: string }[] = [];
    if (filters.payment) {
      const labels = {
        paid: t('sale.filterPaid'),
        partial: t('sale.filterPartial'),
        unpaid: t('sale.filterUnpaid'),
      };
      chips.push({ key: 'payment', label: labels[filters.payment] });
    }
    if (filters.saleStatus) {
      chips.push({ key: 'saleStatus', label: t(PAYMENT_STATUS_KEYS[filters.saleStatus]) });
    }
    if (filters.dateRange) {
      const labels = {
        today: t('sale.filterToday'),
        week: t('sale.filterWeek'),
        month: t('sale.filterMonth'),
      };
      chips.push({ key: 'dateRange', label: labels[filters.dateRange] });
    }
    if (filters.customerId) {
      const customer = customers.find(item => item.id === filters.customerId);
      chips.push({ key: 'customerId', label: customer?.name || t('sale.customer') });
    }
    return chips;
  }, [customers, filters, t]);

  const hasActiveFilters = activeChips.length > 0;
  const filterCount = activeChips.length;

  const openDetails = (saleId: string) => {
    navigation.navigate('SaleDetails', { saleId });
  };

  const openFilterPanel = () => {
    setDraftFilters(filters);
    setFilterOpen(true);
  };

  const applyFilters = () => {
    setFilters(draftFilters);
    setFilterOpen(false);
  };

  const clearAllFilters = () => {
    setFilters(EMPTY_FILTERS);
    setDraftFilters(EMPTY_FILTERS);
  };

  const removeFilter = (key: keyof SaleFilters) => {
    setFilters(current => ({ ...current, [key]: null }));
  };

  const toggleDraft = <K extends keyof SaleFilters>(key: K, value: SaleFilters[K]) => {
    setDraftFilters(current => ({
      ...current,
      [key]: current[key] === value ? null : value,
    }));
  };

  const getStatusColor = (status: Sale['paymentStatus']) => {
    switch (status) {
      case 'paid':
        return colors.success;
      case 'pending':
        return colors.warning;
      default:
        return colors.info;
    }
  };

  const optionChip = (
    label: string,
    selected: boolean,
    onPress: () => void,
    key = label,
  ) => (
    <Pressable
      key={key}
      onPress={onPress}
      style={[
        styles.optionChip,
        {
          backgroundColor: selected ? colors.primaryMuted : colors.surfaceVariant,
          borderColor: selected ? colors.primary : colors.border,
        },
      ]}>
      <Text style={{ color: selected ? colors.primary : colors.text, fontWeight: selected ? '700' : '500' }}>
        {label}
      </Text>
    </Pressable>
  );

  if (loading && sales.length === 0) return <LoadingState message="sale.loading" />;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {error ? (
        <ErrorState message={error} onRetry={loadSales} />
      ) : (
        <>
          <View style={[styles.toolbar, { backgroundColor: colors.surface, borderBottomColor: colors.borderLight }]}>
            <Searchbar
              placeholder={t('sale.search')}
              value={search}
              onChangeText={setSearch}
              style={[styles.search, { backgroundColor: colors.background }]}
              inputStyle={{
                color: colors.text,
                textAlign: isRTL ? 'right' : 'left',
                writingDirection: isRTL ? 'rtl' : 'ltr',
              }}
              iconColor={colors.textSecondary}
              placeholderTextColor={colors.textSecondary}
            />
            <Pressable
              onPress={openFilterPanel}
              style={({ pressed }) => [
                styles.filterButton,
                {
                  backgroundColor: hasActiveFilters ? colors.primaryMuted : colors.background,
                  borderColor: hasActiveFilters ? colors.primary : colors.border,
                  opacity: pressed ? 0.82 : 1,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={t('sale.filters')}>
              <Icon source="filter-variant" size={20} color={hasActiveFilters ? colors.primary : colors.text} />
              <Text style={{ color: hasActiveFilters ? colors.primary : colors.text, fontWeight: '600' }}>
                {t('sale.filters')}
              </Text>
              {filterCount > 0 ? (
                <View style={[styles.filterBadge, { backgroundColor: colors.primary }]}>
                  <Text style={{ color: colors.onPrimary, fontSize: 11, fontWeight: '700' }}>{filterCount}</Text>
                </View>
              ) : null}
            </Pressable>
          </View>

          {hasActiveFilters ? (
            <View style={styles.chipRow}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipContent}>
                {activeChips.map(chip => (
                  <Chip
                    key={chip.key}
                    compact
                    onClose={() => removeFilter(chip.key)}
                    style={[styles.activeChip, { backgroundColor: colors.primaryMuted }]}
                    textStyle={{ color: colors.primary }}>
                    {chip.label}
                  </Chip>
                ))}
              </ScrollView>
              <Pressable onPress={clearAllFilters} hitSlop={8} style={styles.clearAll}>
                <Text style={{ color: colors.primary, fontWeight: '600' }}>{t('sale.clearAll')}</Text>
              </Pressable>
            </View>
          ) : null}

          <FlatList
            data={filteredSales}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={loadSales} />}
            renderItem={({ item }) => {
              const statusColor = getStatusColor(item.paymentStatus);
              return (
                <Pressable
                  onPress={() => openDetails(item.id)}
                  style={({ pressed }) => [
                    styles.card,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.borderLight,
                      opacity: pressed ? 0.86 : 1,
                    },
                  ]}
                  accessibilityRole="button">
                  <View style={styles.cardHeader}>
                    <Text variant="titleSmall" style={{ color: colors.text, fontWeight: '700', flex: 1 }}>
                      {item.invoiceNumber}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor + '18' }]}>
                      <Text variant="labelSmall" style={{ color: statusColor, fontWeight: '700' }}>
                        {t(PAYMENT_STATUS_KEYS[item.paymentStatus])}
                      </Text>
                    </View>
                  </View>
                  <Text variant="bodySmall" style={{ color: colors.textSecondary, marginTop: 4 }}>
                    {item.customerName} · {formatDate(item.createdAt, language)}
                  </Text>
                  <Text variant="titleMedium" style={{ color: colors.primary, marginTop: spacing.sm, fontWeight: '700' }}>
                    {formatCurrency(item.totalAmount)}
                  </Text>
                  <View style={[styles.detailsRow, { borderTopColor: colors.borderLight }]}>
                    <Icon source="file-document-outline" size={16} color={colors.textMuted} />
                    <Text variant="labelMedium" style={{ color: colors.textMuted, flex: 1 }}>
                      {t('sale.viewDetails')}
                    </Text>
                    <View style={directionalIconStyle}>
                      <Icon source="chevron-right" size={18} color={colors.textMuted} />
                    </View>
                  </View>
                </Pressable>
              );
            }}
            ListEmptyComponent={
              <EmptyState
                icon="cart-outline"
                title={t(hasActiveFilters || search.trim() ? 'sale.noFilterResults' : 'sale.empty')}
                message={t(hasActiveFilters || search.trim() ? 'sale.noFilterResultsMsg' : 'sale.emptyMsg')}
              />
            }
          />
        </>
      )}

      <Modal visible={filterOpen} transparent animationType="fade" onRequestClose={() => setFilterOpen(false)}>
        <Pressable style={[styles.modalBackdrop, { backgroundColor: colors.overlay }]} onPress={() => setFilterOpen(false)}>
          <Pressable
            style={[styles.modalCard, { backgroundColor: colors.surface }]}
            onPress={event => event.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={[typography.h3, { color: colors.text }]}>{t('sale.filters')}</Text>
              <Pressable onPress={() => setFilterOpen(false)} hitSlop={8}>
                <Icon source="close" size={22} color={colors.textSecondary} />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{t('sale.filterPaymentStatus')}</Text>
              <View style={styles.optionWrap}>
                {optionChip(t('sale.filterPaid'), draftFilters.payment === 'paid', () => toggleDraft('payment', 'paid'))}
                {optionChip(t('sale.filterPartial'), draftFilters.payment === 'partial', () => toggleDraft('payment', 'partial'))}
                {optionChip(t('sale.filterUnpaid'), draftFilters.payment === 'unpaid', () => toggleDraft('payment', 'unpaid'))}
              </View>

              <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{t('sale.filterSaleStatus')}</Text>
              <View style={styles.optionWrap}>
                {optionChip(t(PAYMENT_STATUS_KEYS.paid), draftFilters.saleStatus === 'paid', () => toggleDraft('saleStatus', 'paid'))}
                {optionChip(t(PAYMENT_STATUS_KEYS.pending), draftFilters.saleStatus === 'pending', () => toggleDraft('saleStatus', 'pending'))}
                {optionChip(t(PAYMENT_STATUS_KEYS.partial), draftFilters.saleStatus === 'partial', () => toggleDraft('saleStatus', 'partial'))}
              </View>

              <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{t('sale.filterDateRange')}</Text>
              <View style={styles.optionWrap}>
                {optionChip(t('sale.filterToday'), draftFilters.dateRange === 'today', () => toggleDraft('dateRange', 'today'))}
                {optionChip(t('sale.filterWeek'), draftFilters.dateRange === 'week', () => toggleDraft('dateRange', 'week'))}
                {optionChip(t('sale.filterMonth'), draftFilters.dateRange === 'month', () => toggleDraft('dateRange', 'month'))}
              </View>

              {customers.length > 0 ? (
                <>
                  <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{t('sale.filterCustomer')}</Text>
                  <View style={styles.optionWrap}>
                    {customers.map(customer =>
                      optionChip(
                        customer.name,
                        draftFilters.customerId === customer.id,
                        () => toggleDraft('customerId', customer.id),
                        customer.id,
                      ),
                    )}
                  </View>
                </>
              ) : null}
            </ScrollView>
            <View style={styles.modalActions}>
              <Pressable onPress={clearAllFilters} style={styles.modalTextAction}>
                <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>{t('sale.clearAll')}</Text>
              </Pressable>
              <Pressable
                onPress={applyFilters}
                style={[styles.applyButton, { backgroundColor: colors.primary }]}>
                <Text style={{ color: colors.onPrimary, fontWeight: '700' }}>{t('sale.applyFilters')}</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: colors.primary }]}
        color={colors.onPrimary}
        onPress={() => navigation.navigate('CreateSale')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  search: {
    flex: 1,
    minWidth: 0,
    height: 48,
    borderRadius: borderRadius.md,
    elevation: 0,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    height: 48,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  filterBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingStart: spacing.md,
    paddingEnd: spacing.sm,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  chipContent: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingEnd: spacing.sm,
  },
  activeChip: {
    marginEnd: spacing.xs,
  },
  clearAll: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  list: {
    padding: spacing.md,
    paddingBottom: 88,
  },
  card: {
    padding: spacing.md,
    paddingBottom: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  fab: {
    position: 'absolute',
    end: spacing.md,
    bottom: spacing.md,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalCard: {
    maxHeight: '78%',
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionLabel: {
    ...(typography.label as object),
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  optionWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  optionChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    gap: spacing.md,
  },
  modalTextAction: {
    paddingVertical: spacing.sm,
  },
  applyButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.md,
  },
});
