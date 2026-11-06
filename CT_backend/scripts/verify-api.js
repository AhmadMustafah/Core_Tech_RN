/**
 * End-to-end verification against a running API.
 * Start the server first: npm start
 */
const BASE = process.env.API_BASE || 'http://localhost:5000/api';

const raw = async (method, path, { token, body, expectOk = true } = {}) => {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (expectOk && (!res.ok || json.success === false)) {
    throw new Error(`${method} ${path} -> ${res.status} ${json.message || JSON.stringify(json)}`);
  }
  return { status: res.status, json, headers: res.headers };
};

const request = async (method, path, opts = {}) => {
  const { json } = await raw(method, path, { ...opts, expectOk: true });
  return json;
};

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const assertNoSecret = (payload, label) => {
  const blob = JSON.stringify(payload);
  assert(!/passwordHash|otpHash|tokenHash/.test(blob), `${label} leaked a secret hash`);
};

const run = async () => {
  const stamp = Date.now();
  const email = `verify.${stamp}@coretech.test`;
  const password = 'abcdef';

  const unauth = await raw('GET', '/products', { expectOk: false });
  assert(unauth.status === 401, 'Unauthenticated products must be 401');
  assert(unauth.json.stack === undefined, 'Error must not leak stack');

  const health = await request('GET', '/health');
  assert(health.data?.status === 'ok', 'Health check failed');

  const weak = await raw('POST', '/auth/register', {
    body: { name: 'Weak', email: `w.${stamp}@coretech.test`, phone: '03001234567', company: 'W', password: 'abcde' },
    expectOk: false,
  });
  assert(weak.status === 400, '5-char password must be rejected');

  const registered = await request('POST', '/auth/register', {
    body: { name: 'Verify Owner', email, phone: '03001234567', company: `Verify Co ${stamp}`, password },
  });
  assertNoSecret(registered, 'register');
  let token = registered.data.tokens.accessToken;
  const refreshToken = registered.data.tokens.refreshToken;
  assert(registered.data.user.email === email, 'Register user mismatch');

  const login = await request('POST', '/auth/login', { body: { email, password } });
  assertNoSecret(login, 'login');
  token = login.data.tokens.accessToken;

  const me = await request('GET', '/auth/me', { token });
  assert(me.data.email === email, 'Current user mismatch');
  assertNoSecret(me, 'me');

  const profile = await request('PUT', '/auth/profile', { token, body: { name: 'Verify Owner Updated' } });
  assert(profile.data.name === 'Verify Owner Updated', 'Profile update failed');

  const refreshed = await request('POST', '/auth/refresh', { body: { refreshToken: login.data.tokens.refreshToken } });
  token = refreshed.data.tokens.accessToken;

  const reuse = await raw('POST', '/auth/refresh', {
    body: { refreshToken: login.data.tokens.refreshToken },
    expectOk: false,
  });
  assert(reuse.status === 401, 'Refresh token reuse must be rejected');

  const forgot = await request('POST', '/auth/forgot-password', { body: { email } });
  assert(forgot.data.otp === undefined && forgot.data.otpHash === undefined, 'Forgot password must not return OTP');

  const other = await request('POST', '/auth/register', {
    body: {
      name: 'Other Owner',
      email: `other.${stamp}@coretech.test`,
      phone: '03007654321',
      company: `Other Co ${stamp}`,
      password,
    },
  });
  const tokenB = other.data.tokens.accessToken;

  const customer = await request('POST', '/customers', {
    token,
    body: { name: 'Ali Hassan', email: `ali.${stamp}@mail.test`, phone: '03001112222', company: 'AH Traders' },
  });
  const supplier = await request('POST', '/suppliers', {
    token,
    body: { name: 'Tech Dist', email: `sup.${stamp}@mail.test`, phone: '03003334444', company: 'TD' },
  });
  const category = await request('POST', '/categories', { token, body: { name: `Cables ${stamp}` } });
  const product = await request('POST', '/products', {
    token,
    body: {
      name: 'USB Cable',
      sku: `USB-${stamp}`,
      category: category.data.name,
      unit: 'Piece',
      price: 1200,
      costPrice: 700,
      stockQuantity: 10,
      lowStockThreshold: 2,
    },
  });
  assert(product.data.stockQuantity === 10, 'Product stock seed failed');

  const isolated = await raw('GET', `/products/${product.data.id}`, { token: tokenB, expectOk: false });
  assert(isolated.status === 404, 'Tenant isolation failed');

  const massAssign = await request('PUT', `/products/${product.data.id}`, {
    token,
    body: { $set: { stockQuantity: 999 }, stockQuantity: 999, name: 'USB Cable Pro' },
  });
  assert(massAssign.data.name === 'USB Cable Pro', 'Product name update failed');
  assert(massAssign.data.stockQuantity === 10, 'stockQuantity must not be mass-assigned on PUT');

  await request('GET', '/products/categories', { token });
  await request('GET', '/products/units', { token });
  await request('GET', '/categories', { token });

  const sale = await request('POST', '/sales', {
    token,
    body: {
      customerId: customer.data.id,
      items: [{ productId: product.data.id, quantity: 2, price: 1200, discount: 0, tax: 0 }],
      discount: 0,
      tax: 0,
      paymentStatus: 'paid',
    },
  });
  const afterSale = await request('GET', `/products/${product.data.id}`, { token });
  assert(afterSale.data.stockQuantity === 8, `Sale did not decrement stock (got ${afterSale.data.stockQuantity})`);

  const paidUpdate = await request('PUT', `/sales/${sale.data.id}`, { token, body: { paymentStatus: 'pending' } });
  assert(paidUpdate.data.paymentStatus === 'pending', 'Sale payment update failed');

  const pendingPurchase = await request('POST', '/purchases', {
    token,
    body: {
      supplierId: supplier.data.id,
      items: [{ productId: product.data.id, quantity: 3, purchasePrice: 700 }],
      status: 'pending',
    },
  });
  const beforeReceive = await request('GET', `/products/${product.data.id}`, { token });
  assert(beforeReceive.data.stockQuantity === 8, 'Pending purchase must not change stock');
  await request('POST', `/purchases/${pendingPurchase.data.id}/receive`, { token });
  const afterReceive = await request('GET', `/products/${product.data.id}`, { token });
  assert(afterReceive.data.stockQuantity === 11, `Receive did not increment stock (got ${afterReceive.data.stockQuantity})`);

  const purchase = await request('POST', '/purchases', {
    token,
    body: {
      supplierId: supplier.data.id,
      items: [{ productId: product.data.id, quantity: 5, purchasePrice: 700 }],
      status: 'received',
    },
  });
  const afterPurchase = await request('GET', `/products/${product.data.id}`, { token });
  assert(afterPurchase.data.stockQuantity === 16, `Purchase did not increment stock (got ${afterPurchase.data.stockQuantity})`);

  await request('POST', '/inventory/adjust', {
    token,
    body: { productId: product.data.id, direction: 'in', quantity: 2, note: 'audit' },
  });
  const afterAdjust = await request('GET', `/products/${product.data.id}`, { token });
  assert(afterAdjust.data.stockQuantity === 18, `Adjust did not increment stock (got ${afterAdjust.data.stockQuantity})`);

  const summary = await request('GET', '/dashboard/summary', { token });
  assert(summary.data.totalSales >= 1, 'Dashboard sales count missing');
  await request('GET', '/dashboard/activities', { token });
  await request('GET', '/reports/sales', { token });
  await request('GET', '/reports/purchases', { token });
  await request('GET', '/reports/inventory', { token });
  await request('GET', '/settings', { token });
  await request('PUT', '/settings', { token, body: { themeMode: 'dark', language: 'en' } });
  await request('GET', '/notifications', { token });
  await request('POST', '/notifications/read-all', { token });
  await request('GET', '/inventory/movements', { token });
  await request('GET', '/transactions', { token });
  await request('GET', '/businesses/current', { token });
  await request('PUT', '/businesses/current', { token, body: { name: `Verify Co ${stamp}` } });
  await request('GET', '/users', { token });

  const staff = await request('POST', '/users', {
    token,
    body: { name: 'Staff User', email: `staff.${stamp}@coretech.test`, password, role: 'staff' },
  });
  assertNoSecret(staff, 'create user');
  const staffLogin = await request('POST', '/auth/login', {
    body: { email: `staff.${stamp}@coretech.test`, password },
  });
  const staffReports = await raw('GET', '/reports/sales', { token: staffLogin.data.tokens.accessToken, expectOk: false });
  assert(staffReports.status === 403, 'Staff must not read reports');
  const staffUsers = await raw('GET', '/users', { token: staffLogin.data.tokens.accessToken, expectOk: false });
  assert(staffUsers.status === 403, 'Staff must not list users');

  await request('DELETE', `/sales/${sale.data.id}`, { token });
  const afterSaleDelete = await request('GET', `/products/${product.data.id}`, { token });
  assert(afterSaleDelete.data.stockQuantity === 20, `Sale delete did not restore stock (got ${afterSaleDelete.data.stockQuantity})`);

  await request('PUT', `/customers/${customer.data.id}`, { token, body: { name: 'Ali Hassan 2', email: customer.data.email, phone: customer.data.phone } });
  await request('PUT', `/suppliers/${supplier.data.id}`, { token, body: { name: 'Tech Dist 2', email: supplier.data.email, phone: supplier.data.phone } });
  await request('DELETE', `/purchases/${purchase.data.id}`, { token });
  await request('DELETE', `/customers/${customer.data.id}`, { token });
  await request('DELETE', `/suppliers/${supplier.data.id}`, { token });
  await request('DELETE', `/products/${product.data.id}`, { token });

  const noTokenLogout = await raw('POST', '/auth/logout', { body: {}, expectOk: false });
  assert(noTokenLogout.status === 400, 'Logout without refresh token must be 400');
  await request('POST', '/auth/logout', { token, body: { refreshToken } });

  console.log('Verification passed: auth, CRUD, inventory, RBAC, tenant isolation, dashboard');
  console.log(`Test tenant email: ${email}`);
};

run().catch((error) => {
  console.error('Verification failed:', error.message);
  process.exit(1);
});
