const { validationResult } = require('express-validator');
const { ApiError } = require('../utils/apiError');

const validate = (req, _res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const details = errors.array().map((item) => ({
    field: item.path,
    message: item.msg,
  }));
  next(new ApiError(400, details[0]?.message || 'Validation failed', details));
};

module.exports = { validate };
