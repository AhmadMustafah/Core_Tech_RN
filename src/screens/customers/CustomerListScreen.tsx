import React, { useState, useCallback } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, FAB, Avatar } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SearchBar, EmptyState, LoadingState, ErrorState } from '@/components/common';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { customerService } from '@/services/customerService';
import { getErrorMessage } from '@/services/api';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { getInitials } from '@/utils/formatters';
import type { Customer } from '@/types';
import type { ProfileStackParamList } from '@/types/navigation';
import { spacing, borderRadius, listContentStyle, listPerformanceProps } from '@/theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'CustomerList'>;

export const CustomerListScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useAppTheme();
  const { t } = useLocalization();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try { setCustomers(await customerService.getAll(debouncedSearch)); }
    catch (err) { setError(getErrorMessage(err)); }
    finally { setLoading(false); }
  }, [debouncedSearch]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}><SearchBar value={search} onChangeText={setSearch} placeholder={t('customer.search')} /></View>
      {loading && customers.length === 0 ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <FlatList data={customers} keyExtractor={i => i.id} contentContainerStyle={listContentStyle}
          {...listPerformanceProps}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
          renderItem={({ item }) => (
            <TouchableOpacity style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => navigation.navigate('CustomerDetails', { customerId: item.id })}>
              <Avatar.Text size={44} label={getInitials(item.name)} color={colors.onPrimary} style={{ backgroundColor: colors.primary }} />
              <View style={styles.info}>
                <Text variant="titleSmall" numberOfLines={1} style={{ color: colors.text, fontWeight: '600' }}>{item.name}</Text>
                <Text variant="bodySmall" numberOfLines={1} style={{ color: colors.textSecondary }}>{item.email}</Text>
                <Text variant="bodySmall" numberOfLines={1} style={{ color: colors.textSecondary }}>{item.phone}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<EmptyState icon="account-group-outline" title={t('customer.empty')} message={t('customer.emptyMsg')} />}
        />
      )}
      <FAB icon="plus" color={colors.onPrimary} style={[styles.fab, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('AddCustomer')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: spacing.md, paddingBottom: 0 },
  list: { padding: spacing.md, paddingBottom: 80 },
  card: { flexDirection: 'row', padding: spacing.md, borderRadius: borderRadius.md, marginBottom: spacing.sm, alignItems: 'center', borderWidth: 1 },
  info: { marginStart: spacing.md, flex: 1 },
  fab: { position: 'absolute', end: spacing.md, bottom: spacing.md },
});
