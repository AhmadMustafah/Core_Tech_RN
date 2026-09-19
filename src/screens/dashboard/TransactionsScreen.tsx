import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EmptyState, LoadingState } from '@/components/common';
import { saleService } from '@/services/saleService';
import { purchaseService } from '@/services/purchaseService';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { openRelatedRecord } from '@/utils/relatedNavigation';
import {
  buildTransactions,
  type WorkspaceTransaction,
} from '@/utils/workspaceRecords';
import type { DashboardStackParamList, MainTabParamList } from '@/types/navigation';
import { PAYMENT_STATUS_KEYS } from '@/localization';
import { borderRadius, spacing } from '@/theme';

type Props = NativeStackScreenProps<DashboardStackParamList, 'Transactions'>;

const statusKey = (status: WorkspaceTransaction['status']) => {
  if (status === 'recorded') return 'dash.status.recorded' as const;
  if (status === 'paid') return PAYMENT_STATUS_KEYS.paid;
  if (status === 'partial') return PAYMENT_STATUS_KEYS.partial;
  return PAYMENT_STATUS_KEYS.pending;
};

export const TransactionsScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useAppTheme();
  const { t, language } = useLocalization();
  const tabNavigation = navigation.getParent<NavigationProp<MainTabParamList>>();
  const [items, setItems] = useState<WorkspaceTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sales, purchases] = await Promise.all([
        saleService.getAll(),
        purchaseService.getAll(),
      ]);
      setItems(buildTransactions(sales, purchases));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const openItem = (item: WorkspaceTransaction) => {
    openRelatedRecord(tabNavigation, {
      relatedType: item.type,
      relatedId: item.sourceId,
    });
  };

  const statusColor = (status: WorkspaceTransaction['status']) => {
    if (status === 'paid' || status === 'recorded') return colors.success;
    if (status === 'partial') return colors.info;
    return colors.warning;
  };

  if (loading && items.length === 0) {
    return <LoadingState message="dash.loading" />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.list, items.length === 0 && styles.empty]}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        renderItem={({ item }) => {
          const accent = item.type === 'sale' ? colors.success : colors.primary;
          return (
            <TouchableOpacity
              activeOpacity={0.82}
              style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
              onPress={() => openItem(item)}>
              <View style={[styles.icon, { backgroundColor: accent + '18' }]}>
                <Icon
                  name={item.type === 'sale' ? 'cart-check' : 'truck-delivery'}
                  size={20}
                  color={accent}
                />
              </View>
              <View style={styles.body}>
                <View style={styles.row}>
                  <Text variant="titleSmall" style={{ color: colors.text, fontWeight: '700', flex: 1 }}>
                    {item.ref}
                  </Text>
                  <Text variant="titleSmall" style={{ color: colors.text, fontWeight: '700' }}>
                    {formatCurrency(item.amount)}
                  </Text>
                </View>
                <Text variant="bodySmall" style={{ color: colors.textSecondary, marginTop: 2 }}>
                  {t(item.type === 'sale' ? 'dash.type.sale' : 'dash.type.purchase')} · {item.party}
                </Text>
                <View style={styles.row}>
                  <Text variant="labelSmall" style={{ color: colors.textMuted }}>
                    {formatDateTime(item.timestamp, language)}
                  </Text>
                  <View style={[styles.badge, { backgroundColor: statusColor(item.status) + '18' }]}>
                    <Text variant="labelSmall" style={{ color: statusColor(item.status), fontWeight: '600' }}>
                      {t(statusKey(item.status))}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <EmptyState icon="swap-horizontal" title={t('dash.noTransactions')} message={t('dash.noTransactionsMsg')} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: spacing.md, paddingBottom: spacing.xxl },
  empty: { flexGrow: 1 },
  card: {
    flexDirection: 'row',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: { flex: 1, minWidth: 0 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
});
