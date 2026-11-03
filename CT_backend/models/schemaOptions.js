const schemaOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_doc, ret) => {
      ret.id = String(ret._id);
      delete ret._id;
      delete ret.__v;
      delete ret.passwordHash;
      delete ret.tokenHash;
      delete ret.otpHash;
      return ret;
    },
  },
  toObject: { virtuals: true },
};

module.exports = { schemaOptions };
