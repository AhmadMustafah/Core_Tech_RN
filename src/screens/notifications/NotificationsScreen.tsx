import React, { useState, useCallback } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { EmptyState, LoadingState } from '@/components/common';
import { notificationService } from '@/services/notificationService';
import { useAppTheme } from '@/hooks/useAppTheme';
import { formatRelativeTime } from '@/utils/formatters';
import type { AppNotification } from '@/types';
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

  if (loading && notifications.length === 0) return <LoadingState message="Loading notifications..." />;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {notifications.some(n => !n.read) && (
        <TouchableOpacity style={styles.markAll} onPress={markAllRead}>
          <Text style={{ color: colors.primary, fontWeight: '600' }}>Mark all as read</Text>
        </TouchableOpacity>
      )}
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: item.read ? colors.surface : colors.primary + '08', borderColor: colors.border }]}
            onPress={() => !item.read && markAsRead(item.id)}>
            <View style={styles.cardContent}>
              <IconButton icon={getNotificationIcon(item.type)} iconColor={colors.primary} size={24} style={styles.icon} />
              <View style={styles.textContent}>
                <Text variant="titleSmall" style={{ color: colors.text, fontWeight: item.read ? '400' : '700' }}>{item.title}</Text>
                <Text variant="bodySmall" style={{ color: colors.textSecondary, marginTop: 2 }}>{item.message}</Text>
                <Text variant="labelSmall" style={{ color: colors.textSecondary, marginTop: 4 }}>{formatRelativeTime(item.createdAt)}</Text>
              </View>
              {!item.read && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<EmptyState icon="bell-off-outline" title="No Notifications" message="You're all caught up!" />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  markAll: { alignItems: 'flex-end', padding: spacing.md },
  list: { padding: spacing.md, paddingTop: 0 },
  card: { borderRadius: borderRadius.md, marginBottom: spacing.sm, borderWidth: 1 },
  cardContent: { flexDirection: 'row', alignItems: 'flex-start', padding: spacing.sm },
  icon: { margin: 0 },
  textContent: { flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, marginTop: 8 },
});
