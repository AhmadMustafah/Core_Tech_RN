import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { useAppTheme } from '@/hooks/useAppTheme';
import { spacing } from '@/theme';

interface EmptyStateProps {
  icon?: string;
  title: string;
  message?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'inbox-outline',
  title,
  message,
  action,
}) => {
  const { colors } = useAppTheme();

  return (
    <View style={styles.container}>
      <Icon source={icon} size={64} color={colors.textSecondary} />
      <Text
        variant="titleMedium"
        style={[styles.title, { color: colors.text }]}>
        {title}
      </Text>
      {message && (
        <Text
          variant="bodyMedium"
          style={[styles.message, { color: colors.textSecondary }]}>
          {message}
        </Text>
      )}
      {action && <View style={styles.action}>{action}</View>}
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
  action: {
    marginTop: spacing.lg,
  },
});
