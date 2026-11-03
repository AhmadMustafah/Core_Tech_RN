const mongoose = require('mongoose');
const { schemaOptions } = require('./schemaOptions');

const activitySchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    type: {
      type: String,
      enum: ['sale', 'purchase', 'product', 'customer', 'supplier', 'payment', 'auth'],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    action: {
      type: String,
      enum: ['created', 'updated', 'deleted', 'status_changed', 'stock_changed', 'logged_in', 'logged_out', 'alert'],
    },
    actor: {
      id: String,
      name: String,
      role: String,
      avatar: String,
    },
    entityType: { type: String },
    entityId: { type: String },
    entityName: { type: String },
    entityReference: { type: String },
    status: { type: String },
    previousValue: { type: String },
    newValue: { type: String },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  schemaOptions,
);

activitySchema.index({ businessId: 1, timestamp: -1 });

module.exports = mongoose.model('Activity', activitySchema);
