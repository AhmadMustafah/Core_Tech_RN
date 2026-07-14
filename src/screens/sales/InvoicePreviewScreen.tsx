import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { Text, Divider } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomCard, LoadingState, ErrorState } from '@/components/common';
import { saleService } from '@/services/saleService';
import { useAppTheme } from '@/hooks/useAppTheme';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { APP_NAME } from '@/constants';
import type { Sale } from '@/types';
import type { SalesStackParamList } from '@/types/navigation';
import { spacing } from '@/theme';

type Props = NativeStackScreenProps<SalesStackParamList, 'InvoicePreview'>;

export const InvoicePreviewScreen: React.FC<Props> = ({ route }) => {
  const { saleId } = route.params;
  const { colors } = useAppTheme();
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    saleService.getById(saleId).then(setSale).finally(() => setLoading(false));
  }, [saleId]);

  if (loading) return <LoadingState />;
  if (!sale) return <ErrorState message="Invoice not found" />;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <CustomCard style={styles.invoice}>
        <View style={styles.invoiceHeader}>
          <Text variant="headlineSmall" style={{ color: colors.primary, fontWeight: '700' }}>{APP_NAME}</Text>
          <Text variant="bodySmall" style={{ color: colors.textSecondary }}>Business Management System</Text>
        </View>
        <Divider style={{ marginVertical: spacing.md }} />
        <View style={styles.invoiceMeta}>
          <View><Text style={{ color: colors.textSecondary }}>Invoice</Text><Text style={{ color: colors.text, fontWeight: '600' }}>{sale.invoiceNumber}</Text></View>
          <View style={{ alignItems: 'flex-end' }}><Text style={{ color: colors.textSecondary }}>Date</Text><Text style={{ color: colors.text }}>{formatDate(sale.createdAt)}</Text></View>
        </View>
        <Text variant="titleSmall" style={{ color: colors.text, marginTop: spacing.md }}>Bill To: {sale.customerName}</Text>
        <Divider style={{ marginVertical: spacing.md }} />
        {sale.items.map((item, i) => (
          <View key={i} style={styles.lineItem}>
            <Text style={{ color: colors.text, flex: 1 }}>{item.productName}</Text>
            <Text style={{ color: colors.textSecondary }}>{item.quantity}</Text>
            <Text style={{ color: colors.text, width: 80, textAlign: 'right' }}>{formatCurrency(item.total)}</Text>
          </View>
        ))}
        <Divider style={{ marginVertical: spacing.md }} />
        <View style={styles.totalLine}><Text style={{ color: colors.textSecondary }}>Subtotal</Text><Text style={{ color: colors.text }}>{formatCurrency(sale.subtotal)}</Text></View>
        <View style={styles.totalLine}><Text style={{ color: colors.textSecondary }}>Discount</Text><Text style={{ color: colors.text }}>-{formatCurrency(sale.discount)}</Text></View>
        <View style={styles.totalLine}><Text style={{ color: colors.textSecondary }}>Tax</Text><Text style={{ color: colors.text }}>{formatCurrency(sale.tax)}</Text></View>
        <View style={[styles.totalLine, styles.grandTotal]}><Text variant="titleMedium" style={{ color: colors.text, fontWeight: '700' }}>Total</Text><Text variant="titleMedium" style={{ color: colors.primary, fontWeight: '700' }}>{formatCurrency(sale.totalAmount)}</Text></View>
        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: spacing.lg }}>Payment Status: {sale.paymentStatus}</Text>
      </CustomCard>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.md },
  invoice: { padding: spacing.lg },
  invoiceHeader: { alignItems: 'center' },
  invoiceMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  lineItem: { flexDirection: 'row', paddingVertical: spacing.xs, gap: spacing.sm },
  totalLine: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  grandTotal: { marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: '#eee' },
});
