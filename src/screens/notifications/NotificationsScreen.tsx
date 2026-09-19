import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { EmptyState, LoadingState } from '@/components/common';
import { notificationService } from '@/services/notificationService';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { formatRelativeTime } from '@/utils/formatters';
import type { AppNotification } from '@/types';
import type { DashboardStackParamList, ProfileStackParamList } from '@/types/navigation';
import { NOTIFICATION_BODY_KEYS, NOTIFICATION_TITLE_KEYS } from '@/localization';
import { borderRadius, spacing } from '@/theme';
import { getNotificationColor, getNotificationIcon } from './notifyMeta';

type NotifyNav = NavigationProp<DashboardStackParamList & ProfileStackParamList>;

export const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<NotifyNav>();
  const { colors } = useAppTheme();
  const { t, language } = useLocalization();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setNotifications(await notificationService.getAll());
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const markAllRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const openDetails = async (item: AppNotification) => {
    if (!item.read) {
      await notificationService.markAsRead(item.id);
    }
    navigation.navigate('NotificationDetails', { notificationId: item.id });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading && notifications.length === 0) {
    return <LoadingState message="notify.loading" />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {notifications.length > 0 ? (
        <View style={styles.toolbar}>
          <Text style={{ color: colors.textSecondary }}>
            {unreadCount > 0 ? t('notify.unreadCount', { count: unreadCount }) : t('notify.read')}
          </Text>
          {unreadCount > 0 ? (
            <TouchableOpacity onPress={markAllRead} activeOpacity={0.75}>
              <Text style={{ color: colors.primary, fontWeight: '600' }}>{t('notify.markAll')}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.list, notifications.length === 0 && styles.emptyList]}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        renderItem={({ item }) => {
          const accent = getNotificationColor(item.type, colors);
          return (
            <TouchableOpacity
              activeOpacity={0.82}
              style={[
                styles.card,
                {
                  backgroundColor: item.read ? colors.surface : colors.primary + '08',
                  borderColor: item.read ? colors.border : colors.primary + '44',
                },
              ]}
              onPress={() => openDetails(item)}>
              <View style={[styles.iconWrap, { backgroundColor: accent + '18' }]}>
                <Icon name={getNotificationIcon(item.type)} size={22} color={accent} />
              </View>
              <View style={styles.textContent}>
                <View style={styles.titleRow}>
                  <Text
                    variant="titleSmall"
                    style={{ color: colors.text, fontWeight: item.read ? '500' : '700', flex: 1 }}
                    numberOfLines={1}>
                    {t(NOTIFICATION_TITLE_KEYS[item.type])}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: (item.read ? colors.textMuted : colors.primary) + '18' }]}>
                    <Text
                      variant="labelSmall"
                      style={{ color: item.read ? colors.textMuted : colors.primary, fontWeight: '600' }}>
                      {t(item.read ? 'notify.read' : 'notify.unread')}
                    </Text>
                  </View>
                </View>
                <Text variant="bodySmall" style={{ color: colors.textSecondary, marginTop: 4 }} numberOfLines={2}>
                  {item.message || t(NOTIFICATION_BODY_KEYS[item.type])}
                </Text>
                {item.details?.reference || item.details?.productName ? (
                  <Text variant="labelSmall" style={{ color: colors.textMuted, marginTop: 4 }} numberOfLines={1}>
                    {item.details.reference || item.details.productName}
                    {item.details.quantity != null
                      ? ` · ${item.details.quantity}/${item.details.threshold ?? '-'}`
                      : ''}
                  </Text>
                ) : null}
                <Text variant="labelSmall" style={{ color: colors.textMuted, marginTop: 6 }}>
                  {formatRelativeTime(item.createdAt, language)}
                </Text>
              </View>
              {!item.read ? <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} /> : null}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <EmptyState icon="bell-off-outline" title={t('notify.empty')} message={t('notify.emptyMsg')} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  list: { padding: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.xxl },
  emptyList: { flexGrow: 1 },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm + 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContent: { flex: 1, minWidth: 0 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    flexShrink: 0,
  },
  unreadDot: { width: 8, height: 8, borderRadius: 4, marginTop: 8 },
});
