import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Icon, Button } from 'react-native-paper';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing } from '@/theme';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Something went wrong',
  onRetry,
}) => {
  const { colors } = useAppTheme();

  return (
    <View style={styles.container}>
      <Icon source="alert-circle-outline" size={64} color={colors.error} />
      <Text
        variant="titleMedium"
        style={[styles.title, { color: colors.text }]}>
        Error
      </Text>
      <Text
        variant="bodyMedium"
        style={[styles.message, { color: colors.textSecondary }]}>
        {message}
      </Text>
      {onRetry && (
        <Button mode="contained" onPress={onRetry} style={styles.button}>
          Try Again
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
  },
  message: {
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  button: {
    marginTop: spacing.lg,
  },
});
