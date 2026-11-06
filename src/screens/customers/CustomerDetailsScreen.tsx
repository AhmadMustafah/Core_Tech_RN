import React, { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomButton, CustomCard, LoadingState, ErrorState } from '@/components/common';
import { customerService } from '@/services/customerService';
import { getErrorMessage } from '@/services/api';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { formatCurrency, formatDate } from '@/utils/formatters';
import type { Customer } from '@/types';
import type { ProfileStackParamList } from '@/types/navigation';
import { spacing } from '@/theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'CustomerDetails'>;

export const CustomerDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { customerId } = route.params;
  const { colors } = useAppTheme();
  const { t, language } = useLocalization();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setCustomer(await customerService.getById(customerId));
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [customerId]);

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
            await customerService.delete(customerId);
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
  if (error && !customer) return <ErrorState message={error} onRetry={load} />;
  if (!customer) return <ErrorState message="customer.notFound" />;

  const fields = [
    { label: t('customer.email'), value: customer.email },
    { label: t('customer.phone'), value: customer.phone },
    { label: t('customer.company'), value: customer.company || t('common.na') },
    { label: t('customer.address'), value: customer.address || t('common.na') },
    { label: t('customer.totalPurchases'), value: formatCurrency(customer.totalPurchases || 0) },
    { label: t('customer.memberSince'), value: formatDate(customer.createdAt, language) },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {error ? <Text style={{ color: colors.error, marginBottom: spacing.sm }}>{error}</Text> : null}
      <CustomCard>
        <Text variant="headlineSmall" numberOfLines={2} style={{ color: colors.text, fontWeight: '700', padding: spacing.md }}>{customer.name}</Text>
      </CustomCard>
      <CustomCard title={t('common.details')}>
        {fields.map(f => (
          <Text key={f.label} numberOfLines={2} style={{ padding: spacing.md, color: colors.text }}>
            <Text style={{ color: colors.textSecondary }}>{f.label}: </Text>{f.value}
          </Text>
        ))}
      </CustomCard>
      <CustomButton title={t('common.edit')} onPress={() => navigation.navigate('EditCustomer', { customerId })} fullWidth />
      <CustomButton title={t('common.delete')} variant="outline" onPress={onDelete} loading={busy} fullWidth style={{ marginTop: spacing.sm }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({ container: { flex: 1, padding: spacing.md } });
