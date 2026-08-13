import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleSheet, ViewStyle, TextInput as RNTextInput, type ReturnKeyTypeOptions } from 'react-native';
import { TextInput, TextInputProps, HelperText } from 'react-native-paper';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useFormInputFocus } from './FormScrollView';
import { borderRadius, spacing } from '@/theme';

interface CustomInputProps extends Omit<TextInputProps, 'error'> {
  error?: string;
  containerStyle?: ViewStyle;
}

type PaperTextInputRef = React.ElementRef<typeof TextInput>;

export const CustomInput = forwardRef<PaperTextInputRef, CustomInputProps>(
  ({ error, containerStyle, style, mode = 'outlined', returnKeyType, onSubmitEditing, onFocus, blurOnSubmit, ...props }, forwardedRef) => {
    const { colors } = useAppTheme();
    const innerRef = useRef<PaperTextInputRef>(null);
    const nativeRef = useRef<RNTextInput>(null);

    useImperativeHandle(forwardedRef, () => innerRef.current as PaperTextInputRef);

    const focusProps = useFormInputFocus(nativeRef);

    const handleFocus: TextInputProps['onFocus'] = event => {
      onFocus?.(event);
      focusProps.onFocus();
    };

    const handleSubmitEditing: TextInputProps['onSubmitEditing'] = event => {
      onSubmitEditing?.(event);
      focusProps.onSubmitEditing();
    };

    return (
      <>
        <TextInput
          ref={(instance: PaperTextInputRef | null) => {
            innerRef.current = instance;
            nativeRef.current = instance as unknown as RNTextInput;
          }}
          mode={mode}
          error={!!error}
          outlineColor={colors.border}
          activeOutlineColor={colors.primary}
          textColor={colors.text}
          placeholderTextColor={colors.textSecondary}
          style={[styles.input, { backgroundColor: colors.surface }, style]}
          contentStyle={styles.content}
          returnKeyType={(returnKeyType ?? focusProps.returnKeyType) as ReturnKeyTypeOptions | undefined}
          blurOnSubmit={blurOnSubmit ?? focusProps.blurOnSubmit}
          onFocus={handleFocus}
          onSubmitEditing={handleSubmitEditing}
          {...props}
        />
        {error ? (
          <HelperText type="error" visible={!!error} style={styles.helper}>
            {error}
          </HelperText>
        ) : null}
      </>
    );
  },
) as React.ForwardRefExoticComponent<CustomInputProps & React.RefAttributes<PaperTextInputRef>> & {
  Icon: typeof TextInput.Icon;
};

CustomInput.displayName = 'CustomInput';
CustomInput.Icon = TextInput.Icon;

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
