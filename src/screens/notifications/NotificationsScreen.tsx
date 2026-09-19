import React, { useState, useCallback } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import { EmptyState, LoadingState } from '@/components/common';
import { notificationService } from '@/services/notificationService';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { formatRelativeTime } from '@/utils/formatters';
import type { AppNotification } from '@/types';
import { NOTIFICATION_BODY_KEYS, NOTIFICATION_TITLE_KEYS } from '@/localization';
import { spacing, borderRadius } from '@/theme';

const getNotificationIcon = (type: AppNotification['type']) => {
  switch (type) {
    case 'sale_completed': return 'cart-check';
    case 'purchase_completed': return 'truck-check';
    case 'low_stock': return 'alert-outline';
    default: return 'clipboard-text-outline';
  }
};

export const NotificationsScreen: React.FC = () => {
  const { colors } = useAppTheme();
  const { t, language } = useLocalization();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { setNotifications(await notificationService.getAll()); }
    finally { setLoading(false); }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const markAsRead = async (id: string) => {
    await notificationService.markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  if (loading && notifications.length === 0) return <LoadingState message="notify.loading" />;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {notifications.some(n => !n.read) && (
        <TouchableOpacity style={styles.markAll} onPress={markAllRead} activeOpacity={0.75}>
          <Text style={{ color: colors.primary, fontWeight: '600' }}>{t('notify.markAll')}</Text>
        </TouchableOpacity>
      )}
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.list, notifications.length === 0 && styles.emptyList]}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.82}
            style={[
              styles.card,
              {
                backgroundColor: item.read ? colors.surface : colors.primary + '08',
                borderColor: colors.border,
              },
            ]}
            onPress={() => !item.read && markAsRead(item.id)}>
            <View style={[styles.iconWrap, { backgroundColor: colors.primaryMuted }]}>
              <Icon name={getNotificationIcon(item.type)} size={22} color={colors.primary} />
            </View>
            <View style={styles.textContent}>
              <View style={styles.titleRow}>
                <Text
                  variant="titleSmall"
                  style={{ color: colors.text, fontWeight: item.read ? '500' : '700', flex: 1 }}
                  numberOfLines={1}>
                  {t(NOTIFICATION_TITLE_KEYS[item.type])}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: (item.read ? colors.textMuted : colors.primary) + '18' },
                  ]}>
                  <Text
                    variant="labelSmall"
                    style={{ color: item.read ? colors.textMuted : colors.primary, fontWeight: '600' }}>
                    {t(item.read ? 'notify.read' : 'notify.unread')}
                  </Text>
                </View>
              </View>
              <Text variant="bodySmall" style={{ color: colors.textSecondary, marginTop: 4 }}>
                {t(NOTIFICATION_BODY_KEYS[item.type])}
              </Text>
              <Text variant="labelSmall" style={{ color: colors.textMuted, marginTop: 6 }}>
                {formatRelativeTime(item.createdAt, language)}
              </Text>
            </View>
            {!item.read && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
          </TouchableOpacity>
        )}
        ListEmptyComponent={<EmptyState icon="bell-off-outline" title={t('notify.empty')} message={t('notify.emptyMsg')} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  markAll: { alignItems: 'flex-end', paddingHorizontal: spacing.md, paddingTop: spacing.md },
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
