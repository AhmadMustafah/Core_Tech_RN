import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomCard, DetailRow, ErrorState, LoadingState } from '@/components/common';
import { purchaseService } from '@/services/purchaseService';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { formatCurrency, formatDate } from '@/utils/formatters';
import type { Purchase } from '@/types';
import type { PurchaseStackParamList } from '@/types/navigation';
import { spacing } from '@/theme';

type Props = NativeStackScreenProps<PurchaseStackParamList, 'PurchaseDetails'>;

export const PurchaseDetailsScreen: React.FC<Props> = ({ route }) => {
  const { purchaseId } = route.params;
  const { colors } = useAppTheme();
  const { t, language } = useLocalization();
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    purchaseService.getById(purchaseId).then(setPurchase).finally(() => setLoading(false));
  }, [purchaseId]);

  if (loading) return <LoadingState />;
  if (!purchase) return <ErrorState message="purchase.notFound" />;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}>
      <CustomCard>
        <View style={styles.header}>
          <Text variant="headlineSmall" style={{ color: colors.text, fontWeight: '700' }}>
            {purchase.purchaseNumber}
          </Text>
          <Text variant="bodyMedium" style={{ color: colors.textSecondary, marginTop: spacing.xs }}>
            {t('purchase.supplier')}: {purchase.supplierName}
          </Text>
          <Text variant="bodySmall" style={{ color: colors.textMuted, marginTop: 4 }}>
            {formatDate(purchase.createdAt, language)}
          </Text>
        </View>
      </CustomCard>
      <CustomCard title={t('common.items')}>
        {purchase.items.map((item, i) => (
          <DetailRow
            key={`${item.productId}-${i}`}
            label={`${item.productName} · ${item.quantity} × ${formatCurrency(item.purchasePrice)}`}
            value={formatCurrency(item.total)}
            last={i === purchase.items.length - 1}
          />
        ))}
      </CustomCard>
      <CustomCard title={t('common.details')}>
        <DetailRow
          label={t('common.total')}
          value={formatCurrency(purchase.totalAmount)}
          emphasize
          last
        />
      </CustomCard>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  header: { padding: spacing.md },
});
