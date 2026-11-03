const { asyncHandler } = require('../utils/asyncHandler');
const { success, created } = require('../utils/response');
const authService = require('../services/authService');

const register = asyncHandler(async (req, res) => {
  const data = await authService.register(req.body);
  created(res, data, 'Account created');
});

const login = asyncHandler(async (req, res) => {
  const data = await authService.login(req.body);
  success(res, data, 'Signed in');
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  success(res, null, 'Signed out');
});

const refresh = asyncHandler(async (req, res) => {
  const data = await authService.refresh(req.body.refreshToken);
  success(res, data, 'Token refreshed');
});

const me = asyncHandler(async (req, res) => {
  success(res, await authService.currentUser(req.user));
});

const updateProfile = asyncHandler(async (req, res) => {
  success(res, await authService.updateProfile(req.user, req.body), 'Profile updated');
});

const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.user, req.body.currentPassword, req.body.newPassword);
  success(res, null, 'Password changed');
});

const forgotPassword = asyncHandler(async (req, res) => {
  const data = await authService.forgotPassword(req.body.email);
  success(res, data, 'If the email exists, an OTP was sent');
});

const verifyOtp = asyncHandler(async (req, res) => {
  success(res, await authService.verifyOtp(req.body.email, req.body.otp), 'OTP verified');
});

const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body.email, req.body.otp, req.body.password);
  success(res, null, 'Password reset');
});

module.exports = {
  register,
  login,
  logout,
  refresh,
  me,
  updateProfile,
  changePassword,
  forgotPassword,
  verifyOtp,
  resetPassword,
};
