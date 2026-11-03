const { body } = require('express-validator');
const { passwordRule } = require('./commonValidators');

const registerRules = [
  body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').trim().isLength({ min: 10, max: 20 }).withMessage('Phone number is required'),
  body('company').trim().isLength({ min: 2, max: 120 }).withMessage('Company is required'),
  passwordRule('password'),
];

const loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const refreshRules = [body('refreshToken').notEmpty().withMessage('Refresh token is required')];

const forgotRules = [body('email').isEmail().normalizeEmail().withMessage('Valid email is required')];

const otpRules = [
  body('email').isEmail().normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
];

const resetRules = [...otpRules, passwordRule('password')];

const changePasswordRules = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  passwordRule('newPassword'),
];

const profileRules = [
  body('name').optional().trim().isLength({ min: 2, max: 80 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().trim().isLength({ min: 10, max: 20 }),
  body('company').optional().trim().isLength({ min: 2, max: 120 }),
];

module.exports = {
  registerRules,
  loginRules,
  refreshRules,
  forgotRules,
  otpRules,
  resetRules,
  changePasswordRules,
  profileRules,
};
