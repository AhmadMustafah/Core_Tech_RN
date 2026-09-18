import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Icon, Button } from 'react-native-paper';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { isTranslationKey } from '@/localization';
import { spacing } from '@/theme';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message,
  onRetry,
}) => {
  const { colors } = useAppTheme();
  const { t, directionStyle } = useLocalization();
  const text = message
    ? isTranslationKey(message)
      ? t(message)
      : message
    : t('common.somethingWrong');

  return (
    <View style={styles.container}>
      <Icon source="alert-circle-outline" size={64} color={colors.error} />
      <Text
        variant="titleMedium"
        style={[styles.title, { color: colors.text }, directionStyle]}>
        {t('common.error')}
      </Text>
      <Text
        variant="bodyMedium"
        style={[styles.message, { color: colors.textSecondary }, directionStyle]}>
        {text}
      </Text>
      {onRetry && (
        <Button mode="contained" onPress={onRetry} style={styles.button}>
          {t('common.tryAgain')}
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  title: {
    marginTop: spacing.md,
    textAlign: 'center',
  },
  message: {
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  button: {
    marginTop: spacing.lg,
  },
});
