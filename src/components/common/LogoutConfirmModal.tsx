import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Modal, Pressable, StyleSheet, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { borderRadius, spacing, typography } from '@/theme';
import { CustomButton } from './CustomButton';

type Props = {
  visible: boolean;
  loading?: boolean;
  error?: string | null;
  onCancel: () => void;
  onConfirm: () => void;
};

export const LogoutConfirmModal: React.FC<Props> = ({
  visible,
  loading = false,
  error,
  onCancel,
  onConfirm,
}) => {
  const { colors } = useAppTheme();
  const { t, directionStyle, isRTL } = useLocalization();
  const scale = useRef(new Animated.Value(0.94)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      scale.setValue(0.94);
      opacity.setValue(0);
      return;
    }

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 160,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 7,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, scale, visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={loading ? undefined : onCancel}>
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={loading ? undefined : onCancel} />
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.borderLight,
              opacity,
              transform: [{ scale }],
            },
          ]}>
          <View style={[styles.iconWrap, { backgroundColor: colors.error + '18' }]}>
            <Icon source="logout" size={28} color={colors.error} />
          </View>
          <Text style={[styles.title, directionStyle, { color: colors.text }]}>
            {t('profile.logoutTitle')}
          </Text>
          <Text style={[styles.body, directionStyle, { color: colors.textSecondary }]}>
            {t('profile.logoutConfirm')}
          </Text>
          {error ? (
            <Text style={[styles.error, directionStyle, { color: colors.error }]}>{error}</Text>
          ) : null}
          <View style={[styles.actions, isRTL && styles.actionsRtl]}>
            <CustomButton
              title={t('common.cancel')}
              variant="outline"
              onPress={onCancel}
              disabled={loading}
              style={styles.action}
            />
            <CustomButton
              title={t('profile.logout')}
              onPress={onConfirm}
              loading={loading}
              disabled={loading}
              style={styles.action}
              buttonColor={colors.error}
              textColor="#FFFFFF"
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    alignItems: 'center',
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...(typography.h3 as object),
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  body: {
    ...(typography.body as object),
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  error: {
    ...(typography.bodySmall as object),
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
    marginTop: spacing.sm,
  },
  actionsRtl: {
    flexDirection: 'row-reverse',
  },
  action: {
    flex: 1,
  },
});
