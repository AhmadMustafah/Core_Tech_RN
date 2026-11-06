import React, { useState, useCallback } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EmptyState, ErrorState, LoadingState } from '@/components/common';
import { getErrorMessage } from '@/services/api';
import { notificationService } from '@/services/notificationService';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { formatRelativeTime } from '@/utils/formatters';
import type { AppNotification } from '@/types';
import type { MainShellParamList } from '@/types/navigation';
import { NOTIFICATION_BODY_KEYS, NOTIFICATION_TITLE_KEYS } from '@/localization';
import { spacing, borderRadius, listContentStyle, listPerformanceProps } from '@/theme';

type Props = NativeStackScreenProps<MainShellParamList, 'Notifications'>;

const getNotificationIcon = (type: AppNotification['type']) => {
  switch (type) {
    case 'sale_completed': return 'cart-check';
    case 'purchase_completed': return 'truck-check';
    case 'low_stock': return 'alert-outline';
    default: return 'clipboard-text-outline';
  }
};

export const NotificationsScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useAppTheme();
  const { t, language } = useLocalization();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setNotifications(await notificationService.getAll());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const markAllRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const openDetails = (item: AppNotification) => {
    navigation.navigate('NotificationDetails', { notification: item });
  };

  if (loading && notifications.length === 0) return <LoadingState message="notify.loading" />;
  if (error && notifications.length === 0) return <ErrorState message={error} onRetry={load} />;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {notifications.some(n => !n.read) && (
        <TouchableOpacity style={styles.markAll} onPress={markAllRead}>
          <Text style={{ color: colors.primary, fontWeight: '600' }}>{t('notify.markAll')}</Text>
        </TouchableOpacity>
      )}
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        contentContainerStyle={listContentStyle}
        {...listPerformanceProps}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: item.read ? colors.surface : colors.primary + '08', borderColor: colors.border }]}
            onPress={() => openDetails(item)}>
            <View style={styles.cardContent}>
              <IconButton icon={getNotificationIcon(item.type)} iconColor={colors.primary} size={24} style={styles.icon} />
              <View style={styles.textContent}>
                <Text variant="titleSmall" numberOfLines={2} style={{ color: colors.text, fontWeight: item.read ? '400' : '700' }}>
                  {NOTIFICATION_TITLE_KEYS[item.type as keyof typeof NOTIFICATION_TITLE_KEYS]
                    ? t(NOTIFICATION_TITLE_KEYS[item.type as keyof typeof NOTIFICATION_TITLE_KEYS])
                    : item.title}
                </Text>
                <Text variant="bodySmall" style={{ color: colors.textSecondary, marginTop: 2 }}>
                  {NOTIFICATION_BODY_KEYS[item.type as keyof typeof NOTIFICATION_BODY_KEYS]
                    ? t(NOTIFICATION_BODY_KEYS[item.type as keyof typeof NOTIFICATION_BODY_KEYS])
                    : item.message}
                </Text>
                <Text variant="labelSmall" style={{ color: colors.textSecondary, marginTop: 4 }}>{formatRelativeTime(item.createdAt, language)}</Text>
              </View>
              {!item.read && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<EmptyState icon="bell-off-outline" title={t('notify.empty')} message={t('notify.emptyMsg')} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  markAll: { alignItems: 'flex-end', padding: spacing.md },
  card: { borderRadius: borderRadius.md, marginBottom: spacing.sm, borderWidth: 1 },
  cardContent: { flexDirection: 'row', alignItems: 'flex-start', padding: spacing.sm },
  icon: { margin: 0 },
  textContent: { flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, marginTop: 8 },
});
