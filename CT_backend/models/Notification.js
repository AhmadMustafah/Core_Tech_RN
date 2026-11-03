const mongoose = require('mongoose');
const { schemaOptions } = require('./schemaOptions');

const notificationSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    type: {
      type: String,
      enum: [
        'order_created',
        'sale_completed',
        'purchase_completed',
        'low_stock',
        'customer_activity',
        'supplier_activity',
        'payment_update',
        'system_alert',
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false, index: true },
    relatedType: { type: String, enum: ['product', 'sale', 'purchase', 'customer', 'supplier'] },
    relatedId: { type: mongoose.Schema.Types.ObjectId },
    details: { type: mongoose.Schema.Types.Mixed },
  },
  schemaOptions,
);

notificationSchema.index({ businessId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
