import React, { useCallback, useMemo, useRef } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { EventDetailView, type EventDetailSection } from '@/components/common/EventDetailView';
import { notificationService } from '@/services/notificationService';
import { useLocalization } from '@/hooks/useLocalization';
import { formatDateTime } from '@/utils/formatters';
import { NOTIFICATION_BODY_KEYS, NOTIFICATION_TITLE_KEYS } from '@/localization';
import type { AppNotification } from '@/types';
import type { MainShellParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<MainShellParamList, 'NotificationDetails'>;

const getNotificationIcon = (type: AppNotification['type']) => {
  switch (type) {
    case 'sale_completed':
      return 'cart-check';
    case 'purchase_completed':
      return 'truck-check';
    case 'low_stock':
      return 'alert-outline';
    case 'customer_activity':
      return 'account-outline';
    case 'supplier_activity':
      return 'truck-outline';
    case 'payment_update':
      return 'cash';
    case 'system_alert':
      return 'bell-alert-outline';
    default:
      return 'clipboard-text-outline';
  }
};

const extraDetailRows = (details: AppNotification['details']) => {
  if (!details || typeof details !== 'object' || Array.isArray(details)) {
    return [];
  }

  return Object.entries(details)
    .filter(([, value]) => value != null && value !== '')
    .map(([key, value]) => ({
      icon: 'information-outline',
      label: key,
      value,
    }));
};

export const NotificationDetailsScreen: React.FC<Props> = ({ route }) => {
  const { notification } = route.params;
  const { t, language } = useLocalization();
  const markedRead = useRef(notification.read);

  useFocusEffect(
    useCallback(() => {
      if (markedRead.current) {
        return;
      }
      markedRead.current = true;
      notificationService.markAsRead(notification.id).catch(() => {
        markedRead.current = false;
      });
    }, [notification.id]),
  );

  const title = NOTIFICATION_TITLE_KEYS[notification.type as keyof typeof NOTIFICATION_TITLE_KEYS]
    ? t(NOTIFICATION_TITLE_KEYS[notification.type as keyof typeof NOTIFICATION_TITLE_KEYS])
    : notification.title;

  const message = NOTIFICATION_BODY_KEYS[notification.type as keyof typeof NOTIFICATION_BODY_KEYS]
    ? t(NOTIFICATION_BODY_KEYS[notification.type as keyof typeof NOTIFICATION_BODY_KEYS])
    : notification.message;

  const sections = useMemo<EventDetailSection[]>(
    () => [
      {
        title: t('notify.overview'),
        rows: [
          { icon: 'text-box-outline', label: t('notify.fullDescription'), value: message || notification.message },
          { icon: 'tag-outline', label: t('notify.typeLabel'), value: notification.type },
          {
            icon: 'check-circle-outline',
            label: t('notify.statusLabel'),
            value: notification.read ? t('notify.statusRead') : t('notify.statusUnread'),
          },
          {
            icon: 'clock-outline',
            label: t('notify.dateTime'),
            value: notification.createdAt ? formatDateTime(notification.createdAt, language) : null,
          },
        ],
      },
      {
        title: t('notify.relatedEntity'),
        rows: [
          { icon: 'link-variant', label: t('notify.entityType'), value: notification.relatedType },
          { icon: 'identifier', label: t('notify.entityId'), value: notification.relatedId },
        ],
      },
      {
        title: t('notify.additional'),
        rows: extraDetailRows(notification.details),
      },
    ],
    [language, message, notification, t],
  );

  return (
    <EventDetailView
      icon={getNotificationIcon(notification.type)}
      title={title}
      subtitle={message}
      sections={sections}
    />
  );
};
