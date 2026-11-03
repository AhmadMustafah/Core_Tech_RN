const { logger } = require('../utils/logger');

const requestLogger = (req, res, next) => {
  const started = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - started) / 1e6;
    const path = (req.originalUrl || req.url || '').split('?')[0];
    logger.info('http', {
      requestId: req.requestId,
      method: req.method,
      path,
      status: res.statusCode,
      durationMs: Math.round(durationMs * 10) / 10,
      userId: req.user ? String(req.user._id) : undefined,
      businessId: req.businessId ? String(req.businessId) : undefined,
    });
  });

  next();
};

module.exports = { requestLogger };
