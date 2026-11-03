const Purchase = require('../models/Purchase');
const Supplier = require('../models/Supplier');
const Product = require('../models/Product');
const { ApiError } = require('../utils/apiError');
const { parsePagination, searchRegex } = require('../utils/pagination');
const { toClient, toClientList } = require('../utils/toClient');
const { nextPurchaseNumber } = require('../utils/counters');
const mongoose = require('mongoose');
const { applyStockChange, withTransaction, flushStockAlerts } = require('./inventoryService');
const { recordActivity, actorFrom, notify } = require('./activityService');

const buildItems = async (businessId, items) => {
  const resolved = [];
  for (const item of items) {
    const product = await Product.findOne({ _id: item.productId, businessId });
    if (!product) throw new ApiError(404, 'Product not found in purchase items');
    const quantity = Number(item.quantity);
    const purchasePrice = Number(item.purchasePrice ?? product.costPrice);
    resolved.push({
      productId: product._id,
      productName: product.name,
      quantity,
      purchasePrice,
      total: quantity * purchasePrice,
    });
  }
  return resolved;
};

const listPurchases = async (businessId, query) => {
  const { page, limit, skip, sort } = parsePagination(query);
  const filter = { businessId };
  const regex = searchRegex(query.search);
  if (regex) filter.$or = [{ purchaseNumber: regex }, { supplierName: regex }, { notes: regex }];
  if (typeof query.status === 'string' && ['pending', 'received', 'cancelled'].includes(query.status)) {
    filter.status = query.status;
  }
  if (query.supplierId && mongoose.isValidObjectId(query.supplierId)) {
    filter.supplierId = query.supplierId;
  }

  const [items, total] = await Promise.all([
    Purchase.find(filter).sort(sort).skip(skip).limit(limit),
    Purchase.countDocuments(filter),
  ]);
  return { items: toClientList(items), total, page, limit };
};

const getPurchase = async (businessId, id) => {
  const purchase = await Purchase.findOne({ _id: id, businessId });
  if (!purchase) throw new ApiError(404, 'Purchase not found');
  return toClient(purchase);
};

const applyPurchaseStock = async (user, purchase, session, alerts) => {
  if (purchase.stockApplied) return;
  for (const item of purchase.items) {
    await applyStockChange({
      businessId: user.businessId,
      productId: item.productId,
      quantity: item.quantity,
      direction: 'in',
      type: 'purchase',
      referenceType: 'purchase',
      referenceId: purchase._id,
      note: purchase.purchaseNumber,
      userId: user._id,
      session,
      alerts,
    });
  }
  purchase.stockApplied = true;
  purchase.receivedAt = new Date();
  purchase.status = 'received';
};

const createPurchase = async (user, body) => {
  const supplier = await Supplier.findOne({ _id: body.supplierId, businessId: user.businessId });
  if (!supplier) throw new ApiError(400, 'Please select a supplier');
  const items = await buildItems(user.businessId, body.items);
  const totalAmount = items.reduce((sum, item) => sum + item.total, 0);
  const status = ['pending', 'received'].includes(body.status) ? body.status : 'received';

  const alerts = [];
  const purchase = await withTransaction(async (session) => {
    const purchaseNumber = await nextPurchaseNumber(user.businessId, session);
    const [doc] = await Purchase.create(
      [
        {
          businessId: user.businessId,
          purchaseNumber,
          supplierId: supplier._id,
          supplierName: supplier.name,
          items,
          totalAmount,
          notes: body.notes,
          status,
          createdBy: user._id,
          stockApplied: false,
        },
      ],
      { session },
    );

    if (status === 'received') {
      await applyPurchaseStock(user, doc, session, alerts);
      await doc.save({ session });
    }

    supplier.totalPurchases = (supplier.totalPurchases || 0) + totalAmount;
    await supplier.save({ session });
    return doc;
  });

  await flushStockAlerts(user.businessId, alerts);

  await recordActivity(user.businessId, {
    type: 'purchase',
    action: 'created',
    title: 'Purchase created',
    description: `${purchase.purchaseNumber} from ${purchase.supplierName}`,
    actor: actorFrom(user),
    entityType: 'purchase',
    entityId: String(purchase._id),
    entityReference: purchase.purchaseNumber,
    status: purchase.status,
  });

  if (purchase.status === 'received') {
    await notify(user.businessId, {
      type: 'purchase_completed',
      title: 'Purchase Received',
      message: `${purchase.purchaseNumber} · ${purchase.supplierName}`,
      relatedType: 'purchase',
      relatedId: purchase._id,
      details: {
        reference: purchase.purchaseNumber,
        partyName: purchase.supplierName,
        amount: purchase.totalAmount,
        status: purchase.status,
      },
    });
  }

  return toClient(purchase);
};

const updatePurchase = async (user, id, body) => {
  const purchase = await Purchase.findOne({ _id: id, businessId: user.businessId });
  if (!purchase) throw new ApiError(404, 'Purchase not found');

  if (body.notes !== undefined) purchase.notes = body.notes;

  if (body.status === 'cancelled') {
    if (purchase.stockApplied) {
      throw new ApiError(400, 'Received purchases cannot be cancelled; delete to reverse stock');
    }
    purchase.status = 'cancelled';
    await purchase.save();
    return toClient(purchase);
  }

  if (body.status === 'received' && !purchase.stockApplied) {
    return receivePurchase(user, id);
  }

  await purchase.save();
  return toClient(purchase);
};

const receivePurchase = async (user, id) => {
  const purchase = await Purchase.findOne({ _id: id, businessId: user.businessId });
  if (!purchase) throw new ApiError(404, 'Purchase not found');
  if (purchase.status === 'cancelled') throw new ApiError(400, 'Cancelled purchase cannot be received');

  const alerts = [];
  await withTransaction(async (session) => {
    await applyPurchaseStock(user, purchase, session, alerts);
    await purchase.save({ session });
  });
  await flushStockAlerts(user.businessId, alerts);
  return toClient(purchase);
};

const deletePurchase = async (user, id) => {
  const purchase = await Purchase.findOne({ _id: id, businessId: user.businessId });
  if (!purchase) throw new ApiError(404, 'Purchase not found');

  const alerts = [];
  await withTransaction(async (session) => {
    if (purchase.stockApplied) {
      for (const item of purchase.items) {
        await applyStockChange({
          businessId: user.businessId,
          productId: item.productId,
          quantity: item.quantity,
          direction: 'out',
          type: 'adjustment',
          referenceType: 'purchase',
          referenceId: purchase._id,
          note: `Reversal ${purchase.purchaseNumber}`,
          userId: user._id,
          session,
          alerts,
        });
      }
    }
    await Supplier.updateOne(
      { _id: purchase.supplierId, businessId: user.businessId },
      { $inc: { totalPurchases: -purchase.totalAmount } },
      { session },
    );
    await purchase.deleteOne({ session });
  });
  await flushStockAlerts(user.businessId, alerts);
};

module.exports = { listPurchases, getPurchase, createPurchase, updatePurchase, receivePurchase, deletePurchase };
