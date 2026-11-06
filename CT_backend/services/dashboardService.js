const mongoose = require('mongoose');
const Product = require('../models/Product');
const Sale = require('../models/Sale');
const Purchase = require('../models/Purchase');
const Customer = require('../models/Customer');
const Activity = require('../models/Activity');
const { toClientList } = require('../utils/toClient');
const { parsePagination, searchRegex } = require('../utils/pagination');

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
  const { page, limit, skip } = parsePagination({ ...query, limit: query.limit || 40 });
  const filter = { businessId };
  const allowedTypes = ['sale', 'purchase', 'product', 'customer', 'supplier', 'payment', 'auth'];
  if (typeof query.type === 'string' && allowedTypes.includes(query.type)) {
    filter.type = query.type;
  }
  const regex = searchRegex(query.search);
  if (regex) {
    filter.$or = [
      { title: regex },
      { description: regex },
      { entityName: regex },
      { entityReference: regex },
      { 'actor.name': regex },
    ];
  }

  const [docs, total] = await Promise.all([
    Activity.find(filter).sort({ timestamp: -1, createdAt: -1 }).skip(skip).limit(limit),
    Activity.countDocuments(filter),
  ]);

  const items = toClientList(docs).map((item) => ({
    ...item,
    timestamp: item.timestamp || item.createdAt,
  }));
  return { items, total, page, limit };
};

const projectSale = {
  $project: {
    _id: 0,
    id: { $toString: '$_id' },
    relatedId: { $toString: '$_id' },
    type: { $literal: 'Sale' },
    ref: '$invoiceNumber',
    party: '$customerName',
    amount: '$totalAmount',
    status: '$paymentStatus',
    timestamp: '$createdAt',
  },
};

const projectPurchase = {
  $project: {
    _id: 0,
    id: { $toString: '$_id' },
    relatedId: { $toString: '$_id' },
    type: { $literal: 'Purchase' },
    ref: '$purchaseNumber',
    party: '$supplierName',
    amount: '$totalAmount',
    status: '$status',
    timestamp: '$createdAt',
  },
};

const listTransactions = async (businessId, query = {}) => {
  const { page, limit, skip } = parsePagination(query);
  const id = oid(businessId);
  const regex = searchRegex(query.search);
  const kind = query.type === 'Sale' || query.type === 'Purchase' ? query.type : 'all';
  const createdAt = {};
  if (query.from) createdAt.$gte = new Date(query.from);
  if (query.to) createdAt.$lte = new Date(query.to);
  const hasDate = Object.keys(createdAt).length > 0;

  const saleMatch = { businessId: id };
  const purchaseMatch = { businessId: id };
  if (hasDate) {
    saleMatch.createdAt = createdAt;
    purchaseMatch.createdAt = createdAt;
  }
  if (regex) {
    saleMatch.$or = [{ invoiceNumber: regex }, { customerName: regex }, { notes: regex }];
    purchaseMatch.$or = [{ purchaseNumber: regex }, { supplierName: regex }, { notes: regex }];
  }

  const status = typeof query.status === 'string' ? query.status : '';
  if (['paid', 'partial'].includes(status)) {
    saleMatch.paymentStatus = status;
  } else if (['received', 'cancelled'].includes(status)) {
    purchaseMatch.status = status;
  } else if (status === 'pending') {
    saleMatch.paymentStatus = 'pending';
    purchaseMatch.status = 'pending';
  }

  const salePipeline = [{ $match: saleMatch }, projectSale];
  const purchasePipeline = [{ $match: purchaseMatch }, projectPurchase];
  const sortDir = String(query.sort || query.order || 'desc').toLowerCase() === 'asc' ? 1 : -1;
  const facet = [
    { $sort: { timestamp: sortDir } },
    {
      $facet: {
        items: [{ $skip: skip }, { $limit: limit }],
        meta: [{ $count: 'total' }],
      },
    },
  ];

  let result;
  if (kind === 'Purchase') {
    [result] = await Purchase.aggregate([...purchasePipeline, ...facet]);
  } else if (kind === 'Sale') {
    [result] = await Sale.aggregate([...salePipeline, ...facet]);
  } else {
    [result] = await Sale.aggregate([
      ...salePipeline,
      { $unionWith: { coll: Purchase.collection.name, pipeline: purchasePipeline } },
      ...facet,
    ]);
  }

  const items = (result?.items || []).map((row) => ({
    id: String(row.id || row.relatedId || ''),
    relatedId: String(row.relatedId || row.id || ''),
    type: row.type === 'Sale' ? 'Sale' : 'Purchase',
    ref: row.ref,
    party: row.party,
    amount: Number(row.amount || 0),
    status: row.status,
    timestamp: row.timestamp,
  }));

  return { items, total: result?.meta?.[0]?.total || 0, page, limit };
};

module.exports = { getSummary, getActivities, listTransactions };
