import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { borderRadius, spacing } from '@/theme';

interface CustomCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  headerRight?: React.ReactNode;
}

export const CustomCard: React.FC<CustomCardProps> = ({
  title,
  subtitle,
  children,
  onPress,
  style,
  headerRight,
}) => {
  const { colors } = useAppTheme();
  const { directionStyle } = useLocalization();

  const content = (
    <Card
      mode="outlined"
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.borderLight,
        },
        style,
      ]}
      onPress={onPress}>
      {(title || subtitle || headerRight) && (
        <View style={styles.header}>
          <View style={styles.headerText}>
            {title && (
              <Text variant="titleMedium" style={[{ color: colors.text }, directionStyle]}>
                {title}
              </Text>
            )}
            {subtitle && (
              <Text
                variant="bodySmall"
                style={[{ color: colors.textSecondary, marginTop: 2 }, directionStyle]}>
                {subtitle}
              </Text>
            )}
          </View>
          {headerRight}
        </View>
      )}
      {children}
    </Card>
  );

  return content;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    elevation: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
});
