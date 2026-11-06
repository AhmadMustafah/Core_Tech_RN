import React, { useCallback, useLayoutEffect, useMemo } from 'react';
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
  NotificationBell,
  TransactionRow,
} from '@/components/common';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchDashboard } from '@/redux/slices/dashboardSlice';
import { openLedgerTransaction } from '@/navigation/navHelpers';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { formatCurrency, formatRelativeTime } from '@/utils/formatters';
import type { Activity, AppNotification } from '@/types';
import type {
  DashboardStackParamList,
  MainShellParamList,
  MainTabParamList,
} from '@/types/navigation';
import type { TranslationKey } from '@/localization';
import { borderRadius, layout, shadows, spacing, typography } from '@/theme';

type Props = CompositeScreenProps<
  NativeStackScreenProps<DashboardStackParamList, 'DashboardHome'>,
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, 'Dashboard'>,
    NativeStackScreenProps<MainShellParamList>
  >
>;

const RECENT_ACTIVITY_LIMIT = 5;
const MAX_CONTENT_WIDTH = layout.maxContentWidth;

const activityIcons: Record<Activity['type'], string> = {
  sale: 'cart-check',
  purchase: 'truck-delivery',
  product: 'package-variant',
  customer: 'account-plus',
  supplier: 'truck',
  payment: 'cash',
  auth: 'account-key',
};

const activityTypeKeys: Record<Activity['type'], TranslationKey> = {
  sale: 'activity.type.sale',
  purchase: 'activity.type.purchase',
  product: 'activity.type.product',
  customer: 'activity.type.customer',
  supplier: 'activity.type.supplier',
  payment: 'activity.type.payment',
  auth: 'activity.type.auth',
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

const KpiStatCard = React.memo<KpiStatCardProps>(function KpiStatCard({
  title,
  value,
  icon,
  color,
  onPress,
  compactValue = false,
}) {
  const { colors } = useAppTheme();
  const { isRTL, directionStyle } = useLocalization();
  const accentColor = color || colors.primary;
  const textAlign = isRTL ? 'right' : 'left';

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
          ellipsizeMode="tail"
          adjustsFontSizeToFit
          minimumFontScale={compactValue ? 0.58 : 0.72}
          style={[
            typography.kpiValue,
            kpiStyles.value,
            { color: colors.text, textAlign, writingDirection: 'ltr' },
          ]}>
          {value}
        </Text>
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[
            typography.bodySmall,
            kpiStyles.label,
            directionStyle,
            { color: colors.textSecondary, textAlign },
          ]}>
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
});

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
    marginEnd: spacing.md,
    flexShrink: 0,
  },
  content: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  value: {
    lineHeight: 28,
    includeFontPadding: false,
    textAlignVertical: 'center',
    width: '100%',
  },
  label: {
    marginTop: spacing.xs,
    lineHeight: 16,
    fontWeight: '500',
    includeFontPadding: false,
    textAlignVertical: 'center',
    width: '100%',
  },
});

export const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { colors } = useAppTheme();
  const { t, language, isRTL } = useLocalization();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { user } = useAppSelector(state => state.auth);
  const { summary, activities, transactions, notifications, isLoading, error } =
    useAppSelector(state => state.dashboard);

  const { isCompact, isWide, contentPadding, kpiColumns, kpiItemWidth } =
    getLayoutMetrics(width);

  const loadData = useCallback((force = false) => {
    dispatch(fetchDashboard(force));
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const unreadCount = useMemo(
    () => notifications.filter(item => !item.read).length,
    [notifications],
  );

  const openNotifications = useCallback(() => {
    navigation.navigate('Notifications');
  }, [navigation]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <NotificationBell unreadCount={unreadCount} onPress={openNotifications} />
      ),
    });
  }, [navigation, openNotifications, unreadCount]);

  const recentActivities = useMemo(
    () => sortActivitiesByLatest(activities).slice(0, RECENT_ACTIVITY_LIMIT),
    [activities],
  );

  const openActivityHistory = useCallback(() => {
    navigation.navigate('Activity');
  }, [navigation]);

  const alerts = useMemo(() => {
    const items: { id: string; severity: 'warning' | 'info' | 'error'; title: string; message: string }[] = [];
    if ((summary?.lowStockCount ?? 0) > 0) {
      items.push({
        id: 'low-stock',
        severity: 'warning',
        title: t('dash.alert.lowStock'),
        message: t('dash.alert.lowStockMsg'),
      });
    }
    const pendingPurchases = transactions.filter(
      row => row.type === 'Purchase' && row.status === 'pending',
    ).length;
    if (pendingPurchases > 0) {
      items.push({
        id: 'pending-po',
        severity: 'info',
        title: t('dash.alert.pendingPo'),
        message: t('dash.alert.pendingPoMsg'),
      });
    }
    const pendingSales = transactions.filter(
      row => row.type === 'Sale' && row.status === 'pending',
    ).length;
    if (pendingSales > 0) {
      items.push({
        id: 'pending-sales',
        severity: 'error',
        title: t('dash.alert.overdue'),
        message: t('dash.alert.overdueMsg'),
      });
    }
    notifications
      .filter((item: AppNotification) => !item.read)
      .slice(0, 3)
      .forEach(item => {
        items.push({
          id: item.id,
          severity: item.type === 'low_stock' ? 'warning' : 'info',
          title: item.title,
          message: item.message,
        });
      });
    return items;
  }, [notifications, summary, t, transactions]);

  const recentTransactions = useMemo(() => transactions.slice(0, 5), [transactions]);

  const getAlertColor = (severity: 'warning' | 'info' | 'error') => {
    switch (severity) {
      case 'warning':
        return colors.warning;
      case 'error':
        return colors.error;
      default:
        return colors.info;
    }
  };

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
        title: t('dash.products'),
        value: summary?.totalProducts ?? 0,
        icon: 'package-variant',
        color: colors.primary,
      },
      {
        key: 'customers',
        title: t('dash.customers'),
        value: summary?.totalCustomers ?? 0,
        icon: 'account-group-outline',
        color: colors.info,
      },
      {
        key: 'purchases',
        title: t('dash.purchases'),
        value: formatCurrency(summary?.purchasesAmount ?? 0),
        icon: 'cart-outline',
        color: colors.secondary,
        compactValue: true,
      },
      {
        key: 'low-stock',
        title: t('dash.lowStock'),
        value: summary?.lowStockCount ?? 0,
        icon: 'alert-circle-outline',
        color: colors.lowStock,
        onPress: () =>
          navigation.navigate('Inventory', { screen: 'ProductList' }),
      },
    ],
    [colors, navigation, summary, t],
  );

  if (isLoading && !summary) {
    return <LoadingState message="dash.loading" />;
  }

  if (error && !summary) {
    return <ErrorState message={error} onRetry={() => loadData(true)} />;
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
        <RefreshControl refreshing={isLoading} onRefresh={() => loadData(true)} />
      }
      showsVerticalScrollIndicator={false}>
      <ScreenHeader
        title={t('dash.hello', { name: user?.name?.split(' ')[0] || t('common.user') })}
        subtitle={t('dash.subtitle')}
        showAvatar
        userName={user?.name || t('common.user')}
      />

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigation.navigate('Sales', { screen: 'SalesList' })}
        style={[
          styles.section,
          styles.heroCard,
          shadows.md,
          { backgroundColor: colors.drawerHeader, borderColor: colors.primaryDark },
        ]}>
        <View style={[styles.heroContent, isCompact && styles.heroContentCompact]}>
          <View style={styles.heroText}>
            <Text style={styles.heroLabel}>{t('dash.totalRevenue')}</Text>
            <Text
              style={[styles.heroValue, isCompact && styles.heroValueCompact]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}>
              {formatCurrency(summary?.salesAmount ?? 0)}
            </Text>
            <Text style={styles.heroMeta} numberOfLines={2}>
              {user?.company || t('common.appName')} · {t('dash.salesCount', { count: summary?.totalSales ?? 0 })}
            </Text>
          </View>
          <View style={styles.heroBadge}>
            <Icon source="chart-line" size={28} color="#FFFFFF" />
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            typography.label,
            { color: colors.textMuted, textAlign: isRTL ? 'right' : 'left' },
          ]}>
          {t('dash.keyMetrics')}
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
        <CustomCard title={t('dash.alerts')} subtitle={t('dash.alertsSubtitle')}>
          <View style={styles.cardBody}>
            {alerts.length === 0 ? (
              <Text variant="bodyMedium" style={{ color: colors.textSecondary }}>
                {t('notify.emptyMsg')}
              </Text>
            ) : (
              alerts.map(alert => (
              <View
                key={alert.id}
                style={[
                  styles.alertItem,
                  {
                    backgroundColor: colors.surfaceVariant,
                    borderStartColor: getAlertColor(alert.severity),
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
            ))
            )}
          </View>
        </CustomCard>
      </View>

      <View style={styles.section}>
        <CustomCard
          title={t('dash.recentTransactions')}
          subtitle={t('dash.recentTransactionsSubtitle')}
          headerRight={
            <TouchableOpacity
              onPress={() => navigation.navigate('Transactions')}
              hitSlop={8}
              style={styles.viewAll}>
              <Text variant="labelMedium" style={{ color: colors.primary }}>
                {t('common.viewAll')}
              </Text>
            </TouchableOpacity>
          }>
          <View style={styles.cardBody}>
            {recentTransactions.length === 0 ? (
              <Text variant="bodyMedium" style={{ color: colors.textSecondary, paddingHorizontal: spacing.md }}>
                {t('sale.emptyMsg')}
              </Text>
            ) : recentTransactions.map((transaction, index) => (
              <TransactionRow
                key={`${transaction.type}-${transaction.relatedId || transaction.id}`}
                item={transaction}
                showDivider={index < recentTransactions.length - 1}
                onPress={() => openLedgerTransaction(navigation, transaction)}
              />
            ))}
          </View>
        </CustomCard>
      </View>

      <View style={styles.section}>
        <CustomCard
          title={t('dash.recentActivity')}
          subtitle={t('dash.recentActivitySubtitle')}
          headerRight={
            <TouchableOpacity onPress={openActivityHistory} hitSlop={8}>
              <Text variant="labelMedium" style={{ color: colors.primary }}>
                {t('common.viewAll')}
              </Text>
            </TouchableOpacity>
          }>
          <View style={styles.cardBody}>
            {recentActivities.length === 0 ? (
              <View style={styles.emptyActivity}>
                <EmptyState
                  compact
                  icon="history"
                  title={t('dash.noRecentActivity')}
                  message={t('dash.noRecentActivityMsg')}
                />
              </View>
            ) : (
              recentActivities.map((activity, index) => (
                <TouchableOpacity
                  key={activity.id}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('ActivityDetails', { activity })}
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
                        {t(activityTypeKeys[activity.type])}
                      </Text>
                      <View
                        style={[
                          styles.typeBadge,
                          { backgroundColor: getActivityColor(activity.type) + '18' },
                        ]}>
                        <Text
                          variant="labelSmall"
                          style={{ color: getActivityColor(activity.type) }}>
                          {t(activityTypeKeys[activity.type])}
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
                      {formatRelativeTime(activity.timestamp, language)}
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
    paddingEnd: spacing.md,
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
    borderStartWidth: 4,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  alertContent: {
    flex: 1,
    marginStart: spacing.md,
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
    marginEnd: spacing.md,
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
  viewAll: {
    flexShrink: 0,
    paddingTop: 2,
  },
});
