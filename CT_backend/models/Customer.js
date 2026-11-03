const mongoose = require('mongoose');
const { schemaOptions } = require('./schemaOptions');

const customerSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, trim: true, maxlength: 200 },
    company: { type: String, trim: true, maxlength: 100 },
    totalPurchases: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  schemaOptions,
);

customerSchema.index({ businessId: 1, email: 1 });
customerSchema.index({ businessId: 1, name: 1 });

module.exports = mongoose.model('Customer', customerSchema);
