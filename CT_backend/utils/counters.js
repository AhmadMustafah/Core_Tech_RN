const Counter = require('../models/Counter');

const nextSequence = async (businessId, key, session) => {
  const options = { returnDocument: 'after', upsert: true };
  if (session) {
    options.session = session;
  }
  const doc = await Counter.findOneAndUpdate(
    { businessId, key },
    { $inc: { seq: 1 } },
    options,
  );
  return doc.seq;
};

const padded = (value, size = 4) => String(value).padStart(size, '0');

const nextInvoiceNumber = async (businessId, session) => {
  const year = new Date().getFullYear();
  const seq = await nextSequence(businessId, `invoice-${year}`, session);
  return `INV-${year}-${padded(seq)}`;
};

const nextPurchaseNumber = async (businessId, session) => {
  const year = new Date().getFullYear();
  const seq = await nextSequence(businessId, `purchase-${year}`, session);
  return `PO-${year}-${padded(seq)}`;
};

module.exports = { nextSequence, nextInvoiceNumber, nextPurchaseNumber };
