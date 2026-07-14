import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppTheme } from '@/hooks/useAppTheme';
import { borderRadius, spacing } from '@/theme';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color?: string;
  onPress?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  onPress,
}) => {
  const { colors } = useAppTheme();
  const accentColor = color || colors.primary;

  const content = (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderLeftColor: accentColor,
        },
      ]}>
      <View style={[styles.iconContainer, { backgroundColor: accentColor + '15' }]}>
        <Text style={{ fontSize: 24 }}>{icon}</Text>
      </View>
      <View style={styles.content}>
        <Text variant="headlineSmall" style={{ color: colors.text, fontWeight: '700' }}>
          {value}
        </Text>
        <Text variant="bodySmall" style={{ color: colors.textSecondary }}>
          {title}
        </Text>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderLeftWidth: 4,
    minWidth: '45%',
    marginBottom: spacing.sm,
    elevation: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
});
