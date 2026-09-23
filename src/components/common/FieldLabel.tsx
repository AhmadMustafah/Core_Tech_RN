import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { spacing } from '@/theme';

type FieldLabelProps = {
  label?: string;
  required?: boolean;
  optional?: boolean;
};

export const FieldLabel: React.FC<FieldLabelProps> = ({
  label,
  required = false,
  optional = false,
}) => {
  const { colors } = useAppTheme();
  const { t, isRTL, directionStyle } = useLocalization();
  const textAlign = isRTL ? 'right' : 'left';

  if (!label) {
    return null;
  }

  return (
    <View style={styles.row}>
      <Text
        variant="labelLarge"
        style={[styles.label, { color: colors.textSecondary, textAlign, flex: 1 }, directionStyle]}>
        {label}
        {required ? <Text style={{ color: colors.error }}> *</Text> : null}
      </Text>
      {optional && !required ? (
        <Text
          variant="labelSmall"
          style={[{ color: colors.textMuted, textAlign }, directionStyle]}>
          {t('common.optional')}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  label: {
    fontWeight: '600',
  },
});
