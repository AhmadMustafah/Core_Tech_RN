const { env } = require('../config/env');

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const SENSITIVE = /password|passwd|token|secret|authorization|cookie|otp|refresh|mongo(?:db)?_uri|jwt/i;

const currentLevel = () => LEVELS[env.logLevel] ?? LEVELS.info;

const redactValue = (key, value) => {
  if (SENSITIVE.test(String(key))) return '[REDACTED]';
  if (typeof value === 'string' && value.startsWith('Bearer ')) return 'Bearer [REDACTED]';
  return value;
};

const redact = (meta) => {
  if (meta == null || typeof meta !== 'object') return meta;
  if (Array.isArray(meta)) return meta.map((item) => redact(item));
  const out = {};
  for (const [key, value] of Object.entries(meta)) {
    if (value && typeof value === 'object') out[key] = redactValue(key, value) === '[REDACTED]' ? '[REDACTED]' : redact(value);
    else out[key] = redactValue(key, value);
  }
  return out;
};

const write = (level, message, meta = {}) => {
  if ((LEVELS[level] ?? 2) > currentLevel()) return;
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    msg: message,
    ...redact(meta),
  });
  if (level === 'error') process.stderr.write(`${line}\n`);
  else process.stdout.write(`${line}\n`);
};

const logger = {
  error: (message, meta) => write('error', message, meta),
  warn: (message, meta) => write('warn', message, meta),
  info: (message, meta) => write('info', message, meta),
  debug: (message, meta) => write('debug', message, meta),
};

module.exports = { logger, redact };
