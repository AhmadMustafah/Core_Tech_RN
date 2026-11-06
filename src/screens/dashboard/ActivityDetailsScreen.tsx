import React, { useMemo } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EventDetailView, type EventDetailSection } from '@/components/common/EventDetailView';
import { useLocalization } from '@/hooks/useLocalization';
import { formatDateTime } from '@/utils/formatters';
import type { Activity } from '@/types';
import type { MainShellParamList } from '@/types/navigation';
import type { TranslationKey } from '@/localization';

type Props = NativeStackScreenProps<MainShellParamList, 'ActivityDetails'>;

const activityTypeKeys: Record<Activity['type'], TranslationKey> = {
  sale: 'activity.type.sale',
  purchase: 'activity.type.purchase',
  product: 'activity.type.product',
  customer: 'activity.type.customer',
  supplier: 'activity.type.supplier',
  payment: 'activity.type.payment',
  auth: 'activity.type.auth',
};

const activityIcons: Record<Activity['type'], string> = {
  sale: 'cart-check',
  purchase: 'truck-delivery',
  product: 'package-variant',
  customer: 'account-plus',
  supplier: 'truck',
  payment: 'cash',
  auth: 'account-key',
};

const actionKeys: Partial<Record<NonNullable<Activity['action']>, TranslationKey>> = {
  created: 'activity.action.created',
  updated: 'activity.action.updated',
  deleted: 'activity.action.deleted',
  status_changed: 'activity.action.statusChanged',
  stock_changed: 'activity.action.stockChanged',
  logged_in: 'activity.action.loggedIn',
  logged_out: 'activity.action.loggedOut',
  alert: 'activity.action.alert',
};

const formatAction = (
  action: Activity['action'] | undefined,
  t: (key: TranslationKey) => string,
) => {
  if (!action) {
    return null;
  }
  const key = actionKeys[action];
  return key ? t(key) : action;
};

export const ActivityDetailsScreen: React.FC<Props> = ({ route }) => {
  const { activity } = route.params;
  const { t, language } = useLocalization();

  const typeLabel = activityTypeKeys[activity.type]
    ? t(activityTypeKeys[activity.type])
    : activity.type;
  const title = activity.title || typeLabel;

  const sections = useMemo<EventDetailSection[]>(
    () => [
      {
        title: t('notify.overview'),
        rows: [
          { icon: 'text-box-outline', label: t('notify.fullDescription'), value: activity.description },
          { icon: 'flash-outline', label: t('notify.actionLabel'), value: formatAction(activity.action, t) },
          { icon: 'tag-outline', label: t('notify.typeLabel'), value: typeLabel },
          { icon: 'flag-outline', label: t('notify.statusLabel'), value: activity.status },
          {
            icon: 'clock-outline',
            label: t('notify.dateTime'),
            value: activity.timestamp ? formatDateTime(activity.timestamp, language) : null,
          },
        ],
      },
      {
        title: t('notify.relatedEntity'),
        rows: [
          { icon: 'shape-outline', label: t('notify.entityType'), value: activity.entityType },
          { icon: 'tag-text-outline', label: t('activity.entityName'), value: activity.entityName },
          { icon: 'pound', label: t('activity.entityReference'), value: activity.entityReference },
          { icon: 'identifier', label: t('notify.entityId'), value: activity.entityId },
        ],
      },
      {
        title: t('notify.performedBy'),
        rows: [
          { icon: 'account-outline', label: t('profile.account'), value: activity.actor?.name },
          { icon: 'badge-account-outline', label: t('profile.role'), value: activity.actor?.role },
        ],
      },
      {
        title: t('notify.changes'),
        rows: [
          { icon: 'arrow-left-bold-outline', label: t('notify.before'), value: activity.previousValue },
          { icon: 'arrow-right-bold-outline', label: t('notify.after'), value: activity.newValue },
        ],
      },
    ],
    [activity, language, t, typeLabel],
  );

  return (
    <EventDetailView
      icon={activityIcons[activity.type] || 'history'}
      title={title}
      subtitle={activity.description}
      sections={sections}
    />
  );
};
