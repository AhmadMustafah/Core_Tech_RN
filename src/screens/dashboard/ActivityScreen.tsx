import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Chip, Text, Icon } from 'react-native-paper';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import {
  EmptyState,
  ErrorState,
  LoadingState,
  SearchBar,
} from '@/components/common';
import { dashboardService } from '@/services/dashboardService';
import { getErrorMessage } from '@/services/api';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useCachedFocusLoad } from '@/hooks/useCachedFocusLoad';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useLocalization } from '@/hooks/useLocalization';
import { formatRelativeTime } from '@/utils/formatters';
import type { Activity, Language } from '@/types';
import type {
  DashboardStackParamList,
  MainShellParamList,
  MainTabParamList,
} from '@/types/navigation';
import type { TranslationKey } from '@/localization';
import { borderRadius, listPerformanceProps, spacing } from '@/theme';

type Props = CompositeScreenProps<
  NativeStackScreenProps<DashboardStackParamList, 'Activity'>,
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, 'Dashboard'>,
    NativeStackScreenProps<MainShellParamList>
  >
>;

const PAGE_SIZE = 30;

const activityTypeKeys: Record<Activity['type'], TranslationKey> = {
  sale: 'activity.type.sale',
  purchase: 'activity.type.purchase',
  product: 'activity.type.product',
  customer: 'activity.type.customer',
  supplier: 'activity.type.supplier',
  payment: 'activity.type.payment',
  auth: 'activity.type.auth',
};

const activityIcons: Record<Activity['type'], string> = {
  sale: 'cart-check',
  purchase: 'truck-delivery',
  product: 'package-variant',
  customer: 'account-plus',
  supplier: 'truck',
  payment: 'cash',
  auth: 'account-key',
};

const FILTERS: Array<Activity['type'] | null> = [
  null,
  'sale',
  'purchase',
  'product',
  'customer',
  'supplier',
  'payment',
];

type ActivityRowProps = {
  item: Activity;
  colors: { text: string; textSecondary: string; surface: string; border: string; success: string; secondary: string; warning: string; info: string; primary: string };
  language: Language;
  t: (key: TranslationKey) => string;
  onPress: () => void;
};

const ActivityRow: React.FC<ActivityRowProps> = ({ item, colors, language, t, onPress }) => {
  const accent =
    item.type === 'sale'
      ? colors.success
      : item.type === 'purchase'
        ? colors.secondary
        : item.type === 'product'
          ? colors.warning
          : item.type === 'customer'
            ? colors.info
            : colors.primary;

  return (
    <TouchableOpacity
      activeOpacity={0.72}
      onPress={onPress}
      style={[styles.activityRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.activityIcon, { backgroundColor: accent + '18' }]}>
        <Icon source={activityIcons[item.type] || 'history'} size={20} color={accent} />
      </View>
      <View style={styles.activityContent}>
        <Text variant="bodyMedium" style={{ color: colors.text, fontWeight: '600' }}>
          {item.title || (activityTypeKeys[item.type] ? t(activityTypeKeys[item.type]) : item.type)}
        </Text>
        <Text variant="bodySmall" style={{ color: colors.textSecondary, marginTop: 2 }}>
          {item.description}
        </Text>
        {item.actor?.name ? (
          <Text variant="labelSmall" style={{ color: colors.textSecondary, marginTop: 4 }}>
            {item.actor.name}
            {item.actor.role ? ` · ${item.actor.role}` : ''}
          </Text>
        ) : null}
        <Text variant="labelSmall" style={{ color: colors.textSecondary, marginTop: 2 }}>
          {formatRelativeTime(item.timestamp, language)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export const ActivityScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useAppTheme();
  const { t, language } = useLocalization();
  const [items, setItems] = useState<Activity[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [type, setType] = useState<Activity['type'] | null>(null);
  const debouncedSearch = useDebouncedValue(search);
  const queryKey = `${debouncedSearch}|${type ?? 'all'}`;

  const load = useCallback(
    async (nextPage = 1, append = false) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);
      try {
        const result = await dashboardService.getActivities({
          page: nextPage,
          limit: PAGE_SIZE,
          search: debouncedSearch || undefined,
          type: type || undefined,
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
    [debouncedSearch, type],
  );

  useCachedFocusLoad(() => {
    void load(1, false);
  }, queryKey);

  const filterLabels = useMemo(
    () => ({
      sale: t('activity.type.sale'),
      purchase: t('activity.type.purchase'),
      product: t('activity.type.product'),
      customer: t('activity.type.customer'),
      supplier: t('activity.type.supplier'),
      payment: t('activity.type.payment'),
      auth: t('activity.type.auth'),
    }),
    [t],
  );

  if (loading && items.length === 0) {
    return <LoadingState message="activity.loading" />;
  }

  if (error && items.length === 0) {
    return <ErrorState message={error} onRetry={() => load(1, false)} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.filters}>
        <SearchBar value={search} onChangeText={setSearch} placeholder={t('activity.search')} />
        <View style={styles.chipRow}>
          {FILTERS.map(option => (
            <Chip
              key={option ?? 'all'}
              selected={type === option}
              onPress={() => setType(option)}
              style={styles.chip}
              selectedColor={colors.primary}>
              {option ? filterLabels[option] : t('common.all')}
            </Chip>
          ))}
        </View>
      </View>
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        {...listPerformanceProps}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => load(1, false)} />}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (!loading && !loadingMore && items.length < total) {
            void load(page + 1, true);
          }
        }}
        ListEmptyComponent={
          <EmptyState icon="history" title={t('activity.empty')} message={t('activity.emptyMsg')} />
        }
        renderItem={({ item }) => (
          <ActivityRow
            item={item}
            colors={colors}
            language={language}
            t={t}
            onPress={() => navigation.navigate('ActivityDetails', { activity: item })}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  filters: { paddingHorizontal: spacing.md, paddingTop: spacing.md },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
  chip: { marginRight: 0 },
  list: { padding: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.xxl, flexGrow: 1 },
  activityRow: {
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginEnd: spacing.md,
  },
  activityContent: { flex: 1 },
});
