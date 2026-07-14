import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { Text, Chip, Divider } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomCard, CustomButton, LoadingState, ErrorState } from '@/components/common';
import { saleService } from '@/services/saleService';
import { useAppTheme } from '@/hooks/useAppTheme';
import { formatCurrency, formatDate } from '@/utils/formatters';
import type { Sale } from '@/types';
import type { SalesStackParamList } from '@/types/navigation';
import { spacing } from '@/theme';

type Props = NativeStackScreenProps<SalesStackParamList, 'SaleDetails'>;

export const SaleDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { saleId } = route.params;
  const { colors } = useAppTheme();
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    saleService.getById(saleId).then(setSale).catch(err => setError(err.message)).finally(() => setLoading(false));
  }, [saleId]);

  if (loading) return <LoadingState />;
  if (error || !sale) return <ErrorState message={error || 'Sale not found'} />;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <CustomCard>
        <View style={styles.header}>
          <Text variant="headlineSmall" style={{ color: colors.text, fontWeight: '700' }}>{sale.invoiceNumber}</Text>
          <Chip style={{ alignSelf: 'flex-start', marginTop: spacing.sm }}>{sale.paymentStatus}</Chip>
          <Text variant="bodyMedium" style={{ color: colors.textSecondary, marginTop: spacing.sm }}>
            Customer: {sale.customerName}
          </Text>
          <Text variant="bodySmall" style={{ color: colors.textSecondary }}>{formatDate(sale.createdAt)}</Text>
        </View>
      </CustomCard>

      <CustomCard title="Items">
        {sale.items.map((item, index) => (
          <View key={index} style={[styles.item, { borderBottomColor: colors.border }]}>
            <Text variant="bodyMedium" style={{ color: colors.text, fontWeight: '600' }}>{item.productName}</Text>
            <Text variant="bodySmall" style={{ color: colors.textSecondary }}>
              {item.quantity} x {formatCurrency(item.price)} = {formatCurrency(item.quantity * item.price)}
            </Text>
          </View>
        ))}
        <Divider style={{ marginVertical: spacing.md }} />
        <View style={styles.totalRow}><Text style={{ color: colors.textSecondary }}>Subtotal</Text><Text style={{ color: colors.text }}>{formatCurrency(sale.subtotal)}</Text></View>
        <View style={styles.totalRow}><Text style={{ color: colors.textSecondary }}>Discount</Text><Text style={{ color: colors.text }}>-{formatCurrency(sale.discount)}</Text></View>
        <View style={styles.totalRow}><Text style={{ color: colors.textSecondary }}>Tax</Text><Text style={{ color: colors.text }}>{formatCurrency(sale.tax)}</Text></View>
        <View style={[styles.totalRow, styles.grandTotal]}><Text variant="titleMedium" style={{ color: colors.text, fontWeight: '700' }}>Total</Text><Text variant="titleMedium" style={{ color: colors.primary, fontWeight: '700' }}>{formatCurrency(sale.totalAmount)}</Text></View>
      </CustomCard>

      <CustomButton title="View Invoice" onPress={() => navigation.navigate('InvoicePreview', { saleId })} fullWidth style={{ margin: spacing.md }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: spacing.md },
  item: { padding: spacing.md, borderBottomWidth: 1 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  grandTotal: { marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: '#eee' },
});
