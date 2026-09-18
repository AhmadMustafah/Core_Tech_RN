import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { getPasswordStrength } from '@/utils/passwordSecurity';
import type { TranslationKey } from '@/localization';
import { spacing } from '@/theme';

interface PasswordStrengthIndicatorProps {
  password: string;
}

const CHECK_KEYS: Record<string, TranslationKey> = {
  minLength: 'password.minLength',
  hasUppercase: 'password.hasUppercase',
  hasLowercase: 'password.hasLowercase',
  hasNumber: 'password.hasNumber',
  hasSpecialChar: 'password.hasSpecialChar',
  notCommon: 'password.notCommon',
  noSpaces: 'password.noSpaces',
};

const STRENGTH_KEYS = {
  Weak: 'password.weak',
  Fair: 'password.fair',
  Good: 'password.good',
  Strong: 'password.strong',
} as const;

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
}) => {
  const { colors } = useAppTheme();
  const { t, directionStyle } = useLocalization();

  if (!password) return null;

  const { checks, label, isSecure } = getPasswordStrength(password);
  const strengthColor = isSecure
    ? colors.success
    : label === 'Fair' || label === 'Good'
      ? colors.warning
      : colors.error;

  return (
    <View style={styles.container}>
      <Text variant="labelSmall" style={[{ color: colors.textSecondary, marginBottom: spacing.xs }, directionStyle]}>
        {t('password.strength')}:{' '}
        <Text style={{ color: strengthColor, fontWeight: '600' }}>{t(STRENGTH_KEYS[label])}</Text>
      </Text>
      {Object.entries(checks).map(([key, passed]) => (
        <Text
          key={key}
          variant="bodySmall"
          style={[
            {
              color: passed ? colors.success : colors.textSecondary,
              marginBottom: 2,
            },
            directionStyle,
          ]}>
          {passed ? '✓' : '○'} {t(CHECK_KEYS[key])}
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
