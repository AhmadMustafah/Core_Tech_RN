const { ApiError } = require('../utils/apiError');
const { parsePagination, searchRegex } = require('../utils/pagination');
const { toClient, toClientList } = require('../utils/toClient');
const { stripTenantFields } = require('../utils/sanitize');

const listDocs = async (Model, businessId, query, searchFields = []) => {
  const { page, limit, skip, sort } = parsePagination(query);
  const filter = { businessId };
  const regex = searchRegex(query.search);
  if (regex && searchFields.length) {
    filter.$or = searchFields.map((field) => ({ [field]: regex }));
  }
  if (typeof query.category === 'string') filter.category = query.category;
  if (typeof query.paymentStatus === 'string') filter.paymentStatus = query.paymentStatus;
  else if (typeof query.status === 'string' && Model.modelName === 'Sale') filter.paymentStatus = query.status;

  const [items, total] = await Promise.all([
    Model.find(filter).sort(sort).skip(skip).limit(limit),
    Model.countDocuments(filter),
  ]);

  return { items: toClientList(items), total, page, limit };
};

const getDoc = async (Model, businessId, id) => {
  const doc = await Model.findOne({ _id: id, businessId });
  if (!doc) throw new ApiError(404, `${Model.modelName} not found`);
  return toClient(doc);
};

const createDoc = async (Model, businessId, data) => {
  const doc = await Model.create({ ...stripTenantFields(data), businessId });
  return toClient(doc);
};

const updateDoc = async (Model, businessId, id, data, options) => {
  const doc = await Model.findOneAndUpdate(
    { _id: id, businessId },
    { $set: stripTenantFields(data, options) },
    { returnDocument: 'after', runValidators: true },
  );
  if (!doc) throw new ApiError(404, `${Model.modelName} not found`);
  return toClient(doc);
};

const deleteDoc = async (Model, businessId, id) => {
  const doc = await Model.findOneAndDelete({ _id: id, businessId });
  if (!doc) throw new ApiError(404, `${Model.modelName} not found`);
  return toClient(doc);
};

module.exports = { listDocs, getDoc, createDoc, updateDoc, deleteDoc };
