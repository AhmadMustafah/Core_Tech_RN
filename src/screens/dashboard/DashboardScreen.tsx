import React, { useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  CustomCard,
  ScreenHeader,
  StatCard,
  LoadingState,
  ErrorState,
} from '@/components/common';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchDashboard } from '@/redux/slices/dashboardSlice';
import { useAppTheme } from '@/hooks/useAppTheme';
import { formatCurrency, formatRelativeTime } from '@/utils/formatters';
import type { MainTabParamList, RootStackParamList } from '@/types/navigation';
import { spacing, borderRadius } from '@/theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Dashboard'>,
  NativeStackScreenProps<RootStackParamList>
>;

const quickActions = [
  { label: 'Add Product', icon: 'plus-box', tab: 'Inventory', screen: 'AddProduct' },
  { label: 'New Sale', icon: 'cart-plus', tab: 'Sales', screen: 'CreateSale' },
  { label: 'New Purchase', icon: 'truck-plus', tab: 'Purchases', screen: 'CreatePurchase' },
  { label: 'Customers', icon: 'account-group', tab: 'Profile', screen: 'CustomerList' },
];

export const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { colors } = useAppTheme();
  const { user } = useAppSelector(state => state.auth);
  const { summary, activities, isLoading, error } = useAppSelector(
    state => state.dashboard,
  );

  const loadData = useCallback(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
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
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={loadData} />
      }
      showsVerticalScrollIndicator={false}>
      <ScreenHeader
        title={`Hello, ${user?.name?.split(' ')[0] || 'User'}!`}
        subtitle="Here's your business overview"
        showAvatar
        userName={user?.name || 'User'}
      />

      <CustomCard style={StyleSheet.flatten([styles.welcomeCard, { backgroundColor: colors.primary }])}>
        <View style={styles.welcomeContent}>
          <View>
            <Text style={styles.welcomeTitle}>Welcome to CoreTech</Text>
            <Text style={styles.welcomeSubtitle}>
              {user?.company || 'Your Business Dashboard'}
            </Text>
          </View>
          <Text style={styles.welcomeEmoji}>📈</Text>
        </View>
      </CustomCard>

      <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.text }]}>
        Business Summary
      </Text>
      <View style={styles.statsGrid}>
        <StatCard title="Products" value={summary?.totalProducts ?? 0} icon="📦" color={colors.primary} />
        <StatCard title="Sales" value={summary?.totalSales ?? 0} icon="💰" color={colors.success} />
        <StatCard title="Purchases" value={summary?.totalPurchases ?? 0} icon="🛒" color={colors.secondary} />
        <StatCard title="Customers" value={summary?.totalCustomers ?? 0} icon="👥" color={colors.info} />
        <StatCard
          title="Low Stock"
          value={summary?.lowStockCount ?? 0}
          icon="⚠️"
          color={colors.lowStock}
          onPress={() => navigation.navigate('Inventory', { screen: 'ProductList' })}
        />
        <StatCard
          title="Sales Amount"
          value={formatCurrency(summary?.salesAmount ?? 0)}
          icon="💵"
          color={colors.accent}
        />
      </View>

      <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.text }]}>
        Quick Actions
      </Text>
      <View style={styles.quickActions}>
        {quickActions.map(action => (
          <TouchableOpacity
            key={action.label}
            style={[styles.quickAction, { backgroundColor: colors.surface }]}
            onPress={() =>
              navigation.navigate(action.tab as keyof MainTabParamList, {
                screen: action.screen,
              } as never)
            }>
            <Icon source={action.icon} size={28} color={colors.primary} />
            <Text variant="labelSmall" style={{ color: colors.text, marginTop: 4 }}>
              {action.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <CustomCard title="Recent Activities">
        {activities.length === 0 ? (
          <Text style={{ color: colors.textSecondary, padding: spacing.md }}>
            No recent activities
          </Text>
        ) : (
          activities.map(activity => (
            <View
              key={activity.id}
              style={[styles.activityItem, { borderBottomColor: colors.border }]}>
              <View style={[styles.activityDot, { backgroundColor: colors.primary }]} />
              <View style={styles.activityContent}>
                <Text variant="bodyMedium" style={{ color: colors.text, fontWeight: '600' }}>
                  {activity.title}
                </Text>
                <Text variant="bodySmall" style={{ color: colors.textSecondary }}>
                  {activity.description}
                </Text>
                <Text variant="labelSmall" style={{ color: colors.textSecondary, marginTop: 2 }}>
                  {formatRelativeTime(activity.timestamp)}
                </Text>
              </View>
            </View>
          ))
        )}
      </CustomCard>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  welcomeCard: { marginBottom: spacing.lg },
  welcomeContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  welcomeTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  welcomeSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  welcomeEmoji: { fontSize: 40 },
  sectionTitle: { fontWeight: '600', marginBottom: spacing.md, marginTop: spacing.sm },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  quickAction: {
    width: '47%',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    elevation: 1,
  },
  activityItem: {
    flexDirection: 'row',
    padding: spacing.md,
    borderBottomWidth: 1,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: spacing.md,
  },
  activityContent: { flex: 1 },
});
