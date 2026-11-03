const mongoose = require('mongoose');
const { schemaOptions } = require('./schemaOptions');

const categorySchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, trim: true, maxlength: 200 },
    isActive: { type: Boolean, default: true },
  },
  schemaOptions,
);

categorySchema.index({ businessId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);
