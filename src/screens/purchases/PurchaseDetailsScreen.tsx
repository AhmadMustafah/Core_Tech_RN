import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { Text, Divider } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomCard, LoadingState, ErrorState } from '@/components/common';
import { purchaseService } from '@/services/purchaseService';
import { useAppTheme } from '@/hooks/useAppTheme';
import { formatCurrency, formatDate } from '@/utils/formatters';
import type { Purchase } from '@/types';
import type { PurchaseStackParamList } from '@/types/navigation';
import { spacing } from '@/theme';

type Props = NativeStackScreenProps<PurchaseStackParamList, 'PurchaseDetails'>;

export const PurchaseDetailsScreen: React.FC<Props> = ({ route }) => {
  const { purchaseId } = route.params;
  const { colors } = useAppTheme();
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    purchaseService.getById(purchaseId).then(setPurchase).finally(() => setLoading(false));
  }, [purchaseId]);

  if (loading) return <LoadingState />;
  if (!purchase) return <ErrorState message="Purchase not found" />;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <CustomCard>
        <Text variant="headlineSmall" style={{ color: colors.text, fontWeight: '700', padding: spacing.md }}>{purchase.purchaseNumber}</Text>
        <Text variant="bodyMedium" style={{ color: colors.textSecondary, paddingHorizontal: spacing.md }}>Supplier: {purchase.supplierName}</Text>
        <Text variant="bodySmall" style={{ color: colors.textSecondary, padding: spacing.md }}>{formatDate(purchase.createdAt)}</Text>
      </CustomCard>
      <CustomCard title="Items">
        {purchase.items.map((item, i) => (
          <Text key={i} style={{ padding: spacing.md, color: colors.text }}>
            {item.productName} - {item.quantity} x {formatCurrency(item.purchasePrice)} = {formatCurrency(item.total)}
          </Text>
        ))}
        <Divider style={{ margin: spacing.md }} />
        <Text variant="titleMedium" style={{ color: colors.secondary, fontWeight: '700', padding: spacing.md, textAlign: 'right' }}>
          Total: {formatCurrency(purchase.totalAmount)}
        </Text>
      </CustomCard>
    </ScrollView>
  );
};

const styles = StyleSheet.create({ container: { flex: 1, padding: spacing.md } });
