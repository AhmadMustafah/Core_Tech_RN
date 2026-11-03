process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.LOG_LEVEL = process.env.LOG_LEVEL || 'error';
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'test-access-secret-key-32chars!';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret-key-32chars';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ct_test';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { sanitize, pick, stripTenantFields } = require('../utils/sanitize');
const { parsePagination, searchRegex } = require('../utils/pagination');
const { redact } = require('../utils/logger');
const { authorize, minRole } = require('../middleware/rbac');

describe('sanitize', () => {
  it('strips operator and prototype keys', () => {
    const clean = sanitize({
      name: 'USB',
      $set: { businessId: 'other' },
      'price.min': 1,
      nested: { $gt: 0, ok: true },
    });
    assert.equal(clean.name, 'USB');
    assert.equal(clean.$set, undefined);
    assert.equal(clean['price.min'], undefined);
    assert.equal(clean.nested.$gt, undefined);
    assert.equal(clean.nested.ok, true);
  });

  it('pick and tenant strip block id takeover', () => {
    const picked = pick({ name: 'A', role: 'admin', extra: 1 }, ['name']);
    assert.deepEqual(picked, { name: 'A' });
    const stripped = stripTenantFields({
      name: 'A',
      businessId: 'victim',
      passwordHash: 'x',
      $set: { role: 'admin' },
    });
    assert.equal(stripped.businessId, undefined);
    assert.equal(stripped.passwordHash, undefined);
    assert.equal(stripped.$set, undefined);
    assert.equal(stripped.name, 'A');
  });
});

describe('pagination', () => {
  it('rejects sort field injection', () => {
    const { sort } = parsePagination({ sortBy: 'passwordHash', sort: 'asc' });
    assert.deepEqual(sort, { createdAt: 1 });
  });

  it('escapes regex search', () => {
    const regex = searchRegex('a+b(c)');
    assert.equal(regex.test('a+b(c)'), true);
    assert.equal(regex.source.includes('+'), true);
  });
});

describe('logger redact', () => {
  it('redacts tokens passwords and otp', () => {
    const out = redact({
      password: 'secret',
      refreshToken: 'abc',
      authorization: 'Bearer abc',
      userId: '1',
    });
    assert.equal(out.password, '[REDACTED]');
    assert.equal(out.refreshToken, '[REDACTED]');
    assert.equal(out.authorization, '[REDACTED]');
    assert.equal(out.userId, '1');
  });
});

describe('rbac', () => {
  const run = (mw, user) =>
    new Promise((resolve) => {
      const req = { user };
      mw(req, {}, (err) => resolve(err ? err.statusCode : 200));
    });

  it('blocks staff from manager routes', async () => {
    assert.equal(await run(minRole('manager'), { role: 'staff' }), 403);
    assert.equal(await run(minRole('manager'), { role: 'admin' }), 200);
  });

  it('authorize is exact-role', async () => {
    assert.equal(await run(authorize('admin'), { role: 'manager' }), 403);
    assert.equal(await run(authorize('admin'), { role: 'admin' }), 200);
  });
});
