import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
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
          borderStartColor: accentColor,
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
      <Pressable
        onPress={onPress}
        android_ripple={{ color: colors.primaryMuted }}
        style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}>
        {content}
      </Pressable>
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
    borderStartWidth: 4,
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
    marginEnd: spacing.md,
  },
  content: {
    flex: 1,
  },
  pressable: {
    flex: 1,
    minWidth: '45%',
  },
  pressed: {
    opacity: 0.82,
  },
});
