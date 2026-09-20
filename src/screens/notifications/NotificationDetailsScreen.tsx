import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { NavigationProp } from '@react-navigation/native';
import { CustomButton, CustomCard, DetailRow, ErrorState, LoadingState, InitialsAvatar } from '@/components/common';
import { notificationService } from '@/services/notificationService';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { openRelatedRecord } from '@/utils/relatedNavigation';
import type { AppNotification } from '@/types';
import type {
  DashboardStackParamList,
  MainTabParamList,
  ProfileStackParamList,
} from '@/types/navigation';
import { NOTIFICATION_BODY_KEYS, NOTIFICATION_TITLE_KEYS, PAYMENT_STATUS_KEYS } from '@/localization';
import { borderRadius, spacing } from '@/theme';
import { getNotificationColor, getNotificationIcon, getNotificationPersonName } from './notifyMeta';

type Props = NativeStackScreenProps<
  DashboardStackParamList & ProfileStackParamList,
  'NotificationDetails'
>;

export const NotificationDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { notificationId } = route.params;
  const tabNavigation = navigation.getParent<NavigationProp<MainTabParamList>>();
  const { colors } = useAppTheme();
  const { t, language } = useLocalization();
  const [item, setItem] = useState<AppNotification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationService
      .getById(notificationId)
      .then(async notification => {
        if (!notification.read) {
          await notificationService.markAsRead(notificationId);
        }
        setItem({ ...notification, read: true });
      })
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  }, [notificationId]);

  if (loading) return <LoadingState message="notify.loading" />;
  if (!item) return <ErrorState message="notify.notFound" />;

  const accent = getNotificationColor(item.type, colors);
  const details = item.details;
  const personName = getNotificationPersonName(item);
  const statusLabel =
    details?.status && details.status in PAYMENT_STATUS_KEYS
      ? t(PAYMENT_STATUS_KEYS[details.status as keyof typeof PAYMENT_STATUS_KEYS])
      : details?.status;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}>
      <CustomCard>
        <View style={styles.hero}>
          {personName ? (
            <InitialsAvatar size={52} name={personName} backgroundColor={accent} />
          ) : (
            <View style={[styles.iconWrap, { backgroundColor: accent + '18' }]}>
              <Icon name={getNotificationIcon(item.type)} size={28} color={accent} />
            </View>
          )}
          <View style={styles.heroText}>
            <Text variant="titleLarge" style={{ color: colors.text, fontWeight: '700' }}>
              {t(NOTIFICATION_TITLE_KEYS[item.type])}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: colors.primaryMuted }]}>
              <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 12 }}>
                {t(item.read ? 'notify.read' : 'notify.unread')}
              </Text>
            </View>
          </View>
        </View>
      </CustomCard>

      <CustomCard title={t('notify.details')}>
        <DetailRow label={t('notify.type')} value={t(NOTIFICATION_TITLE_KEYS[item.type])} />
        <DetailRow label={t('notify.dateTime')} value={formatDateTime(item.createdAt, language)} />
        <DetailRow label={t('notify.status')} value={t(item.read ? 'notify.read' : 'notify.unread')} last={!details} />
        {details?.productName ? (
          <DetailRow label={t('dash.alert.party')} value={details.productName} />
        ) : null}
        {details?.sku ? <DetailRow label={t('dash.alert.sku')} value={details.sku} /> : null}
        {details?.quantity != null ? (
          <DetailRow label={t('dash.alert.qty')} value={String(details.quantity)} />
        ) : null}
        {details?.threshold != null ? (
          <DetailRow label={t('dash.alert.threshold')} value={String(details.threshold)} />
        ) : null}
        {details?.reference ? (
          <DetailRow label={t('dash.alert.reference')} value={details.reference} />
        ) : null}
        {details?.partyName ? (
          <DetailRow label={t('dash.alert.party')} value={details.partyName} />
        ) : null}
        {details?.amount != null ? (
          <DetailRow label={t('dash.alert.amount')} value={formatCurrency(details.amount)} emphasize />
        ) : null}
        {statusLabel ? <DetailRow label={t('dash.alert.status')} value={statusLabel} last /> : null}
      </CustomCard>

      <CustomCard>
        <Text variant="bodyMedium" style={{ color: colors.text, padding: spacing.md, lineHeight: 22 }}>
          {item.message || t(NOTIFICATION_BODY_KEYS[item.type])}
        </Text>
      </CustomCard>

      {item.relatedType && item.relatedId ? (
        <CustomButton
          title={t('notify.openRelated')}
          onPress={() =>
            openRelatedRecord(tabNavigation, {
              relatedType: item.relatedType,
              relatedId: item.relatedId,
            })
          }
          fullWidth
          style={styles.action}
        />
      ) : null}
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
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroText: { flex: 1, minWidth: 0, gap: spacing.sm },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  action: { marginTop: spacing.xs },
});
