import React, { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { borderRadius } from '@/theme';

type Props = {
  unreadCount: number;
  onPress: () => void;
};

export const NotificationBell = memo(function NotificationBell({ unreadCount, onPress }: Props) {
  const { colors } = useAppTheme();
  const { t } = useLocalization();
  const badgeLabel = unreadCount > 99 ? '99+' : String(unreadCount);

  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={t('nav.notifications')}
      style={({ pressed }) => [styles.hit, pressed && styles.pressed]}>
      <Icon source="bell-outline" size={22} color={colors.text} />
      {unreadCount > 0 ? (
        <View style={[styles.badge, { backgroundColor: colors.error }]}>
          <Text style={styles.badgeText}>{badgeLabel}</Text>
        </View>
      ) : null}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  hit: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: 4,
  },
  pressed: {
    opacity: 0.7,
  },
  badge: {
    position: 'absolute',
    top: 4,
    end: 2,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    lineHeight: 11,
  },
});
