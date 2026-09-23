import React, { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { StyleSheet, View, ViewStyle, type ReturnKeyTypeOptions } from 'react-native';
import { TextInput, TextInputProps, HelperText } from 'react-native-paper';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { isTranslationKey } from '@/localization';
import { FieldLabel } from './FieldLabel';
import { useFormInputFocus, type FormFieldHandle } from './FormScrollView';
import { borderRadius, spacing } from '@/theme';

interface CustomInputProps extends Omit<TextInputProps, 'error'> {
  error?: string;
  containerStyle?: ViewStyle;
  required?: boolean;
  optional?: boolean;
}

type PaperTextInputRef = React.ElementRef<typeof TextInput>;

const isLatinKeyboard = (keyboardType: TextInputProps['keyboardType']) =>
  keyboardType === 'email-address' ||
  keyboardType === 'phone-pad' ||
  keyboardType === 'numeric' ||
  keyboardType === 'number-pad' ||
  keyboardType === 'decimal-pad';

export const CustomInput = forwardRef<PaperTextInputRef, CustomInputProps>(
  (
    {
      error,
      containerStyle,
      style,
      mode = 'outlined',
      returnKeyType,
      onSubmitEditing,
      onFocus,
      blurOnSubmit,
      keyboardType,
      secureTextEntry,
      required,
      optional,
      label,
      placeholder,
      value,
      multiline,
      ...props
    },
    forwardedRef,
  ) => {
    const { colors, paperTheme } = useAppTheme();
    const { t, isRTL } = useLocalization();
    const inputTheme = useMemo(
      () => ({
        ...paperTheme,
        colors: {
          ...paperTheme.colors,
          primary: colors.primary,
          error: colors.error,
          onSurface: colors.text,
          onSurfaceVariant: colors.textSecondary,
          outline: colors.border,
          background: colors.surface,
          surface: colors.surface,
        },
      }),
      [colors, paperTheme],
    );
    const wrapperRef = useRef<View>(null);
    const innerRef = useRef<PaperTextInputRef>(null);
    const formFieldRef = useRef<FormFieldHandle>({
      focus: () => {
        innerRef.current?.focus();
      },
      measureInWindow: callback => {
        wrapperRef.current?.measureInWindow(callback);
      },
    });

    useImperativeHandle(forwardedRef, () => innerRef.current as PaperTextInputRef);

    const focusProps = useFormInputFocus(formFieldRef);

    const handleFocus: TextInputProps['onFocus'] = event => {
      onFocus?.(event);
      focusProps.onFocus();
    };

    const handleSubmitEditing: TextInputProps['onSubmitEditing'] = event => {
      onSubmitEditing?.(event);
      if (!multiline) {
        focusProps.onSubmitEditing();
      }
    };

    const keepLatinDirection = Boolean(secureTextEntry) || isLatinKeyboard(keyboardType);
    const textAlign = keepLatinDirection || !isRTL ? 'left' : 'right';
    const writingDirection = keepLatinDirection || !isRTL ? 'ltr' : 'rtl';
    const errorText = error && isTranslationKey(error) ? t(error) : error;
    const resolvedPlaceholder = placeholder ?? (typeof label === 'string' ? label : undefined);

    return (
      <View ref={wrapperRef} collapsable={false} style={[styles.field, containerStyle]}>
        <FieldLabel
          label={typeof label === 'string' ? label : undefined}
          required={required}
          optional={optional}
        />
        <TextInput
          ref={(instance: PaperTextInputRef | null) => {
            innerRef.current = instance;
          }}
          mode={mode}
          error={!!error}
          placeholder={resolvedPlaceholder}
          accessibilityLabel={typeof label === 'string' ? label : resolvedPlaceholder}
          outlineColor={error ? colors.error : colors.border}
          activeOutlineColor={error ? colors.error : colors.primary}
          textColor={colors.text}
          placeholderTextColor={colors.textSecondary}
          cursorColor={colors.primary}
          selectionColor={colors.primaryMuted}
          theme={inputTheme}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          {...props}
          value={value ?? ''}
          style={[styles.input, { backgroundColor: colors.surface }, style]}
          contentStyle={[
            styles.content,
            { textAlign, writingDirection },
            multiline && styles.multiline,
          ]}
          returnKeyType={
            (returnKeyType ?? (multiline ? undefined : focusProps.returnKeyType)) as
              | ReturnKeyTypeOptions
              | undefined
          }
          blurOnSubmit={blurOnSubmit ?? (multiline ? false : focusProps.blurOnSubmit)}
          onFocus={handleFocus}
          onSubmitEditing={handleSubmitEditing}
        />
        {errorText ? (
          <HelperText
            type="error"
            visible={!!errorText}
            padding="none"
            theme={inputTheme}
            style={[styles.helper, { color: colors.error, textAlign, writingDirection }]}>
            {errorText}
          </HelperText>
        ) : null}
      </View>
    );
  },
) as React.ForwardRefExoticComponent<CustomInputProps & React.RefAttributes<PaperTextInputRef>> & {
  Icon: typeof TextInput.Icon;
};

CustomInput.displayName = 'CustomInput';
CustomInput.Icon = TextInput.Icon;

const styles = StyleSheet.create({
  field: {
    marginBottom: spacing.md,
  },
  input: {
    borderRadius: borderRadius.md,
  },
  content: {
    paddingHorizontal: spacing.sm,
  },
  multiline: {
    minHeight: 88,
    paddingTop: spacing.sm,
    textAlignVertical: 'top',
  },
  helper: {
    marginTop: spacing.xs,
    marginBottom: 0,
    paddingHorizontal: 0,
  },
});
