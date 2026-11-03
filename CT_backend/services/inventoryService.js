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
  const product = await Product.findOne({ _id: productId, businessId }).session(session);
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
  await product.save({ session });

  await StockMovement.create(
    [
      {
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
      },
    ],
    { session },
  );

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

const withTransaction = async (work) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const result = await work(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    try {
      await session.abortTransaction();
    } catch (_abortError) {
      // already aborted
    }
    throw error;
  } finally {
    session.endSession();
  }
};

const flushStockAlerts = async (businessId, alerts = []) => {
  for (const payload of alerts) {
    await notify(businessId, payload);
  }
};

module.exports = { applyStockChange, withTransaction, flushStockAlerts };
