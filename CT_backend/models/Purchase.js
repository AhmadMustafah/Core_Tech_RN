const mongoose = require('mongoose');
const { schemaOptions } = require('./schemaOptions');

const purchaseItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    purchasePrice: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const purchaseSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    purchaseNumber: { type: String, required: true, trim: true },
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
    supplierName: { type: String, required: true, trim: true },
    items: { type: [purchaseItemSchema], required: true, validate: (v) => v.length > 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    notes: { type: String, trim: true, maxlength: 500 },
    status: { type: String, enum: ['pending', 'received', 'cancelled'], default: 'received', index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    receivedAt: { type: Date },
    stockApplied: { type: Boolean, default: false },
  },
  schemaOptions,
);

purchaseSchema.index({ businessId: 1, purchaseNumber: 1 }, { unique: true });
purchaseSchema.index({ businessId: 1, createdAt: -1 });
purchaseSchema.index({ businessId: 1, supplierId: 1 });

module.exports = mongoose.model('Purchase', purchaseSchema);
