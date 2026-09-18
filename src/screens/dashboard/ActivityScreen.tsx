import React, { useCallback, useMemo } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import {
  CustomCard,
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/common';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchDashboard } from '@/redux/slices/dashboardSlice';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { formatRelativeTime } from '@/utils/formatters';
import type { Activity } from '@/types';
import type { DashboardStackParamList } from '@/types/navigation';
import type { TranslationKey } from '@/localization';
import { borderRadius, spacing } from '@/theme';

type Props = NativeStackScreenProps<DashboardStackParamList, 'Activity'>;

const activityTypeKeys: Record<Activity['type'], TranslationKey> = {
  sale: 'activity.type.sale',
  purchase: 'activity.type.purchase',
  product: 'activity.type.product',
  customer: 'activity.type.customer',
};

const activityIcons: Record<Activity['type'], string> = {
  sale: 'cart-check',
  purchase: 'truck-delivery',
  product: 'package-variant',
  customer: 'account-plus',
};

export const ActivityScreen: React.FC<Props> = () => {
  const dispatch = useAppDispatch();
  const { colors } = useAppTheme();
  const { t, language } = useLocalization();
  const { activities, isLoading, error } = useAppSelector(state => state.dashboard);

  const loadData = useCallback(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const sortedActivities = useMemo(
    () =>
      [...activities].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      ),
    [activities],
  );

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'sale':
        return colors.success;
      case 'purchase':
        return colors.secondary;
      case 'product':
        return colors.warning;
      case 'customer':
        return colors.info;
      default:
        return colors.primary;
    }
  };

  if (isLoading && activities.length === 0) {
    return <LoadingState message="activity.loading" />;
  }

  if (error && activities.length === 0) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  return (
    <FlatList
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      data={sortedActivities}
      keyExtractor={item => item.id}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={loadData} />
      }
      ListHeaderComponent={
        <CustomCard
          style={styles.summaryCard}
          title={t('activity.history')}
          subtitle={t('activity.subtitle')}>
          <Text variant="bodySmall" style={{ color: colors.textSecondary, paddingHorizontal: spacing.md, paddingBottom: spacing.md }}>
            {t(sortedActivities.length === 1 ? 'activity.event' : 'activity.events', { count: sortedActivities.length })}
          </Text>
        </CustomCard>
      }
      ListEmptyComponent={
        <EmptyState
          icon="history"
          title={t('activity.empty')}
          message={t('activity.emptyMsg')}
        />
      }
      renderItem={({ item, index }) => (
        <View
          style={[
            styles.activityRow,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              marginBottom: index === sortedActivities.length - 1 ? spacing.lg : spacing.sm,
            },
          ]}>
          <View
            style={[
              styles.activityIcon,
              { backgroundColor: getActivityColor(item.type) + '18' },
            ]}>
            <Icon
              source={activityIcons[item.type]}
              size={20}
              color={getActivityColor(item.type)}
            />
          </View>
          <View style={styles.activityContent}>
            <Text variant="bodyMedium" style={{ color: colors.text, fontWeight: '600' }}>
              {t(activityTypeKeys[item.type])}
            </Text>
            <Text variant="bodySmall" style={{ color: colors.textSecondary, marginTop: 2 }}>
              {item.description}
            </Text>
            <Text variant="labelSmall" style={{ color: colors.textSecondary, marginTop: 4 }}>
              {formatRelativeTime(item.timestamp, language)}
            </Text>
          </View>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  summaryCard: {
    marginBottom: spacing.md,
  },
  activityRow: {
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
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
