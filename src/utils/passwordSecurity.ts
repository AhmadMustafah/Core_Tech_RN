export interface PasswordChecks {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  notCommon: boolean;
  noSpaces: boolean;
}

export interface PasswordStrength {
  score: number;
  checks: PasswordChecks;
  label: 'Weak' | 'Fair' | 'Good' | 'Strong';
  isSecure: boolean;
}

const COMMON_WEAK_PASSWORDS = [
  'password',
  'password123',
  '123456',
  '12345678',
  'qwerty',
  'admin',
  'letmein',
  'welcome',
  'iloveyou',
  '000000',
  'abc123',
  'admin123',
];

export const PASSWORD_RULES = {
  minLength: 8,
  maxLength: 64,
} as const;

export const getPasswordChecks = (password: string): PasswordChecks => ({
  minLength: password.length >= PASSWORD_RULES.minLength,
  hasUppercase: /[A-Z]/.test(password),
  hasLowercase: /[a-z]/.test(password),
  hasNumber: /\d/.test(password),
  hasSpecialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password),
  notCommon: !COMMON_WEAK_PASSWORDS.includes(password.toLowerCase()),
  noSpaces: !/\s/.test(password),
});

export const getPasswordStrength = (password: string): PasswordStrength => {
  const checks = getPasswordChecks(password);
  const passed = Object.values(checks).filter(Boolean).length;
  const score = passed;

  let label: PasswordStrength['label'] = 'Weak';
  if (score >= 6) label = 'Strong';
  else if (score >= 5) label = 'Good';
  else if (score >= 3) label = 'Fair';

  const isSecure = Object.values(checks).every(Boolean);

  return { score, checks, label, isSecure };
};

export const getPasswordSecurityErrors = (password: string): string[] => {
  const checks = getPasswordChecks(password);
  const errors: string[] = [];

  if (!checks.noSpaces) errors.push('validation.passwordNoSpaces');
  if (!checks.minLength) {
    errors.push('validation.passwordMinSecure');
  }
  if (password.length > PASSWORD_RULES.maxLength) {
    errors.push('validation.passwordTooLong');
  }
  if (!checks.hasUppercase) errors.push('validation.passwordUppercase');
  if (!checks.hasLowercase) errors.push('validation.passwordLowercase');
  if (!checks.hasNumber) errors.push('validation.passwordNumber');
  if (!checks.hasSpecialChar) errors.push('validation.passwordSpecial');
  if (!checks.notCommon) errors.push('validation.passwordCommon');

  return errors;
};
