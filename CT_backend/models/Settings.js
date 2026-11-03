const mongoose = require('mongoose');
const { schemaOptions } = require('./schemaOptions');

const settingsSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, unique: true },
    themeMode: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    themePreset: { type: String, default: 'default' },
    language: { type: String, enum: ['en', 'ur'], default: 'en' },
    notificationsEnabled: { type: Boolean, default: true },
    dateFormat: { type: String, enum: ['dmy', 'mdy', 'ymd'], default: 'dmy' },
    currencyDisplay: { type: String, enum: ['symbol', 'code'], default: 'symbol' },
    sessionTimeout: { type: String, enum: ['15', '30', '60'], default: '30' },
    lowStockAlerts: { type: Boolean, default: true },
  },
  schemaOptions,
);

module.exports = mongoose.model('Settings', settingsSchema);
