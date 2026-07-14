import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomCard, LoadingState, ErrorState } from '@/components/common';
import { supplierService } from '@/services/supplierService';
import { useAppTheme } from '@/hooks/useAppTheme';
import { formatCurrency, formatDate } from '@/utils/formatters';
import type { Supplier } from '@/types';
import type { ProfileStackParamList } from '@/types/navigation';
import { spacing } from '@/theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'SupplierDetails'>;

export const SupplierDetailsScreen: React.FC<Props> = ({ route }) => {
  const { supplierId } = route.params;
  const { colors } = useAppTheme();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supplierService.getById(supplierId).then(setSupplier).finally(() => setLoading(false));
  }, [supplierId]);

  if (loading) return <LoadingState />;
  if (!supplier) return <ErrorState message="Supplier not found" />;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <CustomCard>
        <Text variant="headlineSmall" style={{ color: colors.text, fontWeight: '700', padding: spacing.md }}>{supplier.name}</Text>
        <Text style={{ padding: spacing.md, color: colors.text }}>Email: {supplier.email}</Text>
        <Text style={{ padding: spacing.md, color: colors.text }}>Phone: {supplier.phone}</Text>
        <Text style={{ padding: spacing.md, color: colors.text }}>Company: {supplier.company || 'N/A'}</Text>
        <Text style={{ padding: spacing.md, color: colors.text }}>Address: {supplier.address || 'N/A'}</Text>
        <Text style={{ padding: spacing.md, color: colors.text }}>Total Purchases: {formatCurrency(supplier.totalPurchases || 0)}</Text>
        <Text style={{ padding: spacing.md, color: colors.textSecondary }}>Since: {formatDate(supplier.createdAt)}</Text>
      </CustomCard>
    </ScrollView>
  );
};

const styles = StyleSheet.create({ container: { flex: 1, padding: spacing.md } });
