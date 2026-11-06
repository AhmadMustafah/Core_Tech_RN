export interface PasswordChecks {
  minLength: boolean;
  noSpaces: boolean;
}

export interface PasswordStrength {
  score: number;
  checks: PasswordChecks;
  label: 'Weak' | 'Fair' | 'Good' | 'Strong';
  isSecure: boolean;
}

export const PASSWORD_RULES = {
  minLength: 6,
  maxLength: 64,
} as const;

export const getPasswordChecks = (password: string): PasswordChecks => ({
  minLength: password.length >= PASSWORD_RULES.minLength,
  noSpaces: !/\s/.test(password),
});

export const getPasswordStrength = (password: string): PasswordStrength => {
  const checks = getPasswordChecks(password);
  const lengthScore =
    password.length >= 12 ? 3 : password.length >= 8 ? 2 : password.length >= 6 ? 1 : 0;
  const score = lengthScore + (checks.noSpaces ? 1 : 0);
  let label: PasswordStrength['label'] = 'Weak';
  if (score >= 4) label = 'Strong';
  else if (score >= 3) label = 'Good';
  else if (score >= 2) label = 'Fair';

  return {
    score,
    checks,
    label,
    isSecure: checks.minLength && checks.noSpaces,
  };
};

export const getPasswordSecurityErrors = (password: string): string[] => {
  const checks = getPasswordChecks(password);
  const errors: string[] = [];
  if (!checks.noSpaces) errors.push('validation.passwordNoSpaces');
  if (!checks.minLength) errors.push('validation.passwordMinLogin');
  if (password.length > PASSWORD_RULES.maxLength) {
    errors.push('validation.passwordTooLong');
  }
  return errors;
};
