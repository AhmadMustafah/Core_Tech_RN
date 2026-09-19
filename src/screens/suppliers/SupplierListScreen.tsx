import React, { useState, useCallback } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, FAB, Avatar } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EmptyState, LoadingState, ErrorState } from '@/components/common';
import { supplierService } from '@/services/supplierService';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { formatCurrency, getInitials } from '@/utils/formatters';
import type { Supplier } from '@/types';
import type { ProfileStackParamList } from '@/types/navigation';
import { spacing, borderRadius } from '@/theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'SupplierList'>;

export const SupplierListScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useAppTheme();
  const { t } = useLocalization();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setSuppliers(await supplierService.getAll()); }
    catch (err) { setError(err instanceof Error ? err.message : 'common.failedLoad'); }
    finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading && suppliers.length === 0 && !error) {
    return <LoadingState />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {error ? <ErrorState message={error} onRetry={load} /> : (
        <FlatList data={suppliers} keyExtractor={i => i.id} contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.82}
              style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
              onPress={() => navigation.navigate('SupplierDetails', { supplierId: item.id })}>
              <Avatar.Text size={48} label={getInitials(item.name)} style={{ backgroundColor: colors.secondary }} />
              <View style={styles.info}>
                <Text variant="titleSmall" style={{ color: colors.text, fontWeight: '700' }}>{item.name}</Text>
                <Text variant="bodySmall" style={{ color: colors.textSecondary, marginTop: 2 }}>
                  {item.company || t('common.na')}
                </Text>
                <Text variant="bodySmall" style={{ color: colors.textMuted, marginTop: 2 }}>
                  {item.email} · {item.phone}
                </Text>
                <Text variant="labelSmall" style={{ color: colors.primary, marginTop: spacing.xs, fontWeight: '600' }}>
                  {t('supplier.totalPurchases')}: {formatCurrency(item.totalPurchases || 0)}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<EmptyState icon="truck-outline" title={t('supplier.empty')} message={t('supplier.emptyMsg')} />}
        />
      )}
      <FAB icon="plus" style={[styles.fab, { backgroundColor: colors.secondary }]} onPress={() => navigation.navigate('AddSupplier')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: spacing.md, paddingBottom: 80 },
  card: {
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    alignItems: 'flex-start',
    borderWidth: 1,
    elevation: 1,
  },
  info: { marginStart: spacing.md, flex: 1, minWidth: 0 },
  fab: { position: 'absolute', end: spacing.md, bottom: spacing.md },
});
