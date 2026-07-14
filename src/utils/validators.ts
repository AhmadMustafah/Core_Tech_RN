export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const phoneRegex = /^[+]?[\d\s-]{10,15}$/;

export const validateEmail = (email: string): string | true => {
  if (!email.trim()) return 'Email is required';
  if (!emailRegex.test(email)) return 'Enter a valid email address';
  return true;
};

export const validatePassword = (password: string): string | true => {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return true;
};

export const validatePhone = (phone: string): string | true => {
  if (!phone.trim()) return 'Phone number is required';
  if (!phoneRegex.test(phone)) return 'Enter a valid phone number';
  return true;
};

export const validateRequired = (value: string, field: string): string | true => {
  if (!value?.trim()) return `${field} is required`;
  return true;
};

export const validateConfirmPassword = (
  password: string,
  confirmPassword: string,
): string | true => {
  if (!confirmPassword) return 'Please confirm your password';
  if (password !== confirmPassword) return 'Passwords do not match';
  return true;
};

export const validateOtp = (otp: string): string | true => {
  if (!otp.trim()) return 'OTP is required';
  if (!/^\d{6}$/.test(otp)) return 'OTP must be 6 digits';
  return true;
};
