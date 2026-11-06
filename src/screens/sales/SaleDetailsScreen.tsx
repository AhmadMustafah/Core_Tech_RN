import React, { useState, useEffect, useCallback } from 'react';
import { Alert, StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import { Text, Chip, Divider } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomCard, CustomButton, LoadingState, ErrorState } from '@/components/common';
import { saleService } from '@/services/saleService';
import { useAppDispatch } from '@/redux/hooks';
import { markAppDataStale } from '@/redux/slices/dataSyncSlice';
import { getErrorMessage } from '@/services/api';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { formatCurrency, formatDate } from '@/utils/formatters';
import type { Sale } from '@/types';
import type { MainShellParamList, SalesStackParamList } from '@/types/navigation';
import { PAYMENT_STATUS_KEYS } from '@/localization';
import { spacing } from '@/theme';

type Props = NativeStackScreenProps<
  SalesStackParamList & Pick<MainShellParamList, 'SaleDetails'>,
  'SaleDetails'
>;

const STATUSES: Sale['paymentStatus'][] = ['paid', 'pending', 'partial'];

export const SaleDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const saleId = route.params?.saleId;
  const { colors } = useAppTheme();
  const { t, language } = useLocalization();
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!saleId) {
      setSale(null);
      setError('sale.notFound');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setSale(await saleService.getById(saleId));
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [saleId]);

  useEffect(() => {
    load();
  }, [load]);

  const updatePayment = async (paymentStatus: Sale['paymentStatus']) => {
    if (busy || !sale || paymentStatus === sale.paymentStatus) return;
    setBusy(true);
    try {
      setSale(await saleService.updatePayment(saleId, paymentStatus));
      dispatch(markAppDataStale());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

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
            await saleService.delete(saleId);
            dispatch(markAppDataStale());
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
  if (error && !sale) return <ErrorState message={error} onRetry={load} />;
  if (!sale) return <ErrorState message="sale.notFound" />;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {error ? <Text style={{ color: colors.error, margin: spacing.md }}>{error}</Text> : null}
      <CustomCard>
        <View style={styles.header}>
          <Text variant="headlineSmall" numberOfLines={1} style={{ color: colors.text, fontWeight: '700' }}>{sale.invoiceNumber}</Text>
          <Chip style={{ alignSelf: 'flex-start', marginTop: spacing.sm }}>{t(PAYMENT_STATUS_KEYS[sale.paymentStatus])}</Chip>
          <Text variant="bodyMedium" numberOfLines={1} style={{ color: colors.textSecondary, marginTop: spacing.sm }}>
            {t('sale.customer')}: {sale.customerName}
          </Text>
          <Text variant="bodySmall" style={{ color: colors.textSecondary }}>{formatDate(sale.createdAt, language)}</Text>
        </View>
      </CustomCard>

      <CustomCard title={t('common.items')}>
        {sale.items.map((item, index) => (
          <View key={index} style={[styles.item, { borderBottomColor: colors.border }]}>
            <Text variant="bodyMedium" numberOfLines={1} style={{ color: colors.text, fontWeight: '600' }}>{item.productName}</Text>
            <Text variant="bodySmall" style={{ color: colors.textSecondary }}>
              {item.quantity} x {formatCurrency(item.price)} = {formatCurrency(item.quantity * item.price)}
            </Text>
          </View>
        ))}
        <Divider style={{ marginVertical: spacing.md }} />
        <View style={styles.totalRow}><Text style={{ color: colors.textSecondary }}>{t('common.subtotal')}</Text><Text style={{ color: colors.text }}>{formatCurrency(sale.subtotal)}</Text></View>
        <View style={styles.totalRow}><Text style={{ color: colors.textSecondary }}>{t('common.discount')}</Text><Text style={{ color: colors.text }}>-{formatCurrency(sale.discount)}</Text></View>
        <View style={styles.totalRow}><Text style={{ color: colors.textSecondary }}>{t('common.tax')}</Text><Text style={{ color: colors.text }}>{formatCurrency(sale.tax)}</Text></View>
        <View style={[styles.totalRow, styles.grandTotal, { borderTopColor: colors.border }]}><Text variant="titleMedium" style={{ color: colors.text, fontWeight: '700' }}>{t('common.total')}</Text><Text variant="titleMedium" style={{ color: colors.primary, fontWeight: '700' }}>{formatCurrency(sale.totalAmount)}</Text></View>
      </CustomCard>

      <View style={styles.paymentRow}>
        {STATUSES.map(status => (
          <TouchableOpacity
            key={status}
            onPress={() => updatePayment(status)}
            style={[
              styles.paymentChip,
              { backgroundColor: sale.paymentStatus === status ? colors.primary : colors.surfaceVariant },
            ]}>
            <Text style={{ color: sale.paymentStatus === status ? colors.onPrimary : colors.text }}>
              {t(PAYMENT_STATUS_KEYS[status])}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <CustomButton title={t('sale.viewInvoice')} onPress={() => navigation.navigate('InvoicePreview', { saleId })} fullWidth style={{ marginHorizontal: spacing.md }} />
      <CustomButton title={t('common.delete')} variant="outline" onPress={onDelete} loading={busy} fullWidth style={{ margin: spacing.md }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: spacing.md },
  item: { padding: spacing.md, borderBottomWidth: 1 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  grandTotal: { marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1 },
  paymentRow: { flexDirection: 'row', gap: spacing.sm, marginHorizontal: spacing.md, marginBottom: spacing.md },
  paymentChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 20 },
});
