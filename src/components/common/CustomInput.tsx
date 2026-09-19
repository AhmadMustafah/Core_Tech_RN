import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleSheet, View, ViewStyle, type ReturnKeyTypeOptions } from 'react-native';
import { Text, TextInput, TextInputProps, HelperText } from 'react-native-paper';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { isTranslationKey } from '@/localization';
import { useFormInputFocus, type FormFieldHandle } from './FormScrollView';
import { borderRadius, spacing } from '@/theme';

interface CustomInputProps extends Omit<TextInputProps, 'error'> {
  error?: string;
  containerStyle?: ViewStyle;
  required?: boolean;
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
      label,
      ...props
    },
    forwardedRef,
  ) => {
    const { colors } = useAppTheme();
    const { t, isRTL } = useLocalization();
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
      focusProps.onSubmitEditing();
    };

    const keepLatinDirection = Boolean(secureTextEntry) || isLatinKeyboard(keyboardType);
    const textAlign = keepLatinDirection || !isRTL ? 'left' : 'right';
    const writingDirection = keepLatinDirection || !isRTL ? 'ltr' : 'rtl';
    const errorText =
      error && isTranslationKey(error) ? t(error) : error;

    const renderedLabel =
      required && label ? (
        <Text>
          {label}
          <Text style={{ color: colors.error }}> *</Text>
        </Text>
      ) : (
        label
      );

    return (
      <View ref={wrapperRef} collapsable={false} style={[styles.field, containerStyle]}>
        <TextInput
          ref={(instance: PaperTextInputRef | null) => {
            innerRef.current = instance;
          }}
          mode={mode}
          error={!!error}
          label={renderedLabel}
          outlineColor={colors.border}
          activeOutlineColor={colors.primary}
          textColor={colors.text}
          placeholderTextColor={colors.textSecondary}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          {...props}
          style={[styles.input, { backgroundColor: colors.surface }, style]}
          contentStyle={[styles.content, { textAlign, writingDirection }]}
          returnKeyType={(returnKeyType ?? focusProps.returnKeyType) as ReturnKeyTypeOptions | undefined}
          blurOnSubmit={blurOnSubmit ?? focusProps.blurOnSubmit}
          onFocus={handleFocus}
          onSubmitEditing={handleSubmitEditing}
        />
        {errorText ? (
          <HelperText
            type="error"
            visible={!!errorText}
            style={[styles.helper, { textAlign, writingDirection }]}>
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
  helper: {
    marginTop: spacing.xs,
    marginBottom: 0,
  },
});
