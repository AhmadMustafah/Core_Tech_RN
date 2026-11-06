const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { env } = require('../config/env');

const ACCESS_OPTIONS = { expiresIn: env.jwtAccessExpires, algorithm: 'HS256' };
const REFRESH_OPTIONS = { expiresIn: env.jwtRefreshExpires, algorithm: 'HS256' };
const VERIFY_OPTIONS = { algorithms: ['HS256'] };

const withJwtId = (payload) => ({ ...payload, jti: crypto.randomUUID() });

const signAccessToken = (payload) => jwt.sign(withJwtId(payload), env.jwtAccessSecret, ACCESS_OPTIONS);
const signRefreshToken = (payload) => jwt.sign(withJwtId(payload), env.jwtRefreshSecret, REFRESH_OPTIONS);

const verifyAccessToken = (token) => jwt.verify(token, env.jwtAccessSecret, VERIFY_OPTIONS);
const verifyRefreshToken = (token) => jwt.verify(token, env.jwtRefreshSecret, VERIFY_OPTIONS);

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const randomOtp = () => String(crypto.randomInt(100000, 1000000));

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
  randomOtp,
};
