const ALLOWED_SORT = new Set([
  'createdAt',
  'updatedAt',
  'name',
  'sku',
  'price',
  'costPrice',
  'stockQuantity',
  'totalAmount',
  'invoiceNumber',
  'purchaseNumber',
  'email',
  'role',
  'status',
  'paymentStatus',
  'category',
]);

const parsePagination = (query = {}) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 50));
  const skip = (page - 1) * limit;
  const requested = typeof query.sortBy === 'string' ? query.sortBy : 'createdAt';
  const sortBy = ALLOWED_SORT.has(requested) ? requested : 'createdAt';
  const sortDir = String(query.sort || query.order || 'desc').toLowerCase() === 'asc' ? 1 : -1;
  return { page, limit, skip, sort: { [sortBy]: sortDir } };
};

const searchRegex = (value) => {
  if (!value) return null;
  const escaped = String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(escaped, 'i');
};

module.exports = { parsePagination, searchRegex, ALLOWED_SORT };
