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
import { Chip, Icon, Searchbar, Text } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EmptyState, LoadingState } from '@/components/common';
import { saleService } from '@/services/saleService';
import { purchaseService } from '@/services/purchaseService';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { openRelatedRecord } from '@/utils/relatedNavigation';
import {
  buildTransactions,
  type WorkspaceTransaction,
} from '@/utils/workspaceRecords';
import type { Purchase, Sale } from '@/types';
import type { DashboardStackParamList, MainTabParamList } from '@/types/navigation';
import { PAYMENT_STATUS_KEYS } from '@/localization';
import { borderRadius, spacing, typography } from '@/theme';

type Props = NativeStackScreenProps<DashboardStackParamList, 'Transactions'>;
type PaymentFilter = 'paid' | 'partial' | 'unpaid';
type DateFilter = 'today' | 'week' | 'month';
type TxTypeFilter = WorkspaceTransaction['type'];
type TxStatusFilter = WorkspaceTransaction['status'];

type TxFilters = {
  type: TxTypeFilter | null;
  payment: PaymentFilter | null;
  status: TxStatusFilter | null;
  dateRange: DateFilter | null;
  customerId: string | null;
  supplierId: string | null;
};

const EMPTY_FILTERS: TxFilters = {
  type: null,
  payment: null,
  status: null,
  dateRange: null,
  customerId: null,
  supplierId: null,
};

const statusKey = (status: WorkspaceTransaction['status']) => {
  if (status === 'recorded') return 'dash.status.recorded' as const;
  if (status === 'paid') return PAYMENT_STATUS_KEYS.paid;
  if (status === 'partial') return PAYMENT_STATUS_KEYS.partial;
  return PAYMENT_STATUS_KEYS.pending;
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

const matchesPayment = (item: WorkspaceTransaction, filter: PaymentFilter | null) => {
  if (!filter) return true;
  if (item.type !== 'sale') return false;
  if (filter === 'unpaid') return item.status === 'pending';
  return item.status === filter;
};

export const TransactionsScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useAppTheme();
  const { t, language, isRTL, directionalIconStyle } = useLocalization();
  const tabNavigation = navigation.getParent<NavigationProp<MainTabParamList>>();
  const [sales, setSales] = useState<Sale[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<TxFilters>(EMPTY_FILTERS);
  const [draftFilters, setDraftFilters] = useState<TxFilters>(EMPTY_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [saleRows, purchaseRows] = await Promise.all([
        saleService.getAll(),
        purchaseService.getAll(),
      ]);
      setSales(saleRows);
      setPurchases(purchaseRows);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const items = useMemo(() => buildTransactions(sales, purchases), [purchases, sales]);

  const salesById = useMemo(() => new Map(sales.map(sale => [sale.id, sale])), [sales]);
  const purchasesById = useMemo(
    () => new Map(purchases.map(purchase => [purchase.id, purchase])),
    [purchases],
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

  const suppliers = useMemo(() => {
    const map = new Map<string, string>();
    purchases.forEach(purchase => {
      if (!map.has(purchase.supplierId)) {
        map.set(purchase.supplierId, purchase.supplierName);
      }
    });
    return Array.from(map, ([id, name]) => ({ id, name }));
  }, [purchases]);

  const matchesSearch = useCallback(
    (item: WorkspaceTransaction, query: string) => {
      if (!query) return true;
      const typeLabel = t(item.type === 'sale' ? 'dash.type.sale' : 'dash.type.purchase').toLowerCase();
      const statusLabel = t(statusKey(item.status)).toLowerCase();
      const amountLabel = String(item.amount);
      if (
        item.ref.toLowerCase().includes(query) ||
        item.party.toLowerCase().includes(query) ||
        typeLabel.includes(query) ||
        statusLabel.includes(query) ||
        amountLabel.includes(query)
      ) {
        return true;
      }
      if (item.type === 'sale') {
        const sale = salesById.get(item.sourceId);
        if (!sale) return false;
        return (
          (sale.notes || '').toLowerCase().includes(query) ||
          sale.items.some(row => row.productName.toLowerCase().includes(query))
        );
      }
      const purchase = purchasesById.get(item.sourceId);
      if (!purchase) return false;
      return (
        (purchase.notes || '').toLowerCase().includes(query) ||
        purchase.items.some(row => row.productName.toLowerCase().includes(query))
      );
    },
    [purchasesById, salesById, t],
  );

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter(item => {
      const sale = item.type === 'sale' ? salesById.get(item.sourceId) : undefined;
      const purchase = item.type === 'purchase' ? purchasesById.get(item.sourceId) : undefined;
      return (
        matchesSearch(item, query) &&
        (!filters.type || item.type === filters.type) &&
        matchesPayment(item, filters.payment) &&
        (!filters.status || item.status === filters.status) &&
        matchesDate(item.timestamp, filters.dateRange) &&
        (!filters.customerId || sale?.customerId === filters.customerId) &&
        (!filters.supplierId || purchase?.supplierId === filters.supplierId)
      );
    });
  }, [filters, items, matchesSearch, purchasesById, salesById, search]);

  const activeChips = useMemo(() => {
    const chips: { key: keyof TxFilters; label: string }[] = [];
    if (filters.type) {
      chips.push({
        key: 'type',
        label: t(filters.type === 'sale' ? 'dash.type.sale' : 'dash.type.purchase'),
      });
    }
    if (filters.payment) {
      const labels = {
        paid: t('sale.filterPaid'),
        partial: t('sale.filterPartial'),
        unpaid: t('sale.filterUnpaid'),
      };
      chips.push({ key: 'payment', label: labels[filters.payment] });
    }
    if (filters.status) {
      chips.push({ key: 'status', label: t(statusKey(filters.status)) });
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
      const customer = customers.find(row => row.id === filters.customerId);
      chips.push({ key: 'customerId', label: customer?.name || t('sale.customer') });
    }
    if (filters.supplierId) {
      const supplier = suppliers.find(row => row.id === filters.supplierId);
      chips.push({ key: 'supplierId', label: supplier?.name || t('purchase.supplier') });
    }
    return chips;
  }, [customers, filters, suppliers, t]);

  const hasActiveFilters = activeChips.length > 0;
  const filterCount = activeChips.length;
  const hasQuery = hasActiveFilters || search.trim().length > 0;

  const openItem = (item: WorkspaceTransaction) => {
    openRelatedRecord(tabNavigation, {
      relatedType: item.type,
      relatedId: item.sourceId,
    });
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

  const removeFilter = (key: keyof TxFilters) => {
    setFilters(current => ({ ...current, [key]: null }));
  };

  const toggleDraft = <K extends keyof TxFilters>(key: K, value: TxFilters[K]) => {
    setDraftFilters(current => ({
      ...current,
      [key]: current[key] === value ? null : value,
    }));
  };

  const statusColor = (status: WorkspaceTransaction['status']) => {
    if (status === 'paid' || status === 'recorded') return colors.success;
    if (status === 'partial') return colors.info;
    return colors.warning;
  };

  const optionChip = (label: string, selected: boolean, onPress: () => void, key = label) => (
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

  if (loading && items.length === 0) {
    return <LoadingState message="dash.loading" />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.toolbar, { backgroundColor: colors.surface, borderBottomColor: colors.borderLight }]}>
        <Searchbar
          placeholder={t('tx.search')}
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
        data={filteredItems}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.list, filteredItems.length === 0 && styles.empty]}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        renderItem={({ item }) => {
          const accent = item.type === 'sale' ? colors.success : colors.primary;
          const color = statusColor(item.status);
          return (
            <Pressable
              onPress={() => openItem(item)}
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
                <View style={[styles.icon, { backgroundColor: accent + '18' }]}>
                  <Icon
                    source={item.type === 'sale' ? 'cart-check' : 'truck-delivery'}
                    size={20}
                    color={accent}
                  />
                </View>
                <Text variant="titleSmall" style={{ color: colors.text, fontWeight: '700', flex: 1 }}>
                  {item.ref}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: color + '18' }]}>
                  <Text variant="labelSmall" style={{ color, fontWeight: '700' }}>
                    {t(statusKey(item.status))}
                  </Text>
                </View>
              </View>
              <Text variant="bodySmall" style={{ color: colors.textSecondary, marginTop: 4 }}>
                {t(item.type === 'sale' ? 'dash.type.sale' : 'dash.type.purchase')} · {item.party} ·{' '}
                {formatDate(item.timestamp, language)}
              </Text>
              <Text variant="titleMedium" style={{ color: colors.primary, marginTop: spacing.sm, fontWeight: '700' }}>
                {formatCurrency(item.amount)}
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
            icon="swap-horizontal"
            title={t(hasQuery ? 'tx.noFilterResults' : 'dash.noTransactions')}
            message={t(hasQuery ? 'tx.noFilterResultsMsg' : 'dash.noTransactionsMsg')}
          />
        }
      />

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
              <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{t('tx.filterType')}</Text>
              <View style={styles.optionWrap}>
                {optionChip(t('dash.type.sale'), draftFilters.type === 'sale', () => toggleDraft('type', 'sale'))}
                {optionChip(
                  t('dash.type.purchase'),
                  draftFilters.type === 'purchase',
                  () => toggleDraft('type', 'purchase'),
                )}
              </View>

              <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{t('sale.filterPaymentStatus')}</Text>
              <View style={styles.optionWrap}>
                {optionChip(t('sale.filterPaid'), draftFilters.payment === 'paid', () => toggleDraft('payment', 'paid'))}
                {optionChip(
                  t('sale.filterPartial'),
                  draftFilters.payment === 'partial',
                  () => toggleDraft('payment', 'partial'),
                )}
                {optionChip(
                  t('sale.filterUnpaid'),
                  draftFilters.payment === 'unpaid',
                  () => toggleDraft('payment', 'unpaid'),
                )}
              </View>

              <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{t('tx.filterStatus')}</Text>
              <View style={styles.optionWrap}>
                {optionChip(t(PAYMENT_STATUS_KEYS.paid), draftFilters.status === 'paid', () => toggleDraft('status', 'paid'))}
                {optionChip(
                  t(PAYMENT_STATUS_KEYS.pending),
                  draftFilters.status === 'pending',
                  () => toggleDraft('status', 'pending'),
                )}
                {optionChip(
                  t(PAYMENT_STATUS_KEYS.partial),
                  draftFilters.status === 'partial',
                  () => toggleDraft('status', 'partial'),
                )}
                {optionChip(
                  t('dash.status.recorded'),
                  draftFilters.status === 'recorded',
                  () => toggleDraft('status', 'recorded'),
                )}
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

              {suppliers.length > 0 ? (
                <>
                  <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{t('purchase.supplier')}</Text>
                  <View style={styles.optionWrap}>
                    {suppliers.map(supplier =>
                      optionChip(
                        supplier.name,
                        draftFilters.supplierId === supplier.id,
                        () => toggleDraft('supplierId', supplier.id),
                        supplier.id,
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
    paddingBottom: spacing.xxl,
  },
  empty: { flexGrow: 1 },
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
  icon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
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
