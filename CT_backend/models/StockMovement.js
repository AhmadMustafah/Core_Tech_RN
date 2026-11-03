const mongoose = require('mongoose');
const { schemaOptions } = require('./schemaOptions');

const stockMovementSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    type: { type: String, enum: ['sale', 'purchase', 'adjustment', 'return'], required: true },
    direction: { type: String, enum: ['in', 'out'], required: true },
    quantity: { type: Number, required: true, min: 0 },
    previousQuantity: { type: Number, required: true },
    newQuantity: { type: Number, required: true },
    referenceType: { type: String, enum: ['sale', 'purchase', 'product', 'adjustment'] },
    referenceId: { type: mongoose.Schema.Types.ObjectId },
    note: { type: String, trim: true, maxlength: 200 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  schemaOptions,
);

stockMovementSchema.index({ businessId: 1, createdAt: -1 });

module.exports = mongoose.model('StockMovement', stockMovementSchema);
