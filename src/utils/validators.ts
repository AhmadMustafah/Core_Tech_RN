import {
  getPasswordSecurityErrors,
  PASSWORD_RULES,
} from './passwordSecurity';

export type ValidationResult = string | true;

export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const phoneRegex = /^[+]?[\d\s-]{10,15}$/;
export const nameRegex = /^[a-zA-Z\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s.'-]{2,50}$/;
export const skuRegex = /^[a-zA-Z0-9_-]{2,30}$/;

export const sanitizeText = (value: string): string => value.trim();

export const sanitizeEmail = (value: string): string =>
  value.trim().toLowerCase();

export const validateEmail = (email: string): ValidationResult => {
  const value = sanitizeEmail(email);
  if (!value) return 'validation.emailRequired';
  if (value.length > 100) return 'validation.emailTooLong';
  if (!emailRegex.test(value)) return 'validation.emailInvalid';
  return true;
};

/** Used on login — checks presence and basic format only */
export const validateLoginPassword = (password: string): ValidationResult => {
  if (!password) return 'validation.passwordRequired';
  if (/\s/.test(password)) return 'validation.passwordNoSpaces';
  if (password.length < 6) return 'validation.passwordMinLogin';
  if (password.length > PASSWORD_RULES.maxLength) {
    return 'validation.passwordTooLong';
  }
  return true;
};

/** Used when creating or changing passwords — full security rules */
export const validateSecurePassword = (password: string): ValidationResult => {
  if (!password) return 'validation.passwordRequired';
  const errors = getPasswordSecurityErrors(password);
  return errors.length > 0 ? errors[0] : true;
};

/** @deprecated Use validateLoginPassword or validateSecurePassword */
export const validatePassword = validateLoginPassword;

export const validateConfirmPassword = (
  password: string,
  confirmPassword: string,
): ValidationResult => {
  if (!confirmPassword) return 'validation.confirmRequired';
  if (password !== confirmPassword) return 'validation.passwordMismatch';
  return true;
};

export const validatePhone = (phone: string): ValidationResult => {
  const value = sanitizeText(phone);
  if (!value) return 'validation.phoneRequired';
  if (!phoneRegex.test(value)) return 'validation.phoneInvalid';
  return true;
};

export const validateRequired = (
  value: string,
  _field: string,
  min = 1,
  max = 100,
): ValidationResult => {
  const trimmed = sanitizeText(value);
  if (!trimmed) return 'validation.numberRequired';
  if (trimmed.length < min) {
    return 'validation.nameMin';
  }
  if (trimmed.length > max) {
    return 'validation.nameMax';
  }
  return true;
};

export const validateName = (name: string, _field = 'Name'): ValidationResult => {
  const trimmed = sanitizeText(name);
  if (!trimmed) return 'validation.nameRequired';
  if (trimmed.length < 2) return 'validation.nameMin';
  if (trimmed.length > 50) return 'validation.nameMax';
  if (!nameRegex.test(trimmed)) {
    return 'validation.nameInvalid';
  }
  return true;
};

export const validateCompany = (company: string): ValidationResult => {
  const trimmed = sanitizeText(company);
  if (!trimmed) return 'validation.companyRequired';
  if (trimmed.length < 2) return 'validation.companyMin';
  if (trimmed.length > 100) return 'validation.companyMax';
  return true;
};

export const validateOptionalText = (
  value: string,
  _field: string,
  max = 200,
): ValidationResult => {
  const trimmed = sanitizeText(value);
  if (!trimmed) return true;
  if (trimmed.length > max) {
    return 'validation.textTooLong';
  }
  return true;
};

export const validateSku = (sku: string): ValidationResult => {
  const trimmed = sanitizeText(sku);
  if (!trimmed) return 'validation.skuRequired';
  if (trimmed.length < 2) return 'validation.skuMin';
  if (trimmed.length > 30) return 'validation.skuMax';
  if (!skuRegex.test(trimmed)) {
    return 'validation.skuInvalid';
  }
  return true;
};

export const validateProductName = (name: string): ValidationResult => {
  const trimmed = sanitizeText(name);
  if (!trimmed) return 'validation.productNameRequired';
  if (trimmed.length < 2) return 'validation.productNameMin';
  if (trimmed.length > 100) return 'validation.productNameMax';
  return true;
};

export const validatePositiveNumber = (
  value: string,
  _field: string,
  allowZero = false,
): ValidationResult => {
  const trimmed = sanitizeText(value);
  if (!trimmed) return 'validation.numberRequired';
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) {
    return 'validation.numberInvalid';
  }
  const num = parseFloat(trimmed);
  if (Number.isNaN(num)) return 'validation.numberInvalid';
  if (!allowZero && num <= 0) return 'validation.numberPositive';
  if (allowZero && num < 0) return 'validation.numberNegative';
  if (num > 999999999) return 'validation.numberTooLarge';
  return true;
};

export const validateInteger = (
  value: string,
  _field: string,
  min = 0,
  max = 999999,
): ValidationResult => {
  const trimmed = sanitizeText(value);
  if (!trimmed) return 'validation.integerRequired';
  if (!/^\d+$/.test(trimmed)) return 'validation.integerInvalid';
  const num = parseInt(trimmed, 10);
  if (num < min) return 'validation.integerMin';
  if (num > max) return 'validation.integerMax';
  return true;
};

export const validateOtp = (otp: string): ValidationResult => {
  const value = sanitizeText(otp);
  if (!value) return 'validation.otpRequired';
  if (!/^\d{6}$/.test(value)) return 'validation.otpInvalid';
  return true;
};

export const validateDescription = (description: string): ValidationResult => {
  return validateOptionalText(description, 'Description', 500);
};
