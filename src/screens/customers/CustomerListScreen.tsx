import React, { useState, useCallback, useMemo, useRef } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, FAB } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SearchBar, EmptyState, LoadingState, ErrorState, InitialsAvatar } from '@/components/common';
import { customerService } from '@/services/customerService';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import type { Customer } from '@/types';
import type { ProfileStackParamList } from '@/types/navigation';
import { spacing, borderRadius } from '@/theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'CustomerList'>;

export const CustomerListScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useAppTheme();
  const { t } = useLocalization();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const hasLoaded = useRef(false);

  const load = useCallback(async (force = false) => {
    if (!hasLoaded.current) {
      setLoading(true);
    }
    try {
      setCustomers(await customerService.getAll());
      hasLoaded.current = true;
    }
    catch (err) { setError(err instanceof Error ? err.message : 'common.failedLoad'); }
    finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const visibleCustomers = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return customers;
    return customers.filter(
      customer =>
        customer.name.toLowerCase().includes(needle) ||
        customer.email.toLowerCase().includes(needle) ||
        customer.phone.includes(needle) ||
        (customer.company || '').toLowerCase().includes(needle),
    );
  }, [customers, search]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}><SearchBar value={search} onChangeText={setSearch} placeholder={t('customer.search')} /></View>
      {error ? <ErrorState message={error} onRetry={load} /> : (
        <FlatList data={visibleCustomers} keyExtractor={i => i.id} contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={() => load(true)} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.82}
              style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
              onPress={() => navigation.navigate('CustomerDetails', { customerId: item.id })}>
              <InitialsAvatar size={48} name={item.name} />
              <View style={styles.info}>
                <Text variant="titleSmall" style={{ color: colors.text, fontWeight: '700' }}>{item.name}</Text>
                <Text variant="bodySmall" style={{ color: colors.textSecondary, marginTop: 2 }}>
                  {item.company || t('common.na')}
                </Text>
                <Text variant="bodySmall" style={{ color: colors.textMuted, marginTop: 2 }}>{item.email} · {item.phone}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<EmptyState icon="account-group-outline" title={t('customer.empty')} message={t('customer.emptyMsg')} />}
        />
      )}
      <FAB icon="plus" style={[styles.fab, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('AddCustomer')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: spacing.md, paddingBottom: 0 },
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
  info: { marginStart: spacing.md, flex: 1 },
  fab: { position: 'absolute', end: spacing.md, bottom: spacing.md },
});
