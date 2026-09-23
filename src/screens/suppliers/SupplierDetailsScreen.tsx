import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomButton, CustomCard, DetailRow, ErrorState, LoadingState, InitialsAvatar } from '@/components/common';
import { supplierService } from '@/services/supplierService';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { formatCurrency, formatDate } from '@/utils/formatters';
import type { Supplier } from '@/types';
import type { ProfileStackParamList } from '@/types/navigation';
import { borderRadius, spacing } from '@/theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'SupplierDetails'>;

export const SupplierDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
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
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}>
      <CustomCard>
        <View style={styles.hero}>
          <InitialsAvatar size={56} name={supplier.name} />
          <View style={styles.heroText}>
            <Text variant="headlineSmall" style={{ color: colors.text, fontWeight: '700' }}>
              {supplier.name}
            </Text>
            <Text variant="bodyMedium" style={{ color: colors.textSecondary, marginTop: 4 }}>
              {supplier.company || t('common.na')}
            </Text>
          </View>
        </View>
      </CustomCard>

      <CustomCard title={t('supplier.contact')}>
        <DetailRow label={t('supplier.contactPerson')} value={supplier.name} />
        <DetailRow label={t('customer.email')} value={supplier.email} />
        <DetailRow label={t('customer.phone')} value={supplier.phone} last />
      </CustomCard>

      <CustomCard title={t('supplier.business')}>
        <DetailRow label={t('customer.company')} value={supplier.company || t('common.na')} />
        <DetailRow label={t('customer.address')} value={supplier.address || t('common.na')} last />
      </CustomCard>

      <CustomCard title={t('supplier.activity')}>
        <DetailRow
          label={t('supplier.totalPurchases')}
          value={formatCurrency(supplier.totalPurchases || 0)}
          emphasize
        />
        <DetailRow label={t('supplier.since')} value={formatDate(supplier.createdAt, language)} last />
      </CustomCard>

      <CustomButton
        title={t('supplier.editRecord')}
        onPress={() => navigation.navigate('EditSupplier', { supplierId: supplier.id })}
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
