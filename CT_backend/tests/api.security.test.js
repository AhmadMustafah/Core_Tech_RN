process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.LOG_LEVEL = process.env.LOG_LEVEL || 'error';

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { connectDb, disconnectDb } = require('../config/db');
const { app } = require('../app');

const unique = Date.now();

const registerBody = (suffix) => ({
  name: 'Owner',
  email: `audit.${suffix}.${unique}@coretech.test`,
  phone: '03001234567',
  company: `Audit ${suffix} ${unique}`,
  password: 'Password1!',
});

describe('API security', () => {
  before(async () => {
    await connectDb();
  });

  after(async () => {
    await disconnectDb();
  });

  it('health is public and sets request id', async () => {
    const res = await request(app).get('/api/health').expect(200);
    assert.equal(res.body.success, true);
    assert.ok(res.headers['x-request-id']);
  });

  it('rejects unauthenticated product list without leaking stack', async () => {
    const res = await request(app).get('/api/products').expect(401);
    assert.equal(res.body.success, false);
    assert.equal(res.body.stack, undefined);
  });

  it('isolates tenants, ignores stock mass-assignment, and enforces RBAC', async () => {
    const a = await request(app).post('/api/auth/register').send(registerBody('a')).expect(201);
    const b = await request(app).post('/api/auth/register').send(registerBody('b')).expect(201);
    const tokenA = a.body.data.tokens.accessToken;
    const tokenB = b.body.data.tokens.accessToken;

    const product = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        name: 'USB Cable',
        sku: `USB-${unique}`,
        category: 'Electronics',
        unit: 'Piece',
        price: 1200,
        costPrice: 700,
        stockQuantity: 10,
        lowStockThreshold: 2,
      })
      .expect(201);

    const productId = product.body.data.id;
    assert.equal(product.body.data.stockQuantity, 10);

    await request(app)
      .get(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(404);

    const injected = await request(app)
      .put(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ $set: { stockQuantity: 999 }, stockQuantity: 999, name: 'USB Cable Pro' })
      .expect(200);

    assert.equal(injected.body.data.name, 'USB Cable Pro');
    assert.equal(injected.body.data.stockQuantity, 10);

    const staff = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        name: 'Staff',
        email: `staff.${unique}@coretech.test`,
        password: 'Password1!',
        role: 'staff',
      })
      .expect(201);

    const staffLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: staff.body.data.email, password: 'Password1!' })
      .expect(200);

    await request(app)
      .delete(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${staffLogin.body.data.tokens.accessToken}`)
      .expect(403);

    await request(app)
      .delete(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(404);
  });

  it('does not return OTP or stack traces on forgot-password', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'nobody@coretech.test' })
      .expect(200);
    assert.equal(res.body.data.otp, undefined);
    assert.equal(res.body.stack, undefined);
    assert.equal(res.body.data.sent, true);
  });

  it('computes sale totals server-side and updates stock', async () => {
    const registered = await request(app).post('/api/auth/register').send(registerBody('sale')).expect(201);
    const token = registered.body.data.tokens.accessToken;
    const auth = { Authorization: `Bearer ${token}` };

    const customer = await request(app)
      .post('/api/customers')
      .set(auth)
      .send({ name: 'Ali Hassan', email: `ali.${unique}@mail.test`, phone: '03001112222' })
      .expect(201);

    const product = await request(app)
      .post('/api/products')
      .set(auth)
      .send({
        name: 'Mouse',
        sku: `MOU-${unique}`,
        category: 'Electronics',
        unit: 'Piece',
        price: 500,
        costPrice: 200,
        stockQuantity: 5,
        lowStockThreshold: 1,
      })
      .expect(201);

    const sale = await request(app)
      .post('/api/sales')
      .set(auth)
      .send({
        customerId: customer.body.data.id,
        items: [{ productId: product.body.data.id, quantity: 2, price: 500 }],
        totalAmount: 1,
        paymentStatus: 'paid',
      })
      .expect(201);

    assert.equal(sale.body.data.totalAmount, 1000);

    const after = await request(app).get(`/api/products/${product.body.data.id}`).set(auth).expect(200);
    assert.equal(after.body.data.stockQuantity, 3);

    const summary = await request(app).get('/api/dashboard/summary').set(auth).expect(200);
    assert.equal(summary.body.data.salesAmount, 1000);
    assert.equal(summary.body.data.totalSales, 1);
  });
});
