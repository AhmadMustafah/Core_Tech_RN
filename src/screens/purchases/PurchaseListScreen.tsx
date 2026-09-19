import React, { useState, useCallback } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, FAB } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EmptyState, LoadingState, ErrorState } from '@/components/common';
import { purchaseService } from '@/services/purchaseService';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { formatCurrency, formatDate } from '@/utils/formatters';
import type { Purchase } from '@/types';
import type { PurchaseStackParamList } from '@/types/navigation';
import { spacing, borderRadius } from '@/theme';

type Props = NativeStackScreenProps<PurchaseStackParamList, 'PurchaseList'>;

export const PurchaseListScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useAppTheme();
  const { t, language } = useLocalization();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setPurchases(await purchaseService.getAll()); }
    catch (err) { setError(err instanceof Error ? err.message : 'purchase.failedLoad'); }
    finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading && purchases.length === 0) return <LoadingState message="purchase.loading" />;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {error ? <ErrorState message={error} onRetry={load} /> : (
        <FlatList
          data={purchases}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.82}
              style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
              onPress={() => navigation.navigate('PurchaseDetails', { purchaseId: item.id })}>
              <Text variant="titleSmall" style={{ color: colors.text, fontWeight: '600' }}>{item.purchaseNumber}</Text>
              <Text variant="bodySmall" style={{ color: colors.textSecondary }}>{item.supplierName} • {formatDate(item.createdAt, language)}</Text>
              <Text variant="titleMedium" style={{ color: colors.primary, marginTop: spacing.sm, fontWeight: '700' }}>{formatCurrency(item.totalAmount)}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<EmptyState icon="truck-outline" title={t('purchase.empty')} message={t('purchase.emptyMsg')} />}
        />
      )}
      <FAB icon="plus" style={[styles.fab, { backgroundColor: colors.primary }]} color={colors.onPrimary} onPress={() => navigation.navigate('CreatePurchase')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: spacing.md, paddingBottom: 80 },
  card: { padding: spacing.md, borderRadius: borderRadius.md, marginBottom: spacing.sm, borderWidth: 1, elevation: 1 },
  fab: { position: 'absolute', end: spacing.md, bottom: spacing.md },
});
