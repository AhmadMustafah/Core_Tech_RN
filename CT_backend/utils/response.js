const success = (res, data, message = 'OK', status = 200, extra = {}) =>
  res.status(status).json({ success: true, message, data, ...extra });

const created = (res, data, message = 'Created') => success(res, data, message, 201);

module.exports = { success, created };
