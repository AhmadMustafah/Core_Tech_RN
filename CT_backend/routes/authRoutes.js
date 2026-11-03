const express = require('express');
const { auth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimits');
const authController = require('../controllers/authController');
const {
  registerRules,
  loginRules,
  refreshRules,
  forgotRules,
  otpRules,
  resetRules,
  changePasswordRules,
  profileRules,
} = require('../validators/authValidators');

const router = express.Router();

router.post('/register', authLimiter, registerRules, validate, authController.register);
router.post('/login', authLimiter, loginRules, validate, authController.login);
router.post('/logout', authController.logout);
router.post('/refresh', authLimiter, refreshRules, validate, authController.refresh);
router.post('/forgot-password', authLimiter, forgotRules, validate, authController.forgotPassword);
router.post('/verify-otp', authLimiter, otpRules, validate, authController.verifyOtp);
router.post('/reset-password', authLimiter, resetRules, validate, authController.resetPassword);
router.get('/me', auth, authController.me);
router.get('/profile', auth, authController.me);
router.put('/profile', auth, profileRules, validate, authController.updateProfile);
router.post('/change-password', auth, changePasswordRules, validate, authController.changePassword);

module.exports = router;
