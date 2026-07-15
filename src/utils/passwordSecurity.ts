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

  if (!checks.noSpaces) errors.push('Password must not contain spaces');
  if (!checks.minLength) {
    errors.push(`Password must be at least ${PASSWORD_RULES.minLength} characters`);
  }
  if (password.length > PASSWORD_RULES.maxLength) {
    errors.push(`Password must not exceed ${PASSWORD_RULES.maxLength} characters`);
  }
  if (!checks.hasUppercase) errors.push('Include at least one uppercase letter');
  if (!checks.hasLowercase) errors.push('Include at least one lowercase letter');
  if (!checks.hasNumber) errors.push('Include at least one number');
  if (!checks.hasSpecialChar) errors.push('Include at least one special character');
  if (!checks.notCommon) errors.push('This password is too common. Choose a stronger one');

  return errors;
};
