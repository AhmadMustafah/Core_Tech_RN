const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

const isUnsafeKey = (key) =>
  FORBIDDEN_KEYS.has(key) || key.startsWith('$') || key.includes('.');

const sanitize = (value) => {
  if (Array.isArray(value)) {
    return value.map(sanitize);
  }
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    const out = {};
    for (const [key, nested] of Object.entries(value)) {
      if (isUnsafeKey(key)) continue;
      out[key] = sanitize(nested);
    }
    return out;
  }
  return value;
};

const pick = (source = {}, allowed = []) => {
  const clean = sanitize(source);
  const out = {};
  for (const key of allowed) {
    if (clean[key] !== undefined) out[key] = clean[key];
  }
  return out;
};

const stripTenantFields = (data = {}, { allowPasswordHash = false } = {}) => {
  const payload = sanitize(data);
  delete payload.businessId;
  delete payload._id;
  delete payload.id;
  if (!allowPasswordHash) delete payload.passwordHash;
  delete payload.tokenHash;
  delete payload.otpHash;
  delete payload.createdAt;
  delete payload.updatedAt;
  delete payload.__v;
  return payload;
};

module.exports = { sanitize, pick, stripTenantFields, isUnsafeKey };
