/**
 * End-to-end verification against a running API.
 * Start the server first: npm start
 */
const BASE = process.env.API_BASE || 'http://localhost:5000/api';

const request = async (method, path, { token, body } = {}) => {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    throw new Error(`${method} ${path} -> ${res.status} ${json.message || JSON.stringify(json)}`);
  }
  return json;
};

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const run = async () => {
  const stamp = Date.now();
  const email = `verify.${stamp}@coretech.test`;
  const password = 'VerifyPass1!';

  const health = await request('GET', '/health');
  assert(health.data?.status === 'ok', 'Health check failed');

  const registered = await request('POST', '/auth/register', {
    body: {
      name: 'Verify Owner',
      email,
      phone: '03001234567',
      company: `Verify Co ${stamp}`,
      password,
    },
  });
  let token = registered.data.tokens.accessToken;
  const refreshToken = registered.data.tokens.refreshToken;
  assert(registered.data.user.email === email, 'Register user mismatch');

  const login = await request('POST', '/auth/login', { body: { email, password } });
  token = login.data.tokens.accessToken;

  const me = await request('GET', '/auth/me', { token });
  assert(me.data.email === email, 'Current user mismatch');

  const refreshed = await request('POST', '/auth/refresh', { body: { refreshToken: login.data.tokens.refreshToken } });
  token = refreshed.data.tokens.accessToken;

  const customer = await request('POST', '/customers', {
    token,
    body: { name: 'Ali Hassan', email: `ali.${stamp}@mail.test`, phone: '03001112222', company: 'AH Traders' },
  });
  const supplier = await request('POST', '/suppliers', {
    token,
    body: { name: 'Tech Dist', email: `sup.${stamp}@mail.test`, phone: '03003334444', company: 'TD' },
  });
  const product = await request('POST', '/products', {
    token,
    body: {
      name: 'USB Cable',
      sku: `USB-${stamp}`,
      category: 'Electronics',
      unit: 'Piece',
      price: 1200,
      costPrice: 700,
      stockQuantity: 10,
      lowStockThreshold: 2,
    },
  });
  assert(product.data.stockQuantity === 10, 'Product stock seed failed');

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

  const purchase = await request('POST', '/purchases', {
    token,
    body: {
      supplierId: supplier.data.id,
      items: [{ productId: product.data.id, quantity: 5, purchasePrice: 700 }],
      status: 'received',
    },
  });
  const afterPurchase = await request('GET', `/products/${product.data.id}`, { token });
  assert(afterPurchase.data.stockQuantity === 13, `Purchase did not increment stock (got ${afterPurchase.data.stockQuantity})`);

  const summary = await request('GET', '/dashboard/summary', { token });
  assert(summary.data.totalSales >= 1, 'Dashboard sales count missing');
  assert(summary.data.salesAmount === sale.data.totalAmount, 'Dashboard salesAmount does not match sale total');
  assert(summary.data.purchasesAmount === purchase.data.totalAmount, 'Dashboard purchasesAmount does not match purchase total');

  await request('GET', '/reports/sales', { token });
  await request('GET', '/settings', { token });
  await request('GET', '/notifications', { token });
  await request('GET', '/inventory/movements', { token });
  await request('GET', '/businesses/current', { token });
  await request('GET', '/users', { token });

  await request('DELETE', `/sales/${sale.data.id}`, { token });
  const afterSaleDelete = await request('GET', `/products/${product.data.id}`, { token });
  assert(afterSaleDelete.data.stockQuantity === 15, `Sale delete did not restore stock (got ${afterSaleDelete.data.stockQuantity})`);

  await request('POST', '/auth/logout', { token, body: { refreshToken } });

  console.log('Verification passed:');
  console.log('- MongoDB-backed auth, CRUD, inventory, dashboard totals');
  console.log(`- Test user: ${email}`);
};

run().catch((error) => {
  console.error('Verification failed:', error.message);
  process.exit(1);
});
