const mongoose = require('mongoose');
const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');
const { ApiError } = require('../utils/apiError');
const { notify } = require('./activityService');
const applyStockChange = async ({
  businessId,
  productId,
  quantity,
  direction,
  type,
  referenceType,
  referenceId,
  note,
  userId,
  session,
  alerts,
}) => {
  const query = Product.findOne({ _id: productId, businessId });
  const product = session ? await query.session(session) : await query;
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  const delta = direction === 'out' ? -quantity : quantity;
  const nextQty = product.stockQuantity + delta;
  if (nextQty < 0) {
    throw new ApiError(409, `Insufficient stock for ${product.name}`);
  }

  const previousQuantity = product.stockQuantity;
  product.stockQuantity = nextQty;
  await product.save(session ? { session } : undefined);

  const movement = {
    businessId,
    productId,
    type,
    direction,
    quantity,
    previousQuantity,
    newQuantity: nextQty,
    referenceType,
    referenceId,
    note,
    createdBy: userId,
  };
  if (session) {
    await StockMovement.create([movement], { session });
  } else {
    await StockMovement.create(movement);
  }

  if (product.stockQuantity <= product.lowStockThreshold && Array.isArray(alerts)) {
    alerts.push({
      type: 'low_stock',
      title: 'Low Stock Alert',
      message: `${product.name} is at ${product.stockQuantity}/${product.lowStockThreshold}`,
      relatedType: 'product',
      relatedId: product._id,
      details: {
        productName: product.name,
        sku: product.sku,
        quantity: product.stockQuantity,
        threshold: product.lowStockThreshold,
      },
    });
  }

  return product;
};

const TXN_UNSUPPORTED = /Transaction numbers are only allowed|replica set member|IllegalOperation/i;

const withTransaction = async (work) => {
  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
    const result = await work(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    if (session) {
      try {
        await session.abortTransaction();
      } catch (_abortError) {
        // already aborted
      }
    }
    if (TXN_UNSUPPORTED.test(String(error?.message || ''))) {
      return work(null);
    }
    throw error;
  } finally {
    session?.endSession();
  }
};

const flushStockAlerts = async (businessId, alerts = []) => {
  for (const payload of alerts) {
    await notify(businessId, payload);
  }
};

module.exports = { applyStockChange, withTransaction, flushStockAlerts };
