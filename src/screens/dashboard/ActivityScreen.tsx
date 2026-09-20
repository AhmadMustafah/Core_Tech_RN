import React, { useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import {
  CustomCard,
  EmptyState,
  ErrorState,
  FilterChips,
  LoadingState,
  SearchBar,
} from '@/components/common';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchDashboard } from '@/redux/slices/dashboardSlice';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { openRelatedRecord } from '@/utils/relatedNavigation';
import type { Activity, ActivityType } from '@/types';
import type { DashboardStackParamList, MainTabParamList } from '@/types/navigation';
import { spacing } from '@/theme';
import {
  ACTIVITY_TYPE_KEYS,
  ActivityDetailsModal,
  ActivityListItem,
} from './activityUi';

type Props = NativeStackScreenProps<DashboardStackParamList, 'Activity'>;

const TYPE_FILTERS: ActivityType[] = [
  'sale',
  'purchase',
  'product',
  'customer',
  'supplier',
  'payment',
  'auth',
];

export const ActivityScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const tabNavigation = navigation.getParent<NavigationProp<MainTabParamList>>();
  const { colors } = useAppTheme();
  const { t } = useLocalization();
  const { activities, isLoading, error } = useAppSelector(state => state.dashboard);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [selected, setSelected] = useState<Activity | null>(null);
  const hasLoaded = useRef(false);

  const loadData = useCallback(
    (force = false) => {
      dispatch(fetchDashboard(!force && hasLoaded.current));
    },
    [dispatch],
  );

  useFocusEffect(
    useCallback(() => {
      loadData();
      hasLoaded.current = true;
    }, [loadData]),
  );

  const sortedActivities = useMemo(
    () =>
      [...activities].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      ),
    [activities],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return sortedActivities.filter(item => {
      const matchesType = !typeFilter || item.type === typeFilter;
      const haystack = [
        item.title,
        item.description,
        item.entityName,
        item.entityReference,
        item.actor?.name,
        item.actor?.role,
        item.status,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return matchesType && (!needle || haystack.includes(needle));
    });
  }, [query, sortedActivities, typeFilter]);

  if (isLoading && activities.length === 0) {
    return <LoadingState message="activity.loading" />;
  }

  if (error && activities.length === 0) {
    return <ErrorState message={error} onRetry={() => loadData(true)} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.content}
        data={filtered}
        keyExtractor={item => item.id}
        initialNumToRender={10}
        windowSize={7}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={() => loadData(true)} />
        }
        ListHeaderComponent={
          <View>
            <CustomCard
              style={styles.summaryCard}
              title={t('activity.history')}
              subtitle={t('activity.subtitle')}>
              <Text
                variant="bodySmall"
                style={{ color: colors.textSecondary, paddingHorizontal: spacing.md, paddingBottom: spacing.md }}>
                {t(filtered.length === 1 ? 'activity.event' : 'activity.events', { count: filtered.length })}
              </Text>
            </CustomCard>
            <SearchBar value={query} onChangeText={setQuery} placeholder={t('activity.search')} />
            <FilterChips
              options={TYPE_FILTERS}
              selected={typeFilter}
              onSelect={setTypeFilter}
              labelFor={option => t(ACTIVITY_TYPE_KEYS[option as ActivityType])}
            />
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="history"
            title={t('activity.empty')}
            message={t('activity.emptyMsg')}
          />
        }
        renderItem={({ item, index }) => (
          <ActivityListItem
            activity={item}
            onPress={setSelected}
            last={index === filtered.length - 1}
          />
        )}
      />
      <ActivityDetailsModal
        activity={selected}
        visible={!!selected}
        onDismiss={() => setSelected(null)}
        onOpenRecord={activity => {
          const opened = openRelatedRecord(tabNavigation, {
            relatedType: activity.entityType === 'auth' ? undefined : activity.entityType,
            relatedId: activity.entityId,
          });
          if (opened) {
            setSelected(null);
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { flex: 1 },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  summaryCard: {
    marginBottom: spacing.md,
  },
});
