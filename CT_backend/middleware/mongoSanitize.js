const { isUnsafeKey } = require('../utils/sanitize');

const scrub = (value) => {
  if (Array.isArray(value)) {
    value.forEach(scrub);
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const key of Object.keys(value)) {
    if (isUnsafeKey(key)) {
      delete value[key];
      continue;
    }
    scrub(value[key]);
  }
};

const mongoSanitize = (req, _res, next) => {
  if (req.body) scrub(req.body);
  if (req.params) scrub(req.params);
  try {
    if (req.query) scrub(req.query);
  } catch (_error) {
    // Express may expose query as a getter
  }
  next();
};

module.exports = { mongoSanitize };
