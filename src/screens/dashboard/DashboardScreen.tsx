import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  RefreshControl,
  useWindowDimensions,
  TouchableOpacity,
  Pressable,
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
import { saleService } from '@/services/saleService';
import { purchaseService } from '@/services/purchaseService';
import { productService } from '@/services/productService';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { formatCurrency, formatRelativeTime } from '@/utils/formatters';
import { openRelatedRecord } from '@/utils/relatedNavigation';
import {
  buildAlerts,
  buildTransactions,
  type WorkspaceAlert,
  type WorkspaceTransaction,
} from '@/utils/workspaceRecords';
import type { Activity } from '@/types';
import type {
  DashboardStackParamList,
  MainTabParamList,
  RootStackParamList,
} from '@/types/navigation';
import type { TranslationKey } from '@/localization';
import { borderRadius, layout, shadows, spacing, typography } from '@/theme';
import { ActivityDetailsModal, ActivityListItem } from './activityUi';

type Props = CompositeScreenProps<
  NativeStackScreenProps<DashboardStackParamList, 'DashboardHome'>,
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, 'Dashboard'>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

const RECENT_ACTIVITY_LIMIT = 5;
const RECENT_TRANSACTION_LIMIT = 5;
const DASHBOARD_ALERT_LIMIT = 3;
const MAX_CONTENT_WIDTH = layout.maxContentWidth;

const transactionIcons: Record<WorkspaceTransaction['type'], string> = {
  sale: 'cart-check',
  purchase: 'truck-delivery',
};

const sortActivitiesByLatest = (items: Activity[]) =>
  [...items].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

const transactionStatusLabel = (
  status: WorkspaceTransaction['status'],
  t: (key: TranslationKey) => string,
) => {
  if (status === 'recorded') return t('dash.status.recorded');
  if (status === 'paid') return t('dash.status.completed');
  if (status === 'partial') return t('dash.status.partial');
  return t('dash.status.pending');
};

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

const KpiStatCard: React.FC<KpiStatCardProps> = memo(({
  title,
  value,
  icon,
  color,
  onPress,
  compactValue = false,
}) => {
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

KpiStatCard.displayName = 'KpiStatCard';

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
  const { summary, activities, isLoading, error } = useAppSelector(
    state => state.dashboard,
  );
  const [transactions, setTransactions] = useState<WorkspaceTransaction[]>([]);
  const [alerts, setAlerts] = useState<WorkspaceAlert[]>([]);
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const hasDashboardData = useRef(false);

  const { isCompact, isWide, contentPadding, kpiColumns, kpiItemWidth } =
    getLayoutMetrics(width);

  const loadData = useCallback((force = false) => {
    dispatch(fetchDashboard(!force && hasDashboardData.current));
    Promise.all([
      saleService.getAll(),
      purchaseService.getAll(),
      productService.getAll(),
    ]).then(([sales, purchases, products]) => {
      setTransactions(buildTransactions(sales, purchases));
      setAlerts(buildAlerts(products, sales));
      hasDashboardData.current = true;
    });
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

  const openTransactions = useCallback(() => {
    navigation.navigate('Transactions');
  }, [navigation]);

  const openAlerts = useCallback(() => {
    navigation.navigate('Alerts');
  }, [navigation]);

  const getAlertColor = (severity: WorkspaceAlert['severity']) => {
    switch (severity) {
      case 'warning':
        return colors.warning;
      case 'error':
        return colors.error;
      default:
        return colors.info;
    }
  };

  const getStatusColor = (status: WorkspaceTransaction['status']) => {
    if (status === 'paid' || status === 'recorded') return colors.success;
    if (status === 'partial') return colors.info;
    return colors.warning;
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
        imageUri={user?.avatar}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('screen.transactions')}
        onPress={openTransactions}
        style={({ pressed }) => [
          styles.section,
          styles.heroCard,
          shadows.md,
          {
            backgroundColor: colors.primary,
            borderColor: colors.primaryDark,
            opacity: pressed ? 0.92 : 1,
          },
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
      </Pressable>

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
        <CustomCard
          title={t('dash.alerts')}
          subtitle={t('dash.alertsSubtitle')}
          headerRight={
            <TouchableOpacity onPress={openAlerts} hitSlop={8}>
              <Text variant="labelMedium" style={{ color: colors.primary }}>
                {t('common.viewAll')}
              </Text>
            </TouchableOpacity>
          }>
          <View style={styles.cardBody}>
            {alerts.length === 0 ? (
              <EmptyState icon="bell-check-outline" title={t('dash.noAlerts')} message={t('dash.noAlertsMsg')} />
            ) : (
              alerts.slice(0, DASHBOARD_ALERT_LIMIT).map(alert => {
                const expanded = expandedAlertId === alert.id;
                return (
                  <TouchableOpacity
                    key={alert.id}
                    activeOpacity={0.85}
                    onPress={() => setExpandedAlertId(expanded ? null : alert.id)}
                    style={[
                      styles.alertItem,
                      {
                        backgroundColor: colors.surfaceVariant,
                        borderStartColor: getAlertColor(alert.severity),
                      },
                    ]}>
                    <Icon
                      source={alert.kind === 'low_stock' ? 'alert' : 'cash-alert'}
                      size={20}
                      color={getAlertColor(alert.severity)}
                    />
                    <View style={styles.alertContent}>
                      <Text variant="bodyMedium" style={{ color: colors.text, fontWeight: '600' }}>
                        {alert.kind === 'low_stock' ? t('dash.alert.lowStock') : t('dash.alert.overdue')}
                      </Text>
                      <Text variant="bodySmall" style={{ color: colors.text, marginTop: 2 }}>
                        {alert.productName || alert.reference}
                      </Text>
                      {alert.kind === 'low_stock' ? (
                        <Text variant="bodySmall" style={{ color: colors.textSecondary, marginTop: 2 }}>
                          {t('dash.alert.qty')}: {alert.quantity} · {t('dash.alert.threshold')}: {alert.threshold}
                        </Text>
                      ) : (
                        <Text variant="bodySmall" style={{ color: colors.textSecondary, marginTop: 2 }}>
                          {alert.partyName}
                          {alert.amount != null ? ` · ${formatCurrency(alert.amount)}` : ''}
                        </Text>
                      )}
                      {expanded ? (
                        <Text
                          variant="labelMedium"
                          style={{ color: colors.primary, marginTop: spacing.sm }}
                          onPress={() =>
                            openRelatedRecord(navigation as never, {
                              relatedType: alert.relatedType,
                              relatedId: alert.relatedId,
                            })
                          }>
                          {t('dash.alert.openRecord')}
                        </Text>
                      ) : null}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </CustomCard>
      </View>

      <View style={styles.section}>
        <CustomCard
          title={t('dash.recentTransactions')}
          subtitle={t('dash.recentTransactionsSubtitle')}
          headerRight={
            <TouchableOpacity onPress={openTransactions} hitSlop={8}>
              <Text variant="labelMedium" style={{ color: colors.primary }}>
                {t('common.viewAll')}
              </Text>
            </TouchableOpacity>
          }>
          <View style={styles.cardBody}>
            {transactions.length === 0 ? (
              <EmptyState
                icon="swap-horizontal"
                title={t('dash.noTransactions')}
                message={t('dash.noTransactionsMsg')}
              />
            ) : (
              transactions.slice(0, RECENT_TRANSACTION_LIMIT).map((transaction, index) => (
                <TouchableOpacity
                  key={transaction.id}
                  activeOpacity={0.8}
                  onPress={() =>
                    openRelatedRecord(navigation as never, {
                      relatedType: transaction.type,
                      relatedId: transaction.sourceId,
                    })
                  }
                  style={[
                    styles.listItem,
                    index < Math.min(transactions.length, RECENT_TRANSACTION_LIMIT) - 1 && {
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
                        {t(transaction.type === 'sale' ? 'dash.type.sale' : 'dash.type.purchase')} · {transaction.party}
                      </Text>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: getStatusColor(transaction.status) + '18' },
                        ]}>
                        <Text
                          variant="labelSmall"
                          style={{ color: getStatusColor(transaction.status) }}>
                          {transactionStatusLabel(transaction.status, t)}
                        </Text>
                      </View>
                    </View>
                    <Text variant="labelSmall" style={{ color: colors.textSecondary, marginTop: 2 }}>
                      {formatRelativeTime(transaction.timestamp, language)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
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
                  icon="history"
                  title={t('dash.noRecentActivity')}
                  message={t('dash.noRecentActivityMsg')}
                />
              </View>
            ) : (
              recentActivities.map((activity, index) => (
                <ActivityListItem
                  key={activity.id}
                  activity={activity}
                  onPress={setSelectedActivity}
                  last={index === recentActivities.length - 1}
                />
              ))
            )}
          </View>
        </CustomCard>
      </View>
      <ActivityDetailsModal
        activity={selectedActivity}
        visible={!!selectedActivity}
        onDismiss={() => setSelectedActivity(null)}
        onOpenRecord={activity => {
          const opened = openRelatedRecord(navigation as never, {
            relatedType: activity.entityType === 'auth' ? undefined : activity.entityType,
            relatedId: activity.entityId,
          });
          if (opened) {
            setSelectedActivity(null);
          }
        }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flexGrow: 1,
  },
  section: {
    marginBottom: spacing.xl,
  },
  heroCard: {
    marginBottom: spacing.lg,
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
});
