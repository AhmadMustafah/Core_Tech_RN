const mongoose = require('mongoose');
const { schemaOptions } = require('./schemaOptions');

const UNITS = ['Piece', 'Kg', 'Liter', 'Box', 'Pack', 'Dozen'];

const productSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    sku: { type: String, required: true, trim: true, uppercase: true, maxlength: 30 },
    category: { type: String, required: true, trim: true },
    unit: { type: String, enum: UNITS, default: 'Piece' },
    price: { type: Number, required: true, min: 0 },
    costPrice: { type: Number, required: true, min: 0 },
    stockQuantity: { type: Number, required: true, min: 0, default: 0 },
    lowStockThreshold: { type: Number, required: true, min: 0, default: 10 },
    description: { type: String, trim: true, maxlength: 500 },
    image: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  schemaOptions,
);

productSchema.index({ businessId: 1, sku: 1 }, { unique: true });
productSchema.index({ businessId: 1, name: 1 });
productSchema.index({ businessId: 1, category: 1 });
productSchema.index({ businessId: 1, stockQuantity: 1 });

module.exports = mongoose.model('Product', productSchema);
module.exports.UNITS = UNITS;
