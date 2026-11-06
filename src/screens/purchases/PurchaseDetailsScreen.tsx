import React, { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, ScrollView } from 'react-native';
import { Text, Divider } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomButton, CustomCard, LoadingState, ErrorState } from '@/components/common';
import { purchaseService } from '@/services/purchaseService';
import { useAppDispatch } from '@/redux/hooks';
import { markAppDataStale } from '@/redux/slices/dataSyncSlice';
import { getErrorMessage } from '@/services/api';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { formatCurrency, formatDate } from '@/utils/formatters';
import type { Purchase } from '@/types';
import type { MainShellParamList, PurchaseStackParamList } from '@/types/navigation';
import { spacing } from '@/theme';

type Props = NativeStackScreenProps<
  PurchaseStackParamList & Pick<MainShellParamList, 'PurchaseDetails'>,
  'PurchaseDetails'
>;

export const PurchaseDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const purchaseId = route.params?.purchaseId;
  const { colors } = useAppTheme();
  const { t, language } = useLocalization();
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!purchaseId) {
      setPurchase(null);
      setError('purchase.notFound');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setPurchase(await purchaseService.getById(purchaseId));
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [purchaseId]);

  useEffect(() => {
    load();
  }, [load]);

  const receive = async () => {
    if (busy) return;
    setBusy(true);
    try {
      setPurchase(await purchaseService.receive(purchaseId));
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
            await purchaseService.delete(purchaseId);
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
  if (error && !purchase) return <ErrorState message={error} onRetry={load} />;
  if (!purchase) return <ErrorState message="purchase.notFound" />;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {error ? <Text style={{ color: colors.error, marginBottom: spacing.sm }}>{error}</Text> : null}
      <CustomCard>
        <Text variant="headlineSmall" numberOfLines={1} style={{ color: colors.text, fontWeight: '700', padding: spacing.md }}>{purchase.purchaseNumber}</Text>
        <Text variant="bodyMedium" numberOfLines={1} style={{ color: colors.textSecondary, paddingHorizontal: spacing.md }}>{t('purchase.supplier')}: {purchase.supplierName}</Text>
        <Text variant="bodySmall" style={{ color: colors.textSecondary, padding: spacing.md }}>
          {t('purchase.status')}: {purchase.status === 'received' ? t('purchase.received') : t('purchase.pending')} · {formatDate(purchase.createdAt, language)}
        </Text>
      </CustomCard>
      <CustomCard title={t('common.items')}>
        {purchase.items.map((item, i) => (
          <Text key={i} numberOfLines={2} style={{ padding: spacing.md, color: colors.text }}>
            {item.productName} - {item.quantity} x {formatCurrency(item.purchasePrice)} = {formatCurrency(item.total)}
          </Text>
        ))}
        <Divider style={{ margin: spacing.md }} />
        <Text variant="titleMedium" style={{ color: colors.secondary, fontWeight: '700', padding: spacing.md, textAlign: 'right', writingDirection: 'ltr' }}>
          {t('common.total')}: {formatCurrency(purchase.totalAmount)}
        </Text>
      </CustomCard>
      {purchase.status === 'pending' ? (
        <CustomButton title={t('purchase.receive')} onPress={receive} loading={busy} fullWidth />
      ) : null}
      <CustomButton title={t('common.delete')} variant="outline" onPress={onDelete} loading={busy} fullWidth style={{ marginTop: spacing.sm }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({ container: { flex: 1, padding: spacing.md } });
