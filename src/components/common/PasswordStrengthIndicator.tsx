import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppTheme } from '@/hooks/useAppTheme';
import { getPasswordStrength } from '@/utils/passwordSecurity';
import { spacing } from '@/theme';

interface PasswordStrengthIndicatorProps {
  password: string;
}

const CHECK_LABELS: Record<string, string> = {
  minLength: 'At least 8 characters',
  hasUppercase: 'One uppercase letter',
  hasLowercase: 'One lowercase letter',
  hasNumber: 'One number',
  hasSpecialChar: 'One special character',
  notCommon: 'Not a common password',
  noSpaces: 'No spaces',
};

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
}) => {
  const { colors } = useAppTheme();

  if (!password) return null;

  const { checks, label, isSecure } = getPasswordStrength(password);
  const strengthColor = isSecure
    ? colors.success
    : label === 'Fair' || label === 'Good'
      ? colors.warning
      : colors.error;

  return (
    <View style={styles.container}>
      <Text variant="labelSmall" style={{ color: colors.textSecondary, marginBottom: spacing.xs }}>
        Password strength:{' '}
        <Text style={{ color: strengthColor, fontWeight: '600' }}>{label}</Text>
      </Text>
      {Object.entries(checks).map(([key, passed]) => (
        <Text
          key={key}
          variant="bodySmall"
          style={{
            color: passed ? colors.success : colors.textSecondary,
            marginBottom: 2,
          }}>
          {passed ? '✓' : '○'} {CHECK_LABELS[key]}
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
});
