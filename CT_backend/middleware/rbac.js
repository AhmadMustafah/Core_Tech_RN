const { ApiError } = require('../utils/apiError');

const ROLE_LEVEL = {
  staff: 1,
  accountant: 2,
  manager: 3,
  admin: 4,
};

const authorize = (...roles) => (req, _res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'Authentication required'));
  }
  if (!roles.includes(req.user.role)) {
    return next(new ApiError(403, 'You do not have permission to perform this action'));
  }
  next();
};

const minRole = (role) => (req, _res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'Authentication required'));
  }
  if ((ROLE_LEVEL[req.user.role] || 0) < ROLE_LEVEL[role]) {
    return next(new ApiError(403, 'You do not have permission to perform this action'));
  }
  next();
};

module.exports = { authorize, minRole };
