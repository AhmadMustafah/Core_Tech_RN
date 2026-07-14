import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { useAppTheme } from '@/hooks/useAppTheme';
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

  const content = (
    <Card
      mode="elevated"
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          shadowColor: colors.cardShadow,
        },
        style,
      ]}
      onPress={onPress}>
      {(title || subtitle || headerRight) && (
        <View style={styles.header}>
          <View style={styles.headerText}>
            {title && (
              <Text variant="titleMedium" style={{ color: colors.text }}>
                {title}
              </Text>
            )}
            {subtitle && (
              <Text
                variant="bodySmall"
                style={{ color: colors.textSecondary, marginTop: 2 }}>
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
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerText: {
    flex: 1,
  },
});
