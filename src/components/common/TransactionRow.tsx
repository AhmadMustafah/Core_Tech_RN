import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { formatCurrency, formatRelativeTime } from '@/utils/formatters';
import type { LedgerTransaction } from '@/services/transactionService';
import type { TranslationKey } from '@/localization';
import { borderRadius, spacing } from '@/theme';

type Props = {
  item: LedgerTransaction;
  onPress: () => void;
  showDivider?: boolean;
};

const ICONS: Record<LedgerTransaction['type'], string> = {
  Sale: 'cart-check',
  Purchase: 'truck-delivery',
};

const statusKey = (status: LedgerTransaction['status']): TranslationKey => {
  switch (status) {
    case 'paid':
      return 'status.paid';
    case 'partial':
      return 'status.partial';
    case 'received':
      return 'purchase.received';
    case 'cancelled':
      return 'tx.cancelled';
    default:
      return 'status.pending';
  }
};

export const TransactionRow: React.FC<Props> = ({ item, onPress, showDivider = false }) => {
  const { colors } = useAppTheme();
  const { t, language } = useLocalization();
  const isSale = item.type === 'Sale';
  const accent = isSale ? colors.primary : colors.secondary;
  const statusColor =
    item.status === 'paid' || item.status === 'received'
      ? colors.success
      : item.status === 'pending'
        ? colors.warning
        : item.status === 'cancelled'
          ? colors.error
          : colors.info;

  return (
    <TouchableOpacity
      activeOpacity={0.72}
      onPress={onPress}
      style={[
        styles.row,
        showDivider && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderLight },
      ]}>
      <View style={[styles.icon, { backgroundColor: accent + '18' }]}>
        <Icon source={ICONS[item.type]} size={20} color={accent} />
      </View>
      <View style={styles.body}>
        <Text variant="titleSmall" numberOfLines={1} style={{ color: colors.text, fontWeight: '700' }}>
          {item.ref || t(isSale ? 'dash.type.sale' : 'dash.type.purchase')}
        </Text>
        <Text variant="bodySmall" numberOfLines={1} style={{ color: colors.textSecondary, marginTop: 2 }}>
          {t(isSale ? 'dash.type.sale' : 'dash.type.purchase')}
          {item.party ? ` · ${item.party}` : ''}
        </Text>
        <View style={styles.footer}>
          <View style={[styles.badge, { backgroundColor: statusColor + '18' }]}>
            <Text variant="labelSmall" style={{ color: statusColor, fontWeight: '600' }}>
              {t(statusKey(item.status))}
            </Text>
          </View>
          <Text variant="labelSmall" style={{ color: colors.textSecondary }}>
            {formatRelativeTime(item.timestamp, language)}
          </Text>
        </View>
      </View>
      <Text
        variant="titleSmall"
        numberOfLines={1}
        style={[styles.amount, { color: accent }]}>
        {formatCurrency(item.amount)}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  amount: {
    fontWeight: '700',
    flexShrink: 0,
    maxWidth: 118,
    textAlign: 'right',
    writingDirection: 'ltr',
  },
});
