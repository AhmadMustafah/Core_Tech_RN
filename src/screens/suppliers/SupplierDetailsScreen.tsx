import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomCard, LoadingState, ErrorState } from '@/components/common';
import { supplierService } from '@/services/supplierService';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { formatCurrency, formatDate } from '@/utils/formatters';
import type { Supplier } from '@/types';
import type { ProfileStackParamList } from '@/types/navigation';
import { spacing } from '@/theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'SupplierDetails'>;

export const SupplierDetailsScreen: React.FC<Props> = ({ route }) => {
  const { supplierId } = route.params;
  const { colors } = useAppTheme();
  const { t, language } = useLocalization();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supplierService.getById(supplierId).then(setSupplier).finally(() => setLoading(false));
  }, [supplierId]);

  if (loading) return <LoadingState />;
  if (!supplier) return <ErrorState message="supplier.notFound" />;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <CustomCard>
        <Text variant="headlineSmall" style={{ color: colors.text, fontWeight: '700', padding: spacing.md }}>{supplier.name}</Text>
        <Text style={{ padding: spacing.md, color: colors.text }}>{t('customer.email')}: {supplier.email}</Text>
        <Text style={{ padding: spacing.md, color: colors.text }}>{t('customer.phone')}: {supplier.phone}</Text>
        <Text style={{ padding: spacing.md, color: colors.text }}>{t('customer.company')}: {supplier.company || t('common.na')}</Text>
        <Text style={{ padding: spacing.md, color: colors.text }}>{t('customer.address')}: {supplier.address || t('common.na')}</Text>
        <Text style={{ padding: spacing.md, color: colors.text }}>{t('supplier.totalPurchases')}: {formatCurrency(supplier.totalPurchases || 0)}</Text>
        <Text style={{ padding: spacing.md, color: colors.textSecondary }}>{t('supplier.since')}: {formatDate(supplier.createdAt, language)}</Text>
      </CustomCard>
    </ScrollView>
  );
};

const styles = StyleSheet.create({ container: { flex: 1, padding: spacing.md } });
