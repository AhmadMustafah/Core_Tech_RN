const { env } = require('../config/env');
const { ApiError } = require('../utils/apiError');
const { logger } = require('../utils/logger');

const notFound = (req, _res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.path}`));
};

const errorHandler = (err, req, res, _next) => {
  let status = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let details = err.details;

  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors)
      .map((item) => item.message)
      .join(', ');
  } else if (err.code === 11000) {
    status = 409;
    const fields = Object.keys(err.keyPattern || {});
    message = `Duplicate value for ${fields.join(', ') || 'field'}`;
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Invalid or expired token';
  } else if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid identifier';
  } else if (!err.statusCode) {
    status = 500;
    message = 'Internal server error';
  }

  const meta = {
    requestId: req.requestId,
    method: req.method,
    path: (req.originalUrl || '').split('?')[0],
    status,
    userId: req.user ? String(req.user._id) : undefined,
    message: err.message,
  };
  if (status >= 500) {
    logger.error('request failed', { ...meta, stack: env.nodeEnv === 'production' ? undefined : err.stack });
  } else {
    logger.warn('request failed', meta);
  }

  const payload = { success: false, message };
  if (details && status < 500) payload.details = details;
  res.status(status).json(payload);
};

module.exports = { notFound, errorHandler };
