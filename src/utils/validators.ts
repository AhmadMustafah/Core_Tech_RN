import {
  getPasswordSecurityErrors,
  PASSWORD_RULES,
} from './passwordSecurity';

export type ValidationResult = string | true;

export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const phoneRegex = /^[+]?[\d\s-]{10,15}$/;
export const nameRegex = /^[a-zA-Z\s.'-]{2,50}$/;
export const skuRegex = /^[a-zA-Z0-9_-]{2,30}$/;

export const sanitizeText = (value: string): string => value.trim();

export const sanitizeEmail = (value: string): string =>
  value.trim().toLowerCase();

export const validateEmail = (email: string): ValidationResult => {
  const value = sanitizeEmail(email);
  if (!value) return 'Email is required';
  if (value.length > 100) return 'Email must not exceed 100 characters';
  if (!emailRegex.test(value)) return 'Enter a valid email address';
  return true;
};

/** Used on login — checks presence and basic format only */
export const validateLoginPassword = (password: string): ValidationResult => {
  if (!password) return 'Password is required';
  if (/\s/.test(password)) return 'Password must not contain spaces';
  if (password.length < 6) return 'Password must be at least 6 characters';
  if (password.length > PASSWORD_RULES.maxLength) {
    return `Password must not exceed ${PASSWORD_RULES.maxLength} characters`;
  }
  return true;
};

/** Used when creating or changing passwords — full security rules */
export const validateSecurePassword = (password: string): ValidationResult => {
  if (!password) return 'Password is required';
  const errors = getPasswordSecurityErrors(password);
  return errors.length > 0 ? errors[0] : true;
};

/** @deprecated Use validateLoginPassword or validateSecurePassword */
export const validatePassword = validateLoginPassword;

export const validateConfirmPassword = (
  password: string,
  confirmPassword: string,
): ValidationResult => {
  if (!confirmPassword) return 'Please confirm your password';
  if (password !== confirmPassword) return 'Passwords do not match';
  return true;
};

export const validatePhone = (phone: string): ValidationResult => {
  const value = sanitizeText(phone);
  if (!value) return 'Phone number is required';
  if (!phoneRegex.test(value)) return 'Enter a valid phone number (10-15 digits)';
  return true;
};

export const validateRequired = (
  value: string,
  field: string,
  min = 1,
  max = 100,
): ValidationResult => {
  const trimmed = sanitizeText(value);
  if (!trimmed) return `${field} is required`;
  if (trimmed.length < min) {
    return `${field} must be at least ${min} characters`;
  }
  if (trimmed.length > max) {
    return `${field} must not exceed ${max} characters`;
  }
  return true;
};

export const validateName = (name: string, field = 'Name'): ValidationResult => {
  const required = validateRequired(name, field, 2, 50);
  if (required !== true) return required;
  if (!nameRegex.test(sanitizeText(name))) {
    return `${field} can only contain letters, spaces, and .'-`;
  }
  return true;
};

export const validateCompany = (company: string): ValidationResult => {
  return validateRequired(company, 'Company', 2, 100);
};

export const validateOptionalText = (
  value: string,
  field: string,
  max = 200,
): ValidationResult => {
  const trimmed = sanitizeText(value);
  if (!trimmed) return true;
  if (trimmed.length > max) {
    return `${field} must not exceed ${max} characters`;
  }
  return true;
};

export const validateSku = (sku: string): ValidationResult => {
  const required = validateRequired(sku, 'SKU', 2, 30);
  if (required !== true) return required;
  if (!skuRegex.test(sanitizeText(sku))) {
    return 'SKU can only contain letters, numbers, hyphens, and underscores';
  }
  return true;
};

export const validateProductName = (name: string): ValidationResult => {
  return validateRequired(name, 'Product name', 2, 100);
};

export const validatePositiveNumber = (
  value: string,
  field: string,
  allowZero = false,
): ValidationResult => {
  const trimmed = sanitizeText(value);
  if (!trimmed) return `${field} is required`;
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) {
    return `${field} must be a valid number`;
  }
  const num = parseFloat(trimmed);
  if (Number.isNaN(num)) return `${field} must be a valid number`;
  if (!allowZero && num <= 0) return `${field} must be greater than 0`;
  if (allowZero && num < 0) return `${field} must not be negative`;
  if (num > 999999999) return `${field} is too large`;
  return true;
};

export const validateInteger = (
  value: string,
  field: string,
  min = 0,
  max = 999999,
): ValidationResult => {
  const trimmed = sanitizeText(value);
  if (!trimmed) return `${field} is required`;
  if (!/^\d+$/.test(trimmed)) return `${field} must be a whole number`;
  const num = parseInt(trimmed, 10);
  if (num < min) return `${field} must be at least ${min}`;
  if (num > max) return `${field} must not exceed ${max}`;
  return true;
};

export const validateOtp = (otp: string): ValidationResult => {
  const value = sanitizeText(otp);
  if (!value) return 'OTP is required';
  if (!/^\d{6}$/.test(value)) return 'OTP must be exactly 6 digits';
  return true;
};

export const validateDescription = (description: string): ValidationResult => {
  return validateOptionalText(description, 'Description', 500);
};
