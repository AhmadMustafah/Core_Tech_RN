const toClient = (doc) => {
  if (!doc) return doc;
  const obj = typeof doc.toJSON === 'function' ? doc.toJSON() : { ...doc };
  if (obj._id) {
    obj.id = String(obj._id);
    delete obj._id;
  }
  delete obj.__v;
  delete obj.passwordHash;
  delete obj.tokenHash;
  delete obj.otpHash;
  return obj;
};

const toClientList = (docs) => (docs || []).map(toClient);

module.exports = { toClient, toClientList };
