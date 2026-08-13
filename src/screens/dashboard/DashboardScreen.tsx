import React, { useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  RefreshControl,
  useWindowDimensions,
  TouchableOpacity,
  type DimensionValue,
} from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CustomCard,
  EmptyState,
  LoadingState,
  ErrorState,
  ScreenHeader,
} from '@/components/common';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchDashboard } from '@/redux/slices/dashboardSlice';
import { useAppTheme } from '@/hooks/useAppTheme';
import { formatCurrency, formatRelativeTime } from '@/utils/formatters';
import type { Activity } from '@/types';
import type {
  DashboardStackParamList,
  MainTabParamList,
  RootStackParamList,
} from '@/types/navigation';
import { borderRadius, layout, shadows, spacing, typography } from '@/theme';

type Props = CompositeScreenProps<
  NativeStackScreenProps<DashboardStackParamList, 'DashboardHome'>,
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, 'Dashboard'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

const RECENT_ACTIVITY_LIMIT = 5;
const MAX_CONTENT_WIDTH = layout.maxContentWidth;

const MOCK_TRANSACTIONS = [
  {
    id: 'txn-1',
    ref: 'INV-1042',
    type: 'Sale' as const,
    party: 'Ahmed Traders',
    amount: 45200,
    status: 'Completed' as const,
    timestamp: '2026-07-30T10:30:00',
  },
  {
    id: 'txn-2',
    ref: 'PO-0891',
    type: 'Purchase' as const,
    party: 'Metro Supplies',
    amount: 28750,
    status: 'Pending' as const,
    timestamp: '2026-07-30T08:15:00',
  },
  {
    id: 'txn-3',
    ref: 'INV-1041',
    type: 'Sale' as const,
    party: 'City Mart',
    amount: 12800,
    status: 'Completed' as const,
    timestamp: '2026-07-29T16:45:00',
  },
];

const MOCK_ALERTS = [
  {
    id: 'alert-1',
    severity: 'warning' as const,
    title: 'Low stock alert',
    message: '3 products are below minimum stock level.',
  },
  {
    id: 'alert-2',
    severity: 'info' as const,
    title: 'Pending purchase order',
    message: 'PO-0891 is awaiting supplier confirmation.',
  },
  {
    id: 'alert-3',
    severity: 'error' as const,
    title: 'Payment overdue',
    message: '1 customer invoice is past due by 5 days.',
  },
];

const transactionIcons: Record<(typeof MOCK_TRANSACTIONS)[number]['type'], string> = {
  Sale: 'cart-check',
  Purchase: 'truck-delivery',
};

const activityIcons: Record<Activity['type'], string> = {
  sale: 'cart-check',
  purchase: 'truck-delivery',
  product: 'package-variant',
  customer: 'account-plus',
};

const activityTypeLabels: Record<Activity['type'], string> = {
  sale: 'Sale',
  purchase: 'Purchase',
  product: 'Inventory',
  customer: 'Customer',
};

const sortActivitiesByLatest = (items: Activity[]) =>
  [...items].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

const getLayoutMetrics = (width: number) => {
  const isCompact = width < 380;
  const isWide = width >= 600;
  const contentPadding = isCompact ? spacing.sm : spacing.md;
  const kpiColumns = isCompact ? 1 : 2;

  return {
    isCompact,
    isWide,
    contentPadding,
    kpiColumns,
    kpiItemWidth: (kpiColumns === 1 ? '100%' : '48%') as DimensionValue,
  };
};

type KpiStatCardProps = {
  title: string;
  value: string | number;
  icon: string;
  color?: string;
  onPress?: () => void;
  compactValue?: boolean;
};

const KpiStatCard: React.FC<KpiStatCardProps> = ({
  title,
  value,
  icon,
  color,
  onPress,
  compactValue = false,
}) => {
  const { colors } = useAppTheme();
  const accentColor = color || colors.primary;

  const content = (
    <View
      style={[
        kpiStyles.card,
        shadows.sm,
        {
          backgroundColor: colors.surface,
          borderColor: colors.borderLight,
        },
      ]}>
      <View style={[kpiStyles.iconContainer, { backgroundColor: accentColor + '14' }]}>
        <Icon source={icon} size={22} color={accentColor} />
      </View>
      <View style={kpiStyles.content}>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.65}
          style={[
            compactValue ? typography.kpiValueCompact : typography.kpiValue,
            { color: colors.text },
          ]}>
          {value}
        </Text>
        <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: 2 }]}>
          {title}
        </Text>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.82} style={kpiStyles.wrapper}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={kpiStyles.wrapper}>{content}</View>;
};

const kpiStyles = StyleSheet.create({
  wrapper: {
    flex: 1,
    height: '100%',
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    minHeight: 96,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    flexShrink: 0,
  },
  content: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
});

export const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { user } = useAppSelector(state => state.auth);
  const { summary, activities, isLoading, error } = useAppSelector(
    state => state.dashboard,
  );

  const { isCompact, isWide, contentPadding, kpiColumns, kpiItemWidth } =
    getLayoutMetrics(width);

  const loadData = useCallback(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const recentActivities = useMemo(
    () => sortActivitiesByLatest(activities).slice(0, RECENT_ACTIVITY_LIMIT),
    [activities],
  );

  const openActivityHistory = useCallback(() => {
    navigation.navigate('Activity');
  }, [navigation]);

  const getAlertColor = (severity: (typeof MOCK_ALERTS)[number]['severity']) => {
    switch (severity) {
      case 'warning':
        return colors.warning;
      case 'error':
        return colors.error;
      default:
        return colors.info;
    }
  };

  const getStatusColor = (status: (typeof MOCK_TRANSACTIONS)[number]['status']) =>
    status === 'Completed' ? colors.success : colors.warning;

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

  const kpiItems = useMemo(
    () => [
      {
        key: 'products',
        title: 'Products',
        value: summary?.totalProducts ?? 0,
        icon: 'package-variant',
        color: colors.primary,
      },
      {
        key: 'customers',
        title: 'Customers',
        value: summary?.totalCustomers ?? 0,
        icon: 'account-group-outline',
        color: colors.info,
      },
      {
        key: 'purchases',
        title: 'Purchases',
        value: formatCurrency(summary?.purchasesAmount ?? 0),
        icon: 'cart-outline',
        color: colors.secondary,
        compactValue: true,
      },
      {
        key: 'low-stock',
        title: 'Low Stock',
        value: summary?.lowStockCount ?? 0,
        icon: 'alert-circle-outline',
        color: colors.lowStock,
        onPress: () =>
          navigation.navigate('Inventory', { screen: 'ProductList' }),
      },
    ],
    [colors, navigation, summary],
  );

  if (isLoading && !summary) {
    return <LoadingState message="Loading dashboard..." />;
  }

  if (error && !summary) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingHorizontal: contentPadding,
          paddingTop: contentPadding,
          paddingBottom: spacing.xxl + insets.bottom,
          maxWidth: isWide ? MAX_CONTENT_WIDTH : undefined,
          alignSelf: isWide ? 'center' : undefined,
          width: '100%',
        },
      ]}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={loadData} />
      }
      showsVerticalScrollIndicator={false}>
      <ScreenHeader
        title={`Hello, ${user?.name?.split(' ')[0] || 'User'}!`}
        subtitle="Your ERP command center"
        showAvatar
        userName={user?.name || 'User'}
      />

      <View
        style={[
          styles.section,
          styles.heroCard,
          shadows.md,
          { backgroundColor: colors.primary, borderColor: colors.primaryDark },
        ]}>
        <View style={[styles.heroContent, isCompact && styles.heroContentCompact]}>
          <View style={styles.heroText}>
            <Text style={styles.heroLabel}>Total Revenue</Text>
            <Text
              style={[styles.heroValue, isCompact && styles.heroValueCompact]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}>
              {formatCurrency(summary?.salesAmount ?? 0)}
            </Text>
            <Text style={styles.heroMeta} numberOfLines={2}>
              {user?.company || 'CoreTech Enterprise'} · {summary?.totalSales ?? 0} sales
            </Text>
          </View>
          <View style={styles.heroBadge}>
            <Icon source="chart-line" size={28} color="#FFFFFF" />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, typography.label, { color: colors.textMuted }]}>
          Key Metrics
        </Text>
        <View style={styles.kpiGrid}>
          {kpiItems.map((item, index) => (
            <View
              key={item.key}
              style={[
                styles.kpiGridItem,
                { width: kpiItemWidth },
                index >= kpiColumns && styles.kpiGridItemSpaced,
              ]}>
              <KpiStatCard
                title={item.title}
                value={item.value}
                icon={item.icon}
                color={item.color}
                onPress={item.onPress}
                compactValue={item.compactValue}
              />
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <CustomCard title="Alerts" subtitle="Items that need your attention">
          <View style={styles.cardBody}>
            {MOCK_ALERTS.map(alert => (
              <View
                key={alert.id}
                style={[
                  styles.alertItem,
                  {
                    backgroundColor: colors.surfaceVariant,
                    borderLeftColor: getAlertColor(alert.severity),
                  },
                ]}>
                <Icon
                  source={
                    alert.severity === 'error'
                      ? 'alert-circle'
                      : alert.severity === 'warning'
                        ? 'alert'
                        : 'information'
                  }
                  size={20}
                  color={getAlertColor(alert.severity)}
                />
                <View style={styles.alertContent}>
                  <Text variant="bodyMedium" style={{ color: colors.text, fontWeight: '600' }}>
                    {alert.title}
                  </Text>
                  <Text variant="bodySmall" style={{ color: colors.textSecondary, marginTop: 2 }}>
                    {alert.message}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </CustomCard>
      </View>

      <View style={styles.section}>
        <CustomCard
          title="Recent Transactions"
          subtitle="Latest sales and purchases"
          headerRight={
            <Text variant="labelMedium" style={{ color: colors.primary }}>
              View all
            </Text>
          }>
          <View style={styles.cardBody}>
            {MOCK_TRANSACTIONS.map((transaction, index) => (
              <View
                key={transaction.id}
                style={[
                  styles.listItem,
                  index < MOCK_TRANSACTIONS.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: colors.border,
                  },
                ]}>
                <View
                  style={[
                    styles.listIcon,
                    { backgroundColor: colors.primary + '15' },
                  ]}>
                  <Icon
                    source={transactionIcons[transaction.type]}
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.listContent}>
                  <View style={styles.listHeader}>
                    <Text
                      variant="bodyMedium"
                      style={{ color: colors.text, fontWeight: '600', flex: 1 }}
                      numberOfLines={1}>
                      {transaction.ref}
                    </Text>
                    <Text
                      variant="bodyMedium"
                      style={{ color: colors.text, fontWeight: '700', flexShrink: 0 }}
                      numberOfLines={1}>
                      {formatCurrency(transaction.amount)}
                    </Text>
                  </View>
                  <View style={styles.listMeta}>
                    <Text
                      variant="bodySmall"
                      style={[styles.listMetaText, { color: colors.textSecondary }]}
                      numberOfLines={1}>
                      {transaction.type} · {transaction.party}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(transaction.status) + '18' },
                      ]}>
                      <Text
                        variant="labelSmall"
                        style={{ color: getStatusColor(transaction.status) }}>
                        {transaction.status}
                      </Text>
                    </View>
                  </View>
                  <Text variant="labelSmall" style={{ color: colors.textSecondary, marginTop: 2 }}>
                    {formatRelativeTime(transaction.timestamp)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </CustomCard>
      </View>

      <View style={styles.section}>
        <CustomCard
          title="Recent Activity"
          subtitle="Latest ERP and application events"
          headerRight={
            <TouchableOpacity onPress={openActivityHistory} hitSlop={8}>
              <Text variant="labelMedium" style={{ color: colors.primary }}>
                View all
              </Text>
            </TouchableOpacity>
          }>
          <View style={styles.cardBody}>
            {recentActivities.length === 0 ? (
              <View style={styles.emptyActivity}>
                <EmptyState
                  icon="history"
                  title="No recent activity"
                  message="Sales, purchases, and inventory events will appear here."
                />
              </View>
            ) : (
              recentActivities.map((activity, index) => (
                <TouchableOpacity
                  key={activity.id}
                  activeOpacity={0.7}
                  onPress={openActivityHistory}
                  style={[
                    styles.listItem,
                    index < recentActivities.length - 1 && {
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: colors.border,
                    },
                  ]}>
                  <View
                    style={[
                      styles.listIcon,
                      styles.activityIcon,
                      { backgroundColor: getActivityColor(activity.type) + '18' },
                    ]}>
                    <Icon
                      source={activityIcons[activity.type]}
                      size={18}
                      color={getActivityColor(activity.type)}
                    />
                  </View>
                  <View style={styles.listContent}>
                    <View style={styles.activityTitleRow}>
                      <Text
                        variant="bodyMedium"
                        style={{ color: colors.text, fontWeight: '600', flex: 1 }}
                        numberOfLines={1}>
                        {activity.title}
                      </Text>
                      <View
                        style={[
                          styles.typeBadge,
                          { backgroundColor: getActivityColor(activity.type) + '18' },
                        ]}>
                        <Text
                          variant="labelSmall"
                          style={{ color: getActivityColor(activity.type) }}>
                          {activityTypeLabels[activity.type]}
                        </Text>
                      </View>
                    </View>
                    <Text
                      variant="bodySmall"
                      style={{ color: colors.textSecondary, marginTop: 2 }}
                      numberOfLines={2}>
                      {activity.description}
                    </Text>
                    <Text
                      variant="labelSmall"
                      style={{ color: colors.textSecondary, marginTop: 4 }}>
                      {formatRelativeTime(activity.timestamp)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </CustomCard>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flexGrow: 1,
  },
  section: {
    marginBottom: spacing.lg,
  },
  heroCard: {
    marginBottom: 0,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
  },
  heroContentCompact: {
    padding: spacing.md,
  },
  heroText: {
    flex: 1,
    paddingRight: spacing.md,
    minWidth: 0,
  },
  heroLabel: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.88)',
    textTransform: 'uppercase',
  },
  heroValue: {
    ...typography.h1,
    color: '#FFFFFF',
    marginTop: spacing.xs,
  },
  heroValueCompact: {
    fontSize: 24,
  },
  heroMeta: {
    ...typography.bodySmall,
    color: 'rgba(255,255,255,0.78)',
    marginTop: spacing.xs,
  },
  heroBadge: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  kpiGridItem: {
    overflow: 'hidden',
    minHeight: 96,
  },
  kpiGridItemSpaced: {
    marginTop: spacing.sm,
  },
  cardBody: {
    paddingBottom: spacing.sm,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderLeftWidth: 4,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  alertContent: {
    flex: 1,
    marginLeft: spacing.md,
    minWidth: 0,
  },
  listItem: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  listIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    flexShrink: 0,
  },
  activityIcon: {
    width: 36,
    height: 36,
  },
  listContent: {
    flex: 1,
    minWidth: 0,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  listMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
    gap: spacing.sm,
  },
  listMetaText: {
    flex: 1,
    minWidth: 0,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    flexShrink: 0,
  },
  activityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  typeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    flexShrink: 0,
  },
  emptyActivity: {
    paddingVertical: spacing.sm,
  },
});
