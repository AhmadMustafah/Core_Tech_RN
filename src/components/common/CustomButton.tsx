import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { Button as PaperButton, ButtonProps } from 'react-native-paper';
import { useAppTheme } from '@/hooks/useAppTheme';
import { borderRadius, spacing } from '@/theme';

interface CustomButtonProps extends Omit<ButtonProps, 'children'> {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  fullWidth?: boolean;
  style?: ViewStyle;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  variant = 'primary',
  fullWidth = false,
  style,
  loading,
  disabled,
  ...props
}) => {
  const { colors } = useAppTheme();

  const getMode = (): ButtonProps['mode'] => {
    switch (variant) {
      case 'outline':
        return 'outlined';
      case 'text':
        return 'text';
      case 'secondary':
        return 'contained-tonal';
      default:
        return 'contained';
    }
  };

  return (
    <PaperButton
      mode={getMode()}
      loading={loading}
      disabled={disabled || loading}
      buttonColor={variant === 'primary' ? colors.primary : undefined}
      textColor={
        variant === 'outline' || variant === 'text'
          ? colors.primary
          : variant === 'secondary'
            ? colors.secondary
            : '#FFFFFF'
      }
      style={[
        styles.button,
        fullWidth && styles.fullWidth,
        variant === 'outline' && { borderColor: colors.primary },
        style,
      ]}
      contentStyle={styles.content}
      labelStyle={styles.label}
      {...props}>
      {title}
    </PaperButton>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.md,
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    paddingVertical: spacing.xs,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
});
