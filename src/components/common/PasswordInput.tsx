import React, { useState } from 'react';
import { CustomInput } from './CustomInput';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';

interface PasswordInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  error?: string;
  showStrength?: boolean;
  autoComplete?: 'password' | 'password-new' | 'current-password';
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
  onSubmitEditing?: () => void;
  blurOnSubmit?: boolean;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  value,
  onChangeText,
  onBlur,
  onFocus,
  error,
  showStrength = false,
  autoComplete = 'password',
  returnKeyType,
  onSubmitEditing,
  blurOnSubmit,
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <CustomInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        onFocus={onFocus}
        secureTextEntry={!visible}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete={autoComplete}
        textContentType={autoComplete === 'password-new' ? 'newPassword' : 'password'}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        blurOnSubmit={blurOnSubmit}
        left={<CustomInput.Icon icon="lock-outline" />}
        right={
          <CustomInput.Icon
            icon={visible ? 'eye-off-outline' : 'eye-outline'}
            onPress={() => setVisible(prev => !prev)}
            forceTextInputFocus={false}
          />
        }
        error={error}
      />
      {showStrength ? <PasswordStrengthIndicator password={value} /> : null}
    </>
  );
};
