import React, { useState, useCallback } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, FAB, Avatar } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SearchBar, EmptyState, LoadingState, ErrorState } from '@/components/common';
import { customerService } from '@/services/customerService';
import { useAppTheme } from '@/hooks/useAppTheme';
import { getInitials } from '@/utils/formatters';
import type { Customer } from '@/types';
import type { ProfileStackParamList } from '@/types/navigation';
import { spacing, borderRadius } from '@/theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'CustomerList'>;

export const CustomerListScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useAppTheme();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { setCustomers(await customerService.getAll(search)); }
    catch (err) { setError(err instanceof Error ? err.message : 'Failed to load'); }
    finally { setLoading(false); }
  }, [search]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}><SearchBar value={search} onChangeText={setSearch} placeholder="Search customers..." /></View>
      {error ? <ErrorState message={error} onRetry={load} /> : (
        <FlatList data={customers} keyExtractor={i => i.id} contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
          renderItem={({ item }) => (
            <TouchableOpacity style={[styles.card, { backgroundColor: colors.surface }]}
              onPress={() => navigation.navigate('CustomerDetails', { customerId: item.id })}>
              <Avatar.Text size={44} label={getInitials(item.name)} style={{ backgroundColor: colors.primary }} />
              <View style={styles.info}>
                <Text variant="titleSmall" style={{ color: colors.text, fontWeight: '600' }}>{item.name}</Text>
                <Text variant="bodySmall" style={{ color: colors.textSecondary }}>{item.email}</Text>
                <Text variant="bodySmall" style={{ color: colors.textSecondary }}>{item.phone}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<EmptyState icon="account-group-outline" title="No Customers" message="Add your first customer" />}
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
  card: { flexDirection: 'row', padding: spacing.md, borderRadius: borderRadius.md, marginBottom: spacing.sm, alignItems: 'center', elevation: 1 },
  info: { marginLeft: spacing.md, flex: 1 },
  fab: { position: 'absolute', right: spacing.md, bottom: spacing.md },
});
