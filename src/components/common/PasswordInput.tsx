import React, { useState } from 'react';
import { CustomInput } from './CustomInput';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';

interface PasswordInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  error?: string;
  showStrength?: boolean;
  autoComplete?: 'password' | 'password-new' | 'current-password';
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  value,
  onChangeText,
  onBlur,
  error,
  showStrength = false,
  autoComplete = 'password',
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <CustomInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        secureTextEntry={!visible}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete={autoComplete}
        textContentType={autoComplete === 'password-new' ? 'newPassword' : 'password'}
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
      {showStrength && <PasswordStrengthIndicator password={value} />}
    </>
  );
};
