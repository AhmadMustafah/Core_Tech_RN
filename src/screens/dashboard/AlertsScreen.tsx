import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomButton, EmptyState, LoadingState } from '@/components/common';
import { productService } from '@/services/productService';
import { saleService } from '@/services/saleService';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { formatCurrency } from '@/utils/formatters';
import { openRelatedRecord } from '@/utils/relatedNavigation';
import { buildAlerts, type WorkspaceAlert } from '@/utils/workspaceRecords';
import type { DashboardStackParamList, MainTabParamList } from '@/types/navigation';
import { PAYMENT_STATUS_KEYS } from '@/localization';
import { borderRadius, spacing } from '@/theme';

type Props = NativeStackScreenProps<DashboardStackParamList, 'Alerts'>;

export const AlertsScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useAppTheme();
  const { t } = useLocalization();
  const tabNavigation = navigation.getParent<NavigationProp<MainTabParamList>>();
  const [alerts, setAlerts] = useState<WorkspaceAlert[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [products, sales] = await Promise.all([
        productService.getAll(),
        saleService.getAll(),
      ]);
      setAlerts(buildAlerts(products, sales));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const severityColor = (severity: WorkspaceAlert['severity']) => {
    if (severity === 'error') return colors.error;
    if (severity === 'warning') return colors.warning;
    return colors.info;
  };

  if (loading && alerts.length === 0) {
    return <LoadingState message="dash.loading" />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={alerts}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.list, alerts.length === 0 && styles.empty]}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        renderItem={({ item }) => {
          const accent = severityColor(item.severity);
          const expanded = expandedId === item.id;
          return (
            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.card,
                {
                  backgroundColor: colors.surface,
                  borderStartColor: accent,
                  borderColor: colors.borderLight,
                },
              ]}
              onPress={() => setExpandedId(expanded ? null : item.id)}>
              <View style={styles.header}>
                <View style={[styles.icon, { backgroundColor: accent + '18' }]}>
                  <Icon
                    name={item.kind === 'low_stock' ? 'alert' : 'cash-alert'}
                    size={20}
                    color={accent}
                  />
                </View>
                <View style={styles.headerText}>
                  <Text variant="titleSmall" style={{ color: colors.text, fontWeight: '700' }}>
                    {item.kind === 'low_stock' ? t('dash.alert.lowStock') : t('dash.alert.overdue')}
                  </Text>
                  <Text variant="bodySmall" style={{ color: colors.textSecondary, marginTop: 2 }}>
                    {item.productName || item.reference} · {item.partyName || item.sku || ''}
                  </Text>
                </View>
              </View>
              {item.kind === 'low_stock' ? (
                <Text variant="bodySmall" style={{ color: colors.text, marginTop: spacing.sm }}>
                  {t('dash.alert.qty')}: {item.quantity} · {t('dash.alert.threshold')}: {item.threshold}
                </Text>
              ) : (
                <Text variant="bodySmall" style={{ color: colors.text, marginTop: spacing.sm }}>
                  {item.amount != null ? formatCurrency(item.amount) : ''} ·{' '}
                  {item.status && item.status in PAYMENT_STATUS_KEYS
                    ? t(PAYMENT_STATUS_KEYS[item.status as keyof typeof PAYMENT_STATUS_KEYS])
                    : item.status}
                </Text>
              )}
              {expanded ? (
                <View style={styles.expanded}>
                  {item.sku ? (
                    <Text variant="bodySmall" style={{ color: colors.textSecondary }}>
                      {t('dash.alert.sku')}: {item.sku}
                    </Text>
                  ) : null}
                  {item.partyName ? (
                    <Text variant="bodySmall" style={{ color: colors.textSecondary }}>
                      {t('dash.alert.party')}: {item.partyName}
                    </Text>
                  ) : null}
                  <CustomButton
                    title={t('dash.alert.openRecord')}
                    onPress={() =>
                      openRelatedRecord(tabNavigation, {
                        relatedType: item.relatedType,
                        relatedId: item.relatedId,
                      })
                    }
                    fullWidth
                    style={{ marginTop: spacing.sm }}
                  />
                </View>
              ) : null}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <EmptyState icon="bell-check-outline" title={t('dash.noAlerts')} message={t('dash.noAlertsMsg')} />
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
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderStartWidth: 4,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  icon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: { flex: 1, minWidth: 0 },
  expanded: { marginTop: spacing.sm, gap: spacing.xs },
});
