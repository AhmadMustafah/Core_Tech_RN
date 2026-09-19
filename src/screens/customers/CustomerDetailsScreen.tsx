import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Avatar, Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomButton, CustomCard, DetailRow, ErrorState, LoadingState } from '@/components/common';
import { customerService } from '@/services/customerService';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { formatCurrency, formatDate, getInitials } from '@/utils/formatters';
import type { Customer } from '@/types';
import type { ProfileStackParamList } from '@/types/navigation';
import { borderRadius, spacing } from '@/theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'CustomerDetails'>;

export const CustomerDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
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

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}>
      <CustomCard>
        <View style={styles.hero}>
          <Avatar.Text
            size={56}
            label={getInitials(customer.name)}
            style={{ backgroundColor: colors.primary }}
          />
          <View style={styles.heroText}>
            <Text variant="headlineSmall" style={{ color: colors.text, fontWeight: '700' }}>
              {customer.name}
            </Text>
            <Text variant="bodyMedium" style={{ color: colors.textSecondary, marginTop: 4 }}>
              {customer.company || t('common.na')}
            </Text>
          </View>
        </View>
      </CustomCard>

      <CustomCard title={t('customer.contact')}>
        <DetailRow label={t('customer.contactPerson')} value={customer.name} />
        <DetailRow label={t('customer.email')} value={customer.email} />
        <DetailRow label={t('customer.phone')} value={customer.phone} last />
      </CustomCard>

      <CustomCard title={t('customer.business')}>
        <DetailRow label={t('customer.company')} value={customer.company || t('common.na')} />
        <DetailRow label={t('customer.address')} value={customer.address || t('common.na')} last />
      </CustomCard>

      <CustomCard title={t('customer.activity')}>
        <DetailRow
          label={t('customer.totalPurchases')}
          value={formatCurrency(customer.totalPurchases || 0)}
          emphasize
        />
        <DetailRow label={t('customer.memberSince')} value={formatDate(customer.createdAt, language)} last />
      </CustomCard>

      <CustomButton
        title={t('customer.editRecord')}
        onPress={() => navigation.navigate('EditCustomer', { customerId: customer.id })}
        fullWidth
        style={styles.editButton}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
  },
  heroText: {
    flex: 1,
    minWidth: 0,
  },
  editButton: {
    marginTop: spacing.xs,
    borderRadius: borderRadius.md,
  },
});
