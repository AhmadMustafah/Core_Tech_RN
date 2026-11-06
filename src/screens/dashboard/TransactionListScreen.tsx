import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Chip } from 'react-native-paper';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { EmptyState, ErrorState, LoadingState, SearchBar, TransactionRow } from '@/components/common';
import { getErrorMessage } from '@/services/api';
import { transactionService, type LedgerTransaction } from '@/services/transactionService';
import { openLedgerTransaction } from '@/navigation/navHelpers';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useCachedFocusLoad } from '@/hooks/useCachedFocusLoad';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useLocalization } from '@/hooks/useLocalization';
import type { DashboardStackParamList, MainTabParamList } from '@/types/navigation';
import { listPerformanceProps, spacing } from '@/theme';

type Props = CompositeScreenProps<
  NativeStackScreenProps<DashboardStackParamList, 'Transactions'>,
  BottomTabScreenProps<MainTabParamList>
>;

const PAGE_SIZE = 30;

export const TransactionListScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useAppTheme();
  const { t } = useLocalization();
  const [items, setItems] = useState<LedgerTransaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [kind, setKind] = useState<'Sale' | 'Purchase' | null>(null);
  const [range, setRange] = useState<'all' | '7' | '30'>('all');
  const [sort, setSort] = useState<'desc' | 'asc'>('desc');
  const debouncedSearch = useDebouncedValue(search);

  const from = useMemo(() => {
    if (range === 'all') {
      return undefined;
    }
    const days = range === '7' ? 7 : 30;
    return new Date(Date.now() - days * 86400000).toISOString();
  }, [range]);

  const queryKey = `${debouncedSearch}|${kind ?? 'all'}|${range}|${sort}`;

  const load = useCallback(
    async (nextPage = 1, append = false) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);
      try {
        const result = await transactionService.list({
          page: nextPage,
          limit: PAGE_SIZE,
          search: debouncedSearch || undefined,
          type: kind || undefined,
          from,
          sort,
        });
        setPage(nextPage);
        setTotal(result.total);
        setItems(prev => (append ? [...prev, ...result.items] : result.items));
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [debouncedSearch, from, kind, sort],
  );

  useCachedFocusLoad(() => {
    void load(1, false);
  }, queryKey);

  const openItem = (item: LedgerTransaction) => {
    openLedgerTransaction(navigation, item);
  };

  if (loading && items.length === 0) {
    return <LoadingState message="tx.loading" />;
  }

  if (error && items.length === 0) {
    return <ErrorState message={error} onRetry={() => load(1, false)} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.filters}>
        <SearchBar value={search} onChangeText={setSearch} placeholder={t('tx.search')} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}>
          <Chip
            compact
            selected={!kind}
            onPress={() => setKind(null)}
            style={styles.chip}
            selectedColor={colors.primary}
            showSelectedOverlay>
            {t('common.all')}
          </Chip>
          <Chip
            compact
            selected={kind === 'Sale'}
            onPress={() => setKind('Sale')}
            style={styles.chip}
            selectedColor={colors.primary}
            showSelectedOverlay>
            {t('dash.type.sale')}
          </Chip>
          <Chip
            compact
            selected={kind === 'Purchase'}
            onPress={() => setKind('Purchase')}
            style={styles.chip}
            selectedColor={colors.primary}
            showSelectedOverlay>
            {t('dash.type.purchase')}
          </Chip>
          <Chip compact selected={sort === 'desc'} onPress={() => setSort(sort === 'desc' ? 'asc' : 'desc')} style={styles.chip}>
            {sort === 'desc' ? t('tx.newest') : t('tx.oldest')}
          </Chip>
        </ScrollView>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}>
          {(['all', '7', '30'] as const).map(option => (
            <Chip
              key={option}
              compact
              selected={range === option}
              onPress={() => setRange(option)}
              style={styles.chip}
              selectedColor={colors.primary}
              showSelectedOverlay>
              {option === 'all' ? t('tx.rangeAll') : option === '7' ? t('tx.range7') : t('tx.range30')}
            </Chip>
          ))}
        </ScrollView>
      </View>
      <FlatList
        data={items}
        keyExtractor={item => `${item.type}-${item.relatedId || item.id}`}
        contentContainerStyle={styles.list}
        {...listPerformanceProps}
        removeClippedSubviews={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => load(1, false)} />}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (!loading && !loadingMore && items.length < total) {
            void load(page + 1, true);
          }
        }}
        ListEmptyComponent={<EmptyState icon="swap-horizontal" title={t('tx.empty')} message={t('tx.emptyMsg')} />}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
            <TransactionRow
              item={item}
              showDivider={false}
              onPress={() => openItem(item)}
            />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  filters: { paddingTop: spacing.sm },
  chipRow: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
    alignItems: 'center',
  },
  chip: { marginRight: 0 },
  list: { padding: spacing.md, paddingTop: spacing.xs, paddingBottom: spacing.xxl, flexGrow: 1 },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
});
