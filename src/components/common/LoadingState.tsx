import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { isTranslationKey } from '@/localization';
import { spacing } from '@/theme';

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message,
  fullScreen = true,
}) => {
  const { colors } = useAppTheme();
  const { t, directionStyle } = useLocalization();
  const text = message
    ? isTranslationKey(message)
      ? t(message)
      : message
    : t('common.loading');

  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text
        variant="bodyMedium"
        style={[styles.message, { color: colors.textSecondary }, directionStyle]}>
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  fullScreen: {
    flex: 1,
  },
  message: {
    marginTop: spacing.md,
    textAlign: 'center',
  },
});
