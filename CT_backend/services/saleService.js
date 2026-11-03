const Sale = require('../models/Sale');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const { ApiError } = require('../utils/apiError');
const { parsePagination, searchRegex } = require('../utils/pagination');
const { toClient, toClientList } = require('../utils/toClient');
const { nextInvoiceNumber } = require('../utils/counters');
const { applyStockChange, withTransaction, flushStockAlerts } = require('./inventoryService');
const mongoose = require('mongoose');
const { recordActivity, actorFrom, notify } = require('./activityService');

const buildItems = async (businessId, items) => {
  const resolved = [];
  for (const item of items) {
    const product = await Product.findOne({ _id: item.productId, businessId });
    if (!product) throw new ApiError(404, 'Product not found in sale items');
    const quantity = Number(item.quantity);
    const price = Number(item.price ?? product.price);
    const discount = Number(item.discount || 0);
    const tax = Number(item.tax || 0);
    resolved.push({
      productId: product._id,
      productName: product.name,
      quantity,
      price,
      discount,
      tax,
      total: quantity * price - discount + tax,
    });
  }
  return resolved;
};

const listSales = async (businessId, query) => {
  const { page, limit, skip, sort } = parsePagination(query);
  const filter = { businessId };
  const regex = searchRegex(query.search);
  if (regex) {
    filter.$or = [{ invoiceNumber: regex }, { customerName: regex }, { notes: regex }];
  }
  if (typeof query.paymentStatus === 'string' && ['paid', 'pending', 'partial'].includes(query.paymentStatus)) {
    filter.paymentStatus = query.paymentStatus;
  }
  if (query.customerId && mongoose.isValidObjectId(query.customerId)) {
    filter.customerId = query.customerId;
  }
  if (query.from || query.to) {
    filter.createdAt = {};
    if (query.from) filter.createdAt.$gte = new Date(query.from);
    if (query.to) filter.createdAt.$lte = new Date(query.to);
  }

  const [items, total] = await Promise.all([
    Sale.find(filter).sort(sort).skip(skip).limit(limit),
    Sale.countDocuments(filter),
  ]);
  return { items: toClientList(items), total, page, limit };
};

const getSale = async (businessId, id) => {
  const sale = await Sale.findOne({ _id: id, businessId });
  if (!sale) throw new ApiError(404, 'Sale not found');
  return toClient(sale);
};

const createSale = async (user, body) => {
  const customer = await Customer.findOne({ _id: body.customerId, businessId: user.businessId });
  if (!customer) throw new ApiError(400, 'Please select a customer');

  const items = await buildItems(user.businessId, body.items);
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const discount = Number(body.discount || 0);
  const tax = Number(body.tax || 0);
  const totalAmount = subtotal - discount + tax;
  if (totalAmount < 0) throw new ApiError(400, 'Total amount cannot be negative');

  const alerts = [];
  const sale = await withTransaction(async (session) => {
    const invoiceNumber = await nextInvoiceNumber(user.businessId, session);
    const [doc] = await Sale.create(
      [
        {
          businessId: user.businessId,
          invoiceNumber,
          customerId: customer._id,
          customerName: customer.name,
          items,
          subtotal,
          discount,
          tax,
          totalAmount,
          paymentStatus: body.paymentStatus || 'pending',
          notes: body.notes,
          createdBy: user._id,
          stockApplied: true,
        },
      ],
      { session },
    );

    for (const item of items) {
      await applyStockChange({
        businessId: user.businessId,
        productId: item.productId,
        quantity: item.quantity,
        direction: 'out',
        type: 'sale',
        referenceType: 'sale',
        referenceId: doc._id,
        note: invoiceNumber,
        userId: user._id,
        session,
        alerts,
      });
    }

    customer.totalPurchases = (customer.totalPurchases || 0) + totalAmount;
    await customer.save({ session });
    return doc;
  });

  await flushStockAlerts(user.businessId, alerts);

  await recordActivity(user.businessId, {
    type: 'sale',
    action: 'created',
    title: 'Sale created',
    description: `${sale.invoiceNumber} for ${sale.customerName}`,
    actor: actorFrom(user),
    entityType: 'sale',
    entityId: String(sale._id),
    entityReference: sale.invoiceNumber,
    status: sale.paymentStatus,
  });

  await notify(user.businessId, {
    type: sale.paymentStatus === 'paid' ? 'sale_completed' : 'order_created',
    title: sale.paymentStatus === 'paid' ? 'Sale Completed' : 'Order Created',
    message: `${sale.invoiceNumber} · ${sale.customerName}`,
    relatedType: 'sale',
    relatedId: sale._id,
    details: {
      reference: sale.invoiceNumber,
      partyName: sale.customerName,
      amount: sale.totalAmount,
      status: sale.paymentStatus,
    },
  });

  return toClient(sale);
};

const updateSalePayment = async (user, id, paymentStatus) => {
  if (!['paid', 'pending', 'partial'].includes(paymentStatus)) {
    throw new ApiError(400, 'Invalid payment status');
  }
  const sale = await Sale.findOne({ _id: id, businessId: user.businessId });
  if (!sale) throw new ApiError(404, 'Sale not found');
  const previous = sale.paymentStatus;
  sale.paymentStatus = paymentStatus;
  await sale.save();
  await recordActivity(user.businessId, {
    type: 'payment',
    action: 'status_changed',
    title: 'Payment updated',
    description: `${sale.invoiceNumber} ${previous} → ${paymentStatus}`,
    actor: actorFrom(user),
    entityType: 'sale',
    entityId: String(sale._id),
    previousValue: previous,
    newValue: paymentStatus,
  });
  return toClient(sale);
};

const deleteSale = async (user, id) => {
  const sale = await Sale.findOne({ _id: id, businessId: user.businessId });
  if (!sale) throw new ApiError(404, 'Sale not found');

  const alerts = [];
  await withTransaction(async (session) => {
    if (sale.stockApplied) {
      for (const item of sale.items) {
        await applyStockChange({
          businessId: user.businessId,
          productId: item.productId,
          quantity: item.quantity,
          direction: 'in',
          type: 'return',
          referenceType: 'sale',
          referenceId: sale._id,
          note: `Reversal ${sale.invoiceNumber}`,
          userId: user._id,
          session,
          alerts,
        });
      }
    }
    await Customer.updateOne(
      { _id: sale.customerId, businessId: user.businessId },
      { $inc: { totalPurchases: -sale.totalAmount } },
      { session },
    );
    await sale.deleteOne({ session });
  });
  await flushStockAlerts(user.businessId, alerts);

  await recordActivity(user.businessId, {
    type: 'sale',
    action: 'deleted',
    title: 'Sale deleted',
    description: sale.invoiceNumber,
    actor: actorFrom(user),
    entityType: 'sale',
    entityId: String(sale._id),
  });
};

module.exports = { listSales, getSale, createSale, updateSalePayment, deleteSale };
