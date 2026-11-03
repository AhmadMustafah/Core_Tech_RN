const { body, param, query } = require('express-validator');
const { UNITS } = require('../models/Product');

const mongoId = (field = 'id') => param(field).isMongoId().withMessage('Invalid id');

const passwordRule = (field = 'password') =>
  body(field)
    .isLength({ min: 8, max: 64 })
    .withMessage('Password must be 8-64 characters')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage('Password must include a letter and a number');

const productRules = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Product name is required'),
  body('sku').trim().isLength({ min: 2, max: 30 }).withMessage('SKU is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('unit').optional().isIn(UNITS).withMessage('Invalid unit'),
  body('price').isFloat({ min: 0 }).withMessage('Selling price is required'),
  body('costPrice').isFloat({ min: 0 }).withMessage('Cost price is required'),
  body('stockQuantity').isInt({ min: 0 }).withMessage('Stock quantity is required'),
  body('lowStockThreshold').isInt({ min: 0 }).withMessage('Low stock threshold is required'),
  body('description').optional().isLength({ max: 500 }),
];

const productUpdateRules = [
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('sku').optional().trim().isLength({ min: 2, max: 30 }),
  body('category').optional().trim().notEmpty(),
  body('unit').optional().isIn(UNITS),
  body('price').optional().isFloat({ min: 0 }),
  body('costPrice').optional().isFloat({ min: 0 }),
  body('lowStockThreshold').optional().isInt({ min: 0 }),
  body('description').optional().isLength({ max: 500 }),
];

const partyRules = [
  body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('company').optional().isLength({ max: 100 }),
  body('address').optional().isLength({ max: 200 }),
];

const saleRules = [
  body('customerId').isMongoId().withMessage('Please select a customer'),
  body('items').isArray({ min: 1 }).withMessage('Please add at least one product'),
  body('items.*.productId').isMongoId(),
  body('items.*.quantity').isInt({ min: 1 }),
  body('items.*.price').optional().isFloat({ min: 0 }),
  body('paymentStatus').optional().isIn(['paid', 'pending', 'partial']),
];

const saleUpdateRules = [body('paymentStatus').isIn(['paid', 'pending', 'partial'])];

const purchaseRules = [
  body('supplierId').isMongoId().withMessage('Please select a supplier'),
  body('items').isArray({ min: 1 }).withMessage('Please add at least one product'),
  body('items.*.productId').isMongoId(),
  body('items.*.quantity').isInt({ min: 1 }),
  body('items.*.purchasePrice').optional().isFloat({ min: 0 }),
  body('status').optional().isIn(['pending', 'received']),
];

const listQuery = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];

const userRules = [
  body('name').trim().isLength({ min: 2, max: 80 }),
  body('email').isEmail().normalizeEmail(),
  body('role').optional().isIn(['admin', 'manager', 'staff', 'accountant']),
  passwordRule('password'),
];

const categoryRules = [body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Category name is required')];

const adjustRules = [
  body('productId').isMongoId().withMessage('Product is required'),
  body('direction').isIn(['in', 'out']),
  body('quantity').isInt({ min: 1 }),
  body('note').optional().isLength({ max: 200 }),
];

module.exports = {
  mongoId,
  productRules,
  productUpdateRules,
  partyRules,
  saleRules,
  saleUpdateRules,
  purchaseRules,
  listQuery,
  userRules,
  categoryRules,
  adjustRules,
  passwordRule,
};
