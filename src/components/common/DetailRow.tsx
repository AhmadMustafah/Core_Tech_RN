import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { spacing } from '@/theme';

type DetailRowProps = {
  label: string;
  value: string;
  last?: boolean;
  emphasize?: boolean;
};

export const DetailRow: React.FC<DetailRowProps> = ({
  label,
  value,
  last,
  emphasize,
}) => {
  const { colors } = useAppTheme();
  const { isRTL } = useLocalization();

  return (
    <View
      style={[
        styles.row,
        !last && {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
      ]}>
      <Text variant="bodySmall" style={[styles.label, { color: colors.textSecondary }]}>
        {label}
      </Text>
      <Text
        variant="bodyMedium"
        style={[
          styles.value,
          {
            color: emphasize ? colors.primary : colors.text,
            fontWeight: emphasize ? '700' : '600',
            textAlign: isRTL ? 'left' : 'right',
          },
        ]}>
        {value}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  label: {
    flex: 1,
    minWidth: 0,
  },
  value: {
    flex: 1.2,
    minWidth: 0,
    writingDirection: 'ltr',
  },
});
