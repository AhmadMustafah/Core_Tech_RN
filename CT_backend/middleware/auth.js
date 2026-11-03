const { ApiError } = require('../utils/apiError');
const { verifyAccessToken } = require('../utils/tokens');
const User = require('../models/User');
const Business = require('../models/Business');

const auth = async (req, _res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null;
    if (!token) {
      throw new ApiError(401, 'Authentication required');
    }

    const payload = verifyAccessToken(token);
    if (!payload?.sub) {
      throw new ApiError(401, 'Invalid or expired token');
    }

    const user = await User.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new ApiError(401, 'Account is inactive or not found');
    }

    const business = await Business.findById(user.businessId);
    if (!business || business.status === 'inactive') {
      throw new ApiError(403, 'Business account is inactive');
    }

    req.user = user;
    req.businessId = user.businessId;
    next();
  } catch (error) {
    next(error instanceof ApiError ? error : new ApiError(401, 'Invalid or expired token'));
  }
};

module.exports = { auth };
