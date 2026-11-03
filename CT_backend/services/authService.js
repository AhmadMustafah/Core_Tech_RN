const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Business = require('../models/Business');
const Settings = require('../models/Settings');
const Category = require('../models/Category');
const RefreshToken = require('../models/RefreshToken');
const PasswordReset = require('../models/PasswordReset');
const { ApiError } = require('../utils/apiError');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
  randomOtp,
} = require('../utils/tokens');
const { pick } = require('../utils/sanitize');
const { recordActivity, actorFrom } = require('./activityService');

const DEFAULT_CATEGORIES = [
  'Electronics',
  'Clothing',
  'Food & Beverages',
  'Office Supplies',
  'Hardware',
  'Other',
];

const userPayload = (user) => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
  phone: user.phone,
  company: user.company,
  avatar: user.avatar,
  role: user.roleLabel || user.role,
  createdAt: user.createdAt,
});

const revokeAllRefreshTokens = async (userId) => {
  await RefreshToken.updateMany({ userId, revokedAt: null }, { revokedAt: new Date() });
};

const issueTokens = async (user) => {
  const payload = { sub: String(user._id), businessId: String(user.businessId), role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  const decoded = verifyRefreshToken(refreshToken);

  await RefreshToken.create({
    userId: user._id,
    businessId: user.businessId,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(decoded.exp * 1000),
  });

  return { accessToken, refreshToken };
};

const register = async (body) => {
  const existing = await User.findOne({ email: body.email.toLowerCase() });
  if (existing) {
    throw new ApiError(409, 'Email is already registered');
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const [business] = await Business.create(
      [{ name: body.company, email: body.email, phone: body.phone, status: 'active' }],
      { session },
    );

    const passwordHash = await User.hashPassword(body.password);
    const [user] = await User.create(
      [
        {
          businessId: business._id,
          name: body.name,
          email: body.email,
          phone: body.phone,
          company: body.company,
          role: 'admin',
          passwordHash,
        },
      ],
      { session },
    );

    business.ownerId = user._id;
    await business.save({ session });

    await Settings.create([{ businessId: business._id }], { session });
    await Category.insertMany(
      DEFAULT_CATEGORIES.map((name) => ({ businessId: business._id, name })),
      { session },
    );

    await session.commitTransaction();
    const tokens = await issueTokens(user);
    await recordActivity(user.businessId, {
      type: 'auth',
      action: 'created',
      title: 'Account created',
      description: `${user.name} registered ${business.name}`,
      actor: actorFrom(user),
      entityType: 'auth',
      entityId: String(user._id),
    });
    return { user: userPayload(user), tokens };
  } catch (error) {
    try {
      await session.abortTransaction();
    } catch (_abortError) {
      // already aborted
    }
    throw error;
  } finally {
    session.endSession();
  }
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }
  if (!user.isActive) {
    throw new ApiError(403, 'Account is inactive');
  }
  const tokens = await issueTokens(user);
  await recordActivity(user.businessId, {
    type: 'auth',
    action: 'logged_in',
    title: 'Signed in',
    description: `${user.name} signed in`,
    actor: actorFrom(user),
    entityType: 'auth',
    entityId: String(user._id),
  });
  return { user: userPayload(user), tokens };
};

const logout = async (refreshToken) => {
  if (!refreshToken) return;
  await RefreshToken.updateOne({ tokenHash: hashToken(refreshToken), revokedAt: null }, { revokedAt: new Date() });
};

const refresh = async (refreshToken) => {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (_error) {
    throw new ApiError(401, 'Invalid refresh token');
  }

  const tokenHash = hashToken(refreshToken);
  const stored = await RefreshToken.findOneAndUpdate(
    { tokenHash, userId: payload.sub, revokedAt: null },
    { revokedAt: new Date() },
  );

  if (!stored) {
    const reused = await RefreshToken.findOne({ tokenHash, userId: payload.sub });
    if (reused) {
      await revokeAllRefreshTokens(payload.sub);
      throw new ApiError(401, 'Refresh token reuse detected');
    }
    throw new ApiError(401, 'Refresh token is revoked');
  }

  const user = await User.findById(payload.sub);
  if (!user || !user.isActive) {
    throw new ApiError(401, 'Account is inactive or not found');
  }
  const tokens = await issueTokens(user);
  return { user: userPayload(user), tokens };
};

const currentUser = async (user) => userPayload(user);

const updateProfile = async (user, body) => {
  const updates = pick(body, ['name', 'email', 'phone', 'company', 'avatar']);
  if (updates.email && updates.email !== user.email) {
    const taken = await User.findOne({ email: updates.email, _id: { $ne: user._id } });
    if (taken) throw new ApiError(409, 'Email is already registered');
  }
  Object.assign(user, updates);
  await user.save();
  return userPayload(user);
};

const changePassword = async (user, currentPassword, newPassword) => {
  const full = await User.findById(user._id).select('+passwordHash');
  if (!(await full.comparePassword(currentPassword))) {
    throw new ApiError(400, 'Current password is incorrect');
  }
  full.passwordHash = await User.hashPassword(newPassword);
  await full.save();
  await revokeAllRefreshTokens(user._id);
};

const forgotPassword = async (email) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return { sent: true };
  const otp = randomOtp();
  const otpHash = await bcrypt.hash(otp, 10);
  await PasswordReset.deleteMany({ email: user.email });
  await PasswordReset.create({
    email: user.email,
    otpHash,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });
  return { sent: true };
};

const verifyOtp = async (email, otp) => {
  const record = await PasswordReset.findOne({ email: email.toLowerCase() }).sort({ createdAt: -1 });
  if (!record || record.expiresAt < new Date()) {
    throw new ApiError(400, 'OTP expired or not found');
  }
  if (record.attempts >= 5) {
    throw new ApiError(429, 'Too many OTP attempts');
  }
  const ok = await bcrypt.compare(otp, record.otpHash);
  if (!ok) {
    record.attempts += 1;
    await record.save();
    throw new ApiError(400, 'Invalid OTP');
  }
  record.verified = true;
  await record.save();
  return { verified: true };
};

const resetPassword = async (email, otp, password) => {
  const verified = await verifyOtp(email, otp);
  if (!verified.verified) throw new ApiError(400, 'OTP not verified');
  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!user) throw new ApiError(404, 'User not found');
  user.passwordHash = await User.hashPassword(password);
  await user.save();
  await PasswordReset.deleteMany({ email: user.email });
  await revokeAllRefreshTokens(user._id);
};

module.exports = {
  register,
  login,
  logout,
  refresh,
  currentUser,
  updateProfile,
  changePassword,
  forgotPassword,
  verifyOtp,
  resetPassword,
  userPayload,
};
