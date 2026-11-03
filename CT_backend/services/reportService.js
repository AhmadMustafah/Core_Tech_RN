const mongoose = require('mongoose');
const Sale = require('../models/Sale');
const Purchase = require('../models/Purchase');
const Product = require('../models/Product');

const dateMatch = (businessId, query) => {
  const match = { businessId: new mongoose.Types.ObjectId(String(businessId)) };
  if (query.from || query.to) {
    match.createdAt = {};
    if (query.from) match.createdAt.$gte = new Date(query.from);
    if (query.to) match.createdAt.$lte = new Date(query.to);
  }
  return match;
};

const salesReport = async (businessId, query) => {
  const match = dateMatch(businessId, query);
  const [totals, byStatus, topProducts] = await Promise.all([
    Sale.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          amount: { $sum: '$totalAmount' },
          discount: { $sum: '$discount' },
          tax: { $sum: '$tax' },
        },
      },
    ]),
    Sale.aggregate([
      { $match: match },
      { $group: { _id: '$paymentStatus', count: { $sum: 1 }, amount: { $sum: '$totalAmount' } } },
    ]),
    Sale.aggregate([
      { $match: match },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          productName: { $first: '$items.productName' },
          quantity: { $sum: '$items.quantity' },
          amount: { $sum: '$items.total' },
        },
      },
      { $sort: { amount: -1 } },
      { $limit: 10 },
    ]),
  ]);

  return {
    totals: totals[0] || { count: 0, amount: 0, discount: 0, tax: 0 },
    byStatus,
    topProducts,
  };
};

const purchasesReport = async (businessId, query) => {
  const match = dateMatch(businessId, query);
  const totals = await Purchase.aggregate([
    { $match: match },
    { $group: { _id: null, count: { $sum: 1 }, amount: { $sum: '$totalAmount' } } },
  ]);
  return { totals: totals[0] || { count: 0, amount: 0 } };
};

const inventoryReport = async (businessId) => {
  const id = new mongoose.Types.ObjectId(String(businessId));
  const [lowStock, valuation] = await Promise.all([
    Product.find({
      businessId: id,
      $expr: { $lte: ['$stockQuantity', '$lowStockThreshold'] },
    }).sort({ stockQuantity: 1 }),
    Product.aggregate([
      { $match: { businessId: id } },
      {
        $group: {
          _id: null,
          skuCount: { $sum: 1 },
          units: { $sum: '$stockQuantity' },
          costValue: { $sum: { $multiply: ['$stockQuantity', '$costPrice'] } },
          retailValue: { $sum: { $multiply: ['$stockQuantity', '$price'] } },
        },
      },
    ]),
  ]);

  return {
    valuation: valuation[0] || { skuCount: 0, units: 0, costValue: 0, retailValue: 0 },
    lowStock,
  };
};

module.exports = { salesReport, purchasesReport, inventoryReport };
