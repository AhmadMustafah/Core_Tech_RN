const express = require('express');
const { auth } = require('../middleware/auth');
const { authorize, minRole } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const {
  mongoId,
  productRules,
  productUpdateRules,
  partyRules,
  saleRules,
  saleUpdateRules,
  purchaseRules,
  userRules,
  categoryRules,
  adjustRules,
} = require('../validators/commonValidators');
const { products, customers, suppliers, categories, users, businesses, notifications, settings, inventory } = require('../controllers/entityController');
const { sales, purchases, dashboard, reports, transactions } = require('../controllers/opsController');
const authRoutes = require('./authRoutes');

const router = express.Router();

router.use('/auth', authRoutes);

router.get('/dashboard/summary', auth, dashboard.summary);
router.get('/dashboard/activities', auth, dashboard.activities);

router.get('/products/categories', auth, products.categories);
router.get('/products/units', auth, products.units);
router.get('/products', auth, products.list);
router.get('/products/:id', auth, mongoId(), validate, products.get);
router.post('/products', auth, minRole('staff'), productRules, validate, products.create);
router.put('/products/:id', auth, minRole('staff'), mongoId(), productUpdateRules, validate, products.update);
router.delete('/products/:id', auth, minRole('manager'), mongoId(), validate, products.remove);

router.get('/categories', auth, categories.list);
router.post('/categories', auth, minRole('manager'), categoryRules, validate, categories.create);
router.put('/categories/:id', auth, minRole('manager'), mongoId(), categoryRules, validate, categories.update);
router.delete('/categories/:id', auth, minRole('manager'), mongoId(), validate, categories.remove);

router.get('/inventory/movements', auth, inventory.movements);
router.post('/inventory/adjust', auth, minRole('manager'), adjustRules, validate, inventory.adjust);

router.get('/customers', auth, customers.list);
router.get('/customers/:id', auth, mongoId(), validate, customers.get);
router.post('/customers', auth, partyRules, validate, customers.create);
router.put('/customers/:id', auth, mongoId(), partyRules, validate, customers.update);
router.delete('/customers/:id', auth, minRole('manager'), mongoId(), validate, customers.remove);

router.get('/suppliers', auth, suppliers.list);
router.get('/suppliers/:id', auth, mongoId(), validate, suppliers.get);
router.post('/suppliers', auth, partyRules, validate, suppliers.create);
router.put('/suppliers/:id', auth, mongoId(), partyRules, validate, suppliers.update);
router.delete('/suppliers/:id', auth, minRole('manager'), mongoId(), validate, suppliers.remove);

router.get('/sales', auth, sales.list);
router.get('/sales/:id', auth, mongoId(), validate, sales.get);
router.post('/sales', auth, saleRules, validate, sales.create);
router.put('/sales/:id', auth, mongoId(), saleUpdateRules, validate, sales.update);
router.delete('/sales/:id', auth, minRole('manager'), mongoId(), validate, sales.remove);

router.get('/purchases', auth, purchases.list);
router.get('/purchases/:id', auth, mongoId(), validate, purchases.get);
router.post('/purchases', auth, purchaseRules, validate, purchases.create);
router.put('/purchases/:id', auth, minRole('staff'), mongoId(), validate, purchases.update);
router.post('/purchases/:id/receive', auth, minRole('staff'), mongoId(), validate, purchases.receive);
router.delete('/purchases/:id', auth, minRole('manager'), mongoId(), validate, purchases.remove);

router.get('/notifications', auth, notifications.list);
router.patch('/notifications/:id/read', auth, mongoId(), validate, notifications.markRead);
router.put('/notifications/:id/read', auth, mongoId(), validate, notifications.markRead);
router.post('/notifications/read-all', auth, notifications.markAllRead);

router.get('/reports/sales', auth, minRole('accountant'), reports.sales);
router.get('/reports/purchases', auth, minRole('accountant'), reports.purchases);
router.get('/reports/inventory', auth, minRole('accountant'), reports.inventory);

router.get('/settings', auth, settings.get);
router.put('/settings', auth, minRole('manager'), settings.update);

router.get('/users', auth, authorize('admin', 'manager'), users.list);
router.get('/users/:id', auth, authorize('admin', 'manager'), mongoId(), validate, users.get);
router.post('/users', auth, authorize('admin'), userRules, validate, users.create);
router.put('/users/:id', auth, authorize('admin'), mongoId(), validate, users.update);
router.delete('/users/:id', auth, authorize('admin'), mongoId(), validate, users.remove);

router.get('/businesses/current', auth, businesses.get);
router.put('/businesses/current', auth, authorize('admin'), businesses.update);

router.get('/transactions', auth, transactions.list);

module.exports = router;
