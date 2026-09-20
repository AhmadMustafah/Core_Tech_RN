import {
  getPasswordSecurityErrors,
  PASSWORD_RULES,
} from './passwordSecurity';

export type ValidationResult = string | true;

export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const phoneRegex = /^[+]?[\d\s-]{10,15}$/;
export const nameRegex = /^[a-zA-Z\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s.'-]{2,50}$/;
export const skuRegex = /^[a-zA-Z0-9_-]{2,30}$/;

export const sanitizeText = (value?: string | null): string =>
  (value ?? '').trim();

export const sanitizeEmail = (value?: string | null): string =>
  (value ?? '').trim().toLowerCase();

export const isBlankValue = (value?: string | null): boolean =>
  sanitizeText(value) === '';

export const requiredField = (
  value?: string | null,
  message: string = 'validation.required',
): ValidationResult => (isBlankValue(value) ? message : true);

export const withRequiredCheck = (
  validator: (value: string) => ValidationResult,
  message: string = 'validation.required',
) => (value?: string | null): ValidationResult => {
  const required = requiredField(value, message);
  if (required !== true) {
    return required;
  }
  return validator(value ?? '');
};

export const validateEmail = (email: string): ValidationResult => {
  const required = requiredField(email, 'validation.emailRequired');
  if (required !== true) return required;
  const value = sanitizeEmail(email);
  if (value.length > 100) return 'validation.emailTooLong';
  if (!emailRegex.test(value)) return 'validation.emailInvalid';
  return true;
};

/** Used on login — checks presence and basic format only */
export const validateLoginPassword = (password?: string | null): ValidationResult => {
  if (isBlankValue(password)) return 'validation.passwordRequired';
  const value = password ?? '';
  if (/\s/.test(value)) return 'validation.passwordNoSpaces';
  if (value.length < 6) return 'validation.passwordMinLogin';
  if (value.length > PASSWORD_RULES.maxLength) {
    return 'validation.passwordTooLong';
  }
  return true;
};

/** Used when creating or changing passwords — full security rules */
export const validateSecurePassword = (password?: string | null): ValidationResult => {
  if (isBlankValue(password)) return 'validation.passwordRequired';
  const errors = getPasswordSecurityErrors(password ?? '');
  return errors.length > 0 ? errors[0] : true;
};

/** @deprecated Use validateLoginPassword or validateSecurePassword */
export const validatePassword = validateLoginPassword;

export const validateConfirmPassword = (
  password?: string | null,
  confirmPassword?: string | null,
): ValidationResult => {
  if (isBlankValue(confirmPassword)) return 'validation.confirmRequired';
  if (password !== confirmPassword) return 'validation.passwordMismatch';
  return true;
};

export const validatePhone = (phone: string): ValidationResult => {
  const required = requiredField(phone, 'validation.phoneRequired');
  if (required !== true) return required;
  const value = sanitizeText(phone);
  if (!phoneRegex.test(value)) return 'validation.phoneInvalid';
  return true;
};

export const validateRequired = (
  value: string,
  _field: string,
  min = 1,
  max = 100,
): ValidationResult => {
  const required = requiredField(value, 'validation.numberRequired');
  if (required !== true) return required;
  const trimmed = sanitizeText(value);
  if (trimmed.length < min) {
    return 'validation.nameMin';
  }
  if (trimmed.length > max) {
    return 'validation.nameMax';
  }
  return true;
};

export const validateName = (name: string, _field = 'Name'): ValidationResult => {
  const required = requiredField(name, 'validation.nameRequired');
  if (required !== true) return required;
  const trimmed = sanitizeText(name);
  if (trimmed.length < 2) return 'validation.nameMin';
  if (trimmed.length > 50) return 'validation.nameMax';
  if (!nameRegex.test(trimmed)) {
    return 'validation.nameInvalid';
  }
  return true;
};

export const validateCompany = (company: string): ValidationResult => {
  const required = requiredField(company, 'validation.companyRequired');
  if (required !== true) return required;
  const trimmed = sanitizeText(company);
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
  const required = requiredField(sku, 'validation.skuRequired');
  if (required !== true) return required;
  const trimmed = sanitizeText(sku);
  if (trimmed.length < 2) return 'validation.skuMin';
  if (trimmed.length > 30) return 'validation.skuMax';
  if (!skuRegex.test(trimmed)) {
    return 'validation.skuInvalid';
  }
  return true;
};

export const validateProductName = (name: string): ValidationResult => {
  const required = requiredField(name, 'validation.productNameRequired');
  if (required !== true) return required;
  const trimmed = sanitizeText(name);
  if (trimmed.length < 2) return 'validation.productNameMin';
  if (trimmed.length > 100) return 'validation.productNameMax';
  return true;
};

export const validatePositiveNumber = (
  value: string,
  _field: string,
  allowZero = false,
): ValidationResult => {
  const required = requiredField(value, 'validation.numberRequired');
  if (required !== true) return required;
  const trimmed = sanitizeText(value);
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
  const required = requiredField(value, 'validation.integerRequired');
  if (required !== true) return required;
  const trimmed = sanitizeText(value);
  if (!/^\d+$/.test(trimmed)) return 'validation.integerInvalid';
  const num = parseInt(trimmed, 10);
  if (num < min) return 'validation.integerMin';
  if (num > max) return 'validation.integerMax';
  return true;
};

export const validateOtp = (otp: string): ValidationResult => {
  const required = requiredField(otp, 'validation.otpRequired');
  if (required !== true) return required;
  const value = sanitizeText(otp);
  if (!/^\d{6}$/.test(value)) return 'validation.otpInvalid';
  return true;
};

export const validateDescription = (description: string): ValidationResult => {
  return validateOptionalText(description, 'Description', 500);
};
