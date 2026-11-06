import React, { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomButton, CustomCard, LoadingState, ErrorState } from '@/components/common';
import { supplierService } from '@/services/supplierService';
import { getErrorMessage } from '@/services/api';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { formatCurrency, formatDate } from '@/utils/formatters';
import type { Supplier } from '@/types';
import type { ProfileStackParamList } from '@/types/navigation';
import { spacing } from '@/theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'SupplierDetails'>;

export const SupplierDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { supplierId } = route.params;
  const { colors } = useAppTheme();
  const { t, language } = useLocalization();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setSupplier(await supplierService.getById(supplierId));
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [supplierId]);

  useEffect(() => {
    load();
  }, [load]);

  const onDelete = () => {
    Alert.alert(t('common.delete'), t('common.confirmDelete'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          if (busy) return;
          setBusy(true);
          try {
            await supplierService.delete(supplierId);
            navigation.goBack();
          } catch (err) {
            setError(getErrorMessage(err));
            setBusy(false);
          }
        },
      },
    ]);
  };

  if (loading) return <LoadingState />;
  if (error && !supplier) return <ErrorState message={error} onRetry={load} />;
  if (!supplier) return <ErrorState message="supplier.notFound" />;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {error ? <Text style={{ color: colors.error, marginBottom: spacing.sm }}>{error}</Text> : null}
      <CustomCard>
        <Text variant="headlineSmall" numberOfLines={2} style={{ color: colors.text, fontWeight: '700', padding: spacing.md }}>{supplier.name}</Text>
        <Text numberOfLines={1} style={{ padding: spacing.md, color: colors.text }}>{t('customer.email')}: {supplier.email}</Text>
        <Text numberOfLines={1} style={{ padding: spacing.md, color: colors.text }}>{t('customer.phone')}: {supplier.phone}</Text>
        <Text numberOfLines={2} style={{ padding: spacing.md, color: colors.text }}>{t('customer.company')}: {supplier.company || t('common.na')}</Text>
        <Text numberOfLines={2} style={{ padding: spacing.md, color: colors.text }}>{t('customer.address')}: {supplier.address || t('common.na')}</Text>
        <Text style={{ padding: spacing.md, color: colors.text }}>{t('supplier.totalPurchases')}: {formatCurrency(supplier.totalPurchases || 0)}</Text>
        <Text style={{ padding: spacing.md, color: colors.textSecondary }}>{t('supplier.since')}: {formatDate(supplier.createdAt, language)}</Text>
      </CustomCard>
      <CustomButton title={t('common.edit')} onPress={() => navigation.navigate('EditSupplier', { supplierId })} fullWidth />
      <CustomButton title={t('common.delete')} variant="outline" onPress={onDelete} loading={busy} fullWidth style={{ marginTop: spacing.sm }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({ container: { flex: 1, padding: spacing.md } });
