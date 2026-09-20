import React, { memo } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import { CustomButton, DetailRow, InitialsAvatar } from '@/components/common';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { formatDateTime } from '@/utils/formatters';
import { PAYMENT_STATUS_KEYS, type TranslationKey } from '@/localization';
import type { Activity, ActivityAction, ActivityType } from '@/types';
import type { AppColors } from '@/theme';
import { borderRadius, spacing } from '@/theme';

export const ACTIVITY_TYPE_KEYS: Record<ActivityType, TranslationKey> = {
  sale: 'activity.type.sale',
  purchase: 'activity.type.purchase',
  product: 'activity.type.product',
  customer: 'activity.type.customer',
  supplier: 'activity.type.supplier',
  payment: 'activity.type.payment',
  auth: 'activity.type.auth',
};

export const ACTIVITY_ACTION_KEYS: Record<ActivityAction, TranslationKey> = {
  created: 'activity.action.created',
  updated: 'activity.action.updated',
  deleted: 'activity.action.deleted',
  status_changed: 'activity.action.statusChanged',
  stock_changed: 'activity.action.stockChanged',
  logged_in: 'activity.action.loggedIn',
  logged_out: 'activity.action.loggedOut',
  alert: 'activity.action.alert',
};

export const ACTIVITY_ICONS: Record<ActivityType, string> = {
  sale: 'cart-check',
  purchase: 'truck-delivery',
  product: 'package-variant',
  customer: 'account-plus',
  supplier: 'truck-plus-outline',
  payment: 'cash-check',
  auth: 'shield-account-outline',
};

export const getActivityColor = (type: ActivityType, colors: AppColors) => {
  switch (type) {
    case 'sale':
      return colors.success;
    case 'purchase':
      return colors.secondary;
    case 'product':
      return colors.warning;
    case 'customer':
      return colors.info;
    case 'supplier':
      return colors.accent;
    case 'payment':
      return colors.primary;
    case 'auth':
      return colors.textSecondary;
    default:
      return colors.primary;
  }
};

const PERSON_ACTIVITY_TYPES: ActivityType[] = ['customer', 'supplier', 'auth', 'sale', 'payment'];

export const getActivityPersonName = (activity: Activity): string | undefined =>
  activity.actor?.name ||
  (PERSON_ACTIVITY_TYPES.includes(activity.type) ? activity.entityName : undefined);

export const getActivityHeadline = (activity: Activity, t: (key: TranslationKey, vars?: Record<string, string | number>) => string) => {
  const actor = activity.actor?.name;
  const target = activity.entityReference || activity.entityName || activity.description;
  if (actor && target) {
    return `${actor} · ${target}`;
  }
  return activity.description || t(ACTIVITY_TYPE_KEYS[activity.type]);
};

type ActivityListItemProps = {
  activity: Activity;
  onPress: (activity: Activity) => void;
  last?: boolean;
};

export const ActivityListItem: React.FC<ActivityListItemProps> = memo(({ activity, onPress, last }) => {
  const { colors } = useAppTheme();
  const { t, language, isRTL, directionStyle } = useLocalization();
  const accent = getActivityColor(activity.type, colors);
  const actorName = activity.actor?.name;
  const actorRole = activity.actor?.role;
  const personName = getActivityPersonName(activity);

  return (
    <Pressable
      onPress={() => onPress(activity)}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: colors.surface,
          borderColor: colors.borderLight,
          opacity: pressed ? 0.88 : 1,
          marginBottom: last ? 0 : spacing.sm,
        },
      ]}
      accessibilityRole="button">
      {personName ? (
        <View style={styles.avatarSlot}>
          <InitialsAvatar
            size={40}
            name={personName}
            imageUri={activity.actor?.avatar}
            backgroundColor={accent}
          />
        </View>
      ) : (
        <View style={[styles.iconWrap, { backgroundColor: `${accent}18` }]}>
          <Icon source={ACTIVITY_ICONS[activity.type]} size={20} color={accent} />
        </View>
      )}
      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <Text
            variant="bodyMedium"
            numberOfLines={1}
            style={[{ color: colors.text, fontWeight: '700', flex: 1, textAlign: isRTL ? 'right' : 'left' }, directionStyle]}>
            {activity.title}
          </Text>
          <View style={[styles.typeBadge, { backgroundColor: `${accent}18` }]}>
            <Text variant="labelSmall" style={{ color: accent, fontWeight: '700' }}>
              {t(ACTIVITY_TYPE_KEYS[activity.type])}
            </Text>
          </View>
        </View>
        <Text variant="bodySmall" style={{ color: colors.textSecondary, marginTop: 2 }} numberOfLines={2}>
          {getActivityHeadline(activity, t)}
        </Text>
        {actorName || actorRole ? (
          <Text variant="labelSmall" style={{ color: colors.textMuted, marginTop: 4 }} numberOfLines={1}>
            {[actorName, actorRole].filter(Boolean).join(' · ')}
          </Text>
        ) : null}
        <Text variant="labelSmall" style={{ color: colors.textSecondary, marginTop: 4 }}>
          {formatDateTime(activity.timestamp, language)}
        </Text>
      </View>
    </Pressable>
  );
});

ActivityListItem.displayName = 'ActivityListItem';

type ActivityDetailsModalProps = {
  activity: Activity | null;
  visible: boolean;
  onDismiss: () => void;
  onOpenRecord?: (activity: Activity) => void;
};

export const ActivityDetailsModal: React.FC<ActivityDetailsModalProps> = ({
  activity,
  visible,
  onDismiss,
  onOpenRecord,
}) => {
  const { colors } = useAppTheme();
  const { t, language, isRTL, directionStyle } = useLocalization();

  if (!activity) {
    return null;
  }

  const accent = getActivityColor(activity.type, colors);
  const actor = activity.actor;
  const canOpen =
    Boolean(onOpenRecord && activity.entityId && activity.entityType && activity.entityType !== 'auth');
  const statusLabel =
    activity.status && activity.status in PAYMENT_STATUS_KEYS
      ? t(PAYMENT_STATUS_KEYS[activity.status as keyof typeof PAYMENT_STATUS_KEYS])
      : activity.status;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <Pressable style={[styles.backdrop, { backgroundColor: colors.overlay }]} onPress={onDismiss}>
        <Pressable
          onPress={event => event.stopPropagation()}
          style={[styles.sheet, { backgroundColor: colors.surface }]}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
          <View style={styles.hero}>
            {getActivityPersonName(activity) ? (
              <InitialsAvatar
                size={48}
                name={getActivityPersonName(activity)}
                imageUri={actor?.avatar}
                backgroundColor={accent}
              />
            ) : (
              <View style={[styles.heroIcon, { backgroundColor: `${accent}18` }]}>
                <Icon source={ACTIVITY_ICONS[activity.type]} size={26} color={accent} />
              </View>
            )}
            <View style={styles.heroCopy}>
              <Text variant="titleMedium" style={[{ color: colors.text, fontWeight: '700', textAlign: isRTL ? 'right' : 'left' }, directionStyle]}>
                {activity.title}
              </Text>
              <View style={[styles.typeBadge, { backgroundColor: `${accent}18`, alignSelf: isRTL ? 'flex-end' : 'flex-start', marginTop: 6 }]}>
                <Text variant="labelSmall" style={{ color: accent, fontWeight: '700' }}>
                  {t(ACTIVITY_TYPE_KEYS[activity.type])}
                </Text>
              </View>
            </View>
          </View>

          {actor?.name ? (
            <View style={[styles.actorCard, { backgroundColor: colors.surfaceVariant }]}>
              <InitialsAvatar size={40} name={actor.name} imageUri={actor.avatar} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: '700' }}>{actor.name}</Text>
                <Text variant="bodySmall" style={{ color: colors.textSecondary, marginTop: 2 }}>
                  {actor.role || t('common.user')}
                </Text>
              </View>
            </View>
          ) : null}

          <ScrollView style={styles.details} showsVerticalScrollIndicator={false}>
            {activity.action ? (
              <DetailRow label={t('activity.actionLabel')} value={t(ACTIVITY_ACTION_KEYS[activity.action])} />
            ) : null}
            {activity.entityName ? (
              <DetailRow label={t('activity.affected')} value={activity.entityName} />
            ) : null}
            {activity.entityReference ? (
              <DetailRow label={t('activity.reference')} value={activity.entityReference} emphasize />
            ) : null}
            {statusLabel ? <DetailRow label={t('activity.status')} value={statusLabel} /> : null}
            {activity.previousValue || activity.newValue ? (
              <DetailRow
                label={t('activity.change')}
                value={
                  activity.previousValue && activity.newValue
                    ? `${activity.previousValue} → ${activity.newValue}`
                    : activity.newValue || activity.previousValue || ''
                }
              />
            ) : null}
            <DetailRow label={t('activity.when')} value={formatDateTime(activity.timestamp, language)} last />
            {activity.description ? (
              <Text variant="bodySmall" style={{ color: colors.textSecondary, padding: spacing.md }}>
                {activity.description}
              </Text>
            ) : null}
          </ScrollView>

          {canOpen ? (
            <CustomButton
              title={t('activity.openRecord')}
              onPress={() => onOpenRecord?.(activity)}
              fullWidth
              style={{ marginTop: spacing.sm }}
            />
          ) : null}
          <CustomButton
            title={t('common.close')}
            variant="text"
            onPress={onDismiss}
            fullWidth
            style={{ marginTop: spacing.xs }}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: spacing.md,
  },
  avatarSlot: {
    marginEnd: spacing.md,
  },
  copy: { flex: 1, minWidth: 0 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  typeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '86%',
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: spacing.md,
  },
  hero: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCopy: { flex: 1 },
  actorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  details: {
    maxHeight: 280,
  },
});
