const mongoose = require('mongoose');
const Product = require('../models/Product');
const Sale = require('../models/Sale');
const Purchase = require('../models/Purchase');
const Customer = require('../models/Customer');
const Activity = require('../models/Activity');
const { toClientList } = require('../utils/toClient');

const oid = (businessId) => new mongoose.Types.ObjectId(String(businessId));

const getSummary = async (businessId) => {
  const id = oid(businessId);
  const [totalProducts, totalSales, totalPurchases, totalCustomers, lowStockCount, salesAgg, purchaseAgg] =
    await Promise.all([
      Product.countDocuments({ businessId: id }),
      Sale.countDocuments({ businessId: id }),
      Purchase.countDocuments({ businessId: id }),
      Customer.countDocuments({ businessId: id }),
      Product.countDocuments({
        businessId: id,
        $expr: { $lte: ['$stockQuantity', '$lowStockThreshold'] },
      }),
      Sale.aggregate([
        { $match: { businessId: id } },
        { $group: { _id: null, amount: { $sum: '$totalAmount' } } },
      ]),
      Purchase.aggregate([
        { $match: { businessId: id } },
        { $group: { _id: null, amount: { $sum: '$totalAmount' } } },
      ]),
    ]);

  return {
    totalProducts,
    totalSales,
    totalPurchases,
    totalCustomers,
    lowStockCount,
    salesAmount: salesAgg[0]?.amount || 0,
    purchasesAmount: purchaseAgg[0]?.amount || 0,
  };
};

const getActivities = async (businessId, query = {}) => {
  const limit = Math.min(100, Number(query.limit) || 40);
  const items = await Activity.find({ businessId }).sort({ timestamp: -1, createdAt: -1 }).limit(limit);
  return toClientList(items).map((item) => ({
    ...item,
    timestamp: item.timestamp || item.createdAt,
  }));
};

module.exports = { getSummary, getActivities };
