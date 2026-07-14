import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { TextInput, TextInputProps, HelperText } from 'react-native-paper';
import { useAppTheme } from '@/hooks/useAppTheme';
import { borderRadius, spacing } from '@/theme';

interface CustomInputProps extends Omit<TextInputProps, 'error'> {
  error?: string;
  containerStyle?: ViewStyle;
}

export const CustomInput: React.FC<CustomInputProps> & {
  Icon: typeof TextInput.Icon;
} = ({ error, containerStyle, style, mode = 'outlined', ...props }) => {
  const { colors } = useAppTheme();

  return (
    <>
      <TextInput
        mode={mode}
        error={!!error}
        outlineColor={colors.border}
        activeOutlineColor={colors.primary}
        textColor={colors.text}
        placeholderTextColor={colors.textSecondary}
        style={[styles.input, { backgroundColor: colors.surface }, style]}
        contentStyle={styles.content}
        {...props}
      />
      {error ? (
        <HelperText type="error" visible={!!error} style={styles.helper}>
          {error}
        </HelperText>
      ) : null}
    </>
  );
};

const styles = StyleSheet.create({
  input: {
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
  },
  content: {
    paddingHorizontal: spacing.sm,
  },
  helper: {
    marginTop: -spacing.xs,
    marginBottom: spacing.sm,
  },
});

CustomInput.Icon = TextInput.Icon;
