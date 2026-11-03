const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
    key: { type: String, required: true },
    seq: { type: Number, default: 0 },
  },
  { timestamps: false },
);

counterSchema.index({ businessId: 1, key: 1 }, { unique: true });

module.exports = mongoose.model('Counter', counterSchema);
