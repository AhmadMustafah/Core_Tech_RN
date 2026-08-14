import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Divider, Icon, Switch, Text } from 'react-native-paper';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { borderRadius, spacing, typography } from '@/theme';

export const SettingsSection: React.FC<{
  title?: string;
  children: React.ReactNode;
}> = ({ title, children }) => {
  const { colors } = useAppTheme();

  return (
    <View style={styles.sectionWrap}>
      {title ? (
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{title}</Text>
      ) : null}
      <View style={[styles.sectionCard, { backgroundColor: colors.surface }]}>{children}</View>
    </View>
  );
};

export const SettingsHint: React.FC<{ children: string }> = ({ children }) => {
  const { colors } = useAppTheme();
  return (
    <Text style={[styles.hint, { color: colors.textSecondary }]}>{children}</Text>
  );
};

type RowBaseProps = {
  icon: string;
  title: string;
  description?: string;
  last?: boolean;
};

export const SettingsNavRow: React.FC<
  RowBaseProps & {
    onPress: () => void;
    value?: string;
  }
> = ({ icon, title, description, value, last, onPress }) => {
  const { colors } = useAppTheme();
  const { directionalIconStyle } = useLocalization();

  return (
    <>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.primaryMuted }]}
        accessibilityRole="button">
        <View style={[styles.iconWrap, { backgroundColor: colors.surfaceVariant }]}>
          <Icon source={icon} size={20} color={colors.primary} />
        </View>
        <View style={styles.rowText}>
          <Text variant="bodyLarge" style={{ color: colors.text, fontWeight: '600' }}>
            {title}
          </Text>
          {description ? (
            <Text variant="bodySmall" style={{ color: colors.textSecondary, marginTop: 2 }}>
              {description}
            </Text>
          ) : null}
        </View>
        {value ? (
          <Text
            variant="labelLarge"
            numberOfLines={1}
            style={[styles.value, { color: colors.primary }]}>
            {value}
          </Text>
        ) : null}
        <View style={directionalIconStyle}>
          <Icon source="chevron-right" size={22} color={colors.textMuted} />
        </View>
      </Pressable>
      {last ? null : <Divider />}
    </>
  );
};

export const SettingsToggleRow: React.FC<
  RowBaseProps & {
    value: boolean;
    onValueChange: (value: boolean) => void;
    disabled?: boolean;
  }
> = ({ icon, title, description, value, onValueChange, disabled, last }) => {
  const { colors } = useAppTheme();

  return (
    <>
      <View style={[styles.row, disabled && styles.disabled]}>
        <View style={[styles.iconWrap, { backgroundColor: colors.surfaceVariant }]}>
          <Icon source={icon} size={20} color={disabled ? colors.textMuted : colors.primary} />
        </View>
        <View style={styles.rowText}>
          <Text
            variant="bodyLarge"
            style={{ color: disabled ? colors.textMuted : colors.text, fontWeight: '600' }}>
            {title}
          </Text>
          {description ? (
            <Text variant="bodySmall" style={{ color: colors.textSecondary, marginTop: 2 }}>
              {description}
            </Text>
          ) : null}
        </View>
        <Switch value={value} onValueChange={onValueChange} disabled={disabled} />
      </View>
      {last ? null : <Divider />}
    </>
  );
};

export const SettingsChoiceRow: React.FC<
  RowBaseProps & {
    selected: boolean;
    onPress: () => void;
  }
> = ({ icon, title, description, selected, last, onPress }) => {
  const { colors } = useAppTheme();

  return (
    <>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.row,
          selected && { backgroundColor: colors.primaryMuted },
          pressed && { opacity: 0.92 },
        ]}
        accessibilityRole="button"
        accessibilityState={{ selected }}>
        <View
          style={[
            styles.iconWrap,
            { backgroundColor: selected ? colors.primary + '22' : colors.surfaceVariant },
          ]}>
          <Icon source={icon} size={20} color={selected ? colors.primary : colors.textSecondary} />
        </View>
        <View style={styles.rowText}>
          <Text
            variant="bodyLarge"
            style={{ color: selected ? colors.primary : colors.text, fontWeight: '600' }}>
            {title}
          </Text>
          {description ? (
            <Text variant="bodySmall" style={{ color: colors.textSecondary, marginTop: 2 }}>
              {description}
            </Text>
          ) : null}
        </View>
        <Icon
          source={selected ? 'check-circle' : 'circle-outline'}
          size={22}
          color={selected ? colors.primary : colors.border}
        />
      </Pressable>
      {last ? null : <Divider />}
    </>
  );
};

const styles = StyleSheet.create({
  sectionWrap: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  sectionLabel: {
    ...(typography.label as object),
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.sm,
  },
  sectionCard: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    elevation: 1,
  },
  hint: {
    ...(typography.bodySmall as object),
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    minHeight: 64,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm + 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginEnd: spacing.md,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  value: {
    marginEnd: spacing.sm,
    fontWeight: '600',
    maxWidth: '34%',
    flexShrink: 1,
  },
  disabled: {
    opacity: 0.62,
  },
});
