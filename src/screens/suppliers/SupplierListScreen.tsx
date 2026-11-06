import React, { useState, useCallback } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, FAB, Avatar } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EmptyState, LoadingState, ErrorState } from '@/components/common';
import { supplierService } from '@/services/supplierService';
import { getErrorMessage } from '@/services/api';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { getInitials } from '@/utils/formatters';
import type { Supplier } from '@/types';
import type { ProfileStackParamList } from '@/types/navigation';
import { spacing, borderRadius, listContentStyle, listPerformanceProps } from '@/theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'SupplierList'>;

export const SupplierListScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useAppTheme();
  const { t } = useLocalization();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try { setSuppliers(await supplierService.getAll()); }
    catch (err) { setError(getErrorMessage(err)); }
    finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {loading && suppliers.length === 0 ? (
        <LoadingState />
      ) : error ? <ErrorState message={error} onRetry={load} /> : (
        <FlatList data={suppliers} keyExtractor={i => i.id} contentContainerStyle={listContentStyle}
          {...listPerformanceProps}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
          renderItem={({ item }) => (
            <TouchableOpacity style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => navigation.navigate('SupplierDetails', { supplierId: item.id })}>
              <Avatar.Text size={44} label={getInitials(item.name)} color={colors.onPrimary} style={{ backgroundColor: colors.primary }} />
              <View style={styles.info}>
                <Text variant="titleSmall" numberOfLines={1} style={{ color: colors.text, fontWeight: '600' }}>{item.name}</Text>
                <Text variant="bodySmall" numberOfLines={1} style={{ color: colors.textSecondary }}>{item.email} • {item.phone}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<EmptyState icon="truck-outline" title={t('supplier.empty')} message={t('supplier.emptyMsg')} />}
        />
      )}
      <FAB icon="plus" color={colors.onPrimary} style={[styles.fab, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('AddSupplier')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: spacing.md, paddingBottom: 80 },
  card: { flexDirection: 'row', padding: spacing.md, borderRadius: borderRadius.md, marginBottom: spacing.sm, alignItems: 'center', borderWidth: 1 },
  info: { marginStart: spacing.md, flex: 1 },
  fab: { position: 'absolute', end: spacing.md, bottom: spacing.md },
});
