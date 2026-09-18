import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomCard, LoadingState, ErrorState } from '@/components/common';
import { customerService } from '@/services/customerService';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { formatCurrency, formatDate } from '@/utils/formatters';
import type { Customer } from '@/types';
import type { ProfileStackParamList } from '@/types/navigation';
import { spacing } from '@/theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'CustomerDetails'>;

export const CustomerDetailsScreen: React.FC<Props> = ({ route }) => {
  const { customerId } = route.params;
  const { colors } = useAppTheme();
  const { t, language } = useLocalization();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    customerService.getById(customerId).then(setCustomer).finally(() => setLoading(false));
  }, [customerId]);

  if (loading) return <LoadingState />;
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
      <CustomCard>
        <Text variant="headlineSmall" style={{ color: colors.text, fontWeight: '700', padding: spacing.md }}>{customer.name}</Text>
      </CustomCard>
      <CustomCard title={t('common.details')}>
        {fields.map(f => (
          <Text key={f.label} style={{ padding: spacing.md, color: colors.text }}>
            <Text style={{ color: colors.textSecondary }}>{f.label}: </Text>{f.value}
          </Text>
        ))}
      </CustomCard>
    </ScrollView>
  );
};

const styles = StyleSheet.create({ container: { flex: 1, padding: spacing.md } });
