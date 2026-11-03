const mongoose = require('mongoose');
const { schemaOptions } = require('./schemaOptions');

const businessSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true, maxlength: 250 },
    currency: { type: String, default: 'PKR' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  schemaOptions,
);

businessSchema.index({ name: 1 });
businessSchema.index({ ownerId: 1 });

module.exports = mongoose.model('Business', businessSchema);
