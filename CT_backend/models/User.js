const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { schemaOptions } = require('./schemaOptions');

const ROLES = ['admin', 'manager', 'staff', 'accountant'];

const userSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    company: { type: String, trim: true, maxlength: 120 },
    avatar: { type: String, trim: true },
    role: { type: String, enum: ROLES, default: 'staff', index: true },
    passwordHash: { type: String, required: true, select: false },
    isActive: { type: Boolean, default: true },
  },
  schemaOptions,
);

userSchema.index({ businessId: 1, email: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });

userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.statics.hashPassword = function hashPassword(password) {
  return bcrypt.hash(password, 12);
};

userSchema.virtual('roleLabel').get(function roleLabel() {
  const labels = { admin: 'Admin', manager: 'Manager', staff: 'Staff', accountant: 'Accountant' };
  return labels[this.role] || this.role;
});

module.exports = mongoose.model('User', userSchema);
module.exports.ROLES = ROLES;
