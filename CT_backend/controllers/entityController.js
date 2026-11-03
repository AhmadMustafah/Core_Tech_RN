const { asyncHandler } = require('../utils/asyncHandler');
const { success, created } = require('../utils/response');
const { listDocs, getDoc, createDoc, updateDoc, deleteDoc } = require('../services/crudService');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');
const User = require('../models/User');
const Business = require('../models/Business');
const Notification = require('../models/Notification');
const Settings = require('../models/Settings');
const StockMovement = require('../models/StockMovement');
const { UNITS } = require('../models/Product');
const { ApiError } = require('../utils/apiError');
const { recordActivity, actorFrom } = require('../services/activityService');
const { toClient, toClientList } = require('../utils/toClient');
const { parsePagination } = require('../utils/pagination');
const { pick } = require('../utils/sanitize');

const listHandler = (Model, searchFields) =>
  asyncHandler(async (req, res) => {
    const result = await listDocs(Model, req.businessId, req.query, searchFields);
    success(res, result.items, 'OK', 200, { total: result.total, page: result.page, limit: result.limit });
  });

const getHandler = (Model) =>
  asyncHandler(async (req, res) => {
    success(res, await getDoc(Model, req.businessId, req.params.id));
  });

const PRODUCT_FIELDS = [
  'name',
  'sku',
  'category',
  'unit',
  'price',
  'costPrice',
  'stockQuantity',
  'lowStockThreshold',
  'description',
  'image',
  'isActive',
];
const PRODUCT_UPDATE_FIELDS = PRODUCT_FIELDS.filter((field) => field !== 'stockQuantity');
const PARTY_FIELDS = ['name', 'email', 'phone', 'company', 'address', 'city', 'notes'];
const CATEGORY_FIELDS = ['name', 'description', 'isActive'];
const SETTINGS_FIELDS = [
  'themeMode',
  'themePreset',
  'language',
  'notificationsEnabled',
  'dateFormat',
  'currencyDisplay',
  'sessionTimeout',
  'lowStockAlerts',
];
const BUSINESS_FIELDS = ['name', 'email', 'phone', 'address', 'currency'];
const USER_FIELDS = ['name', 'email', 'phone', 'company', 'role', 'isActive', 'avatar'];

const createHandler = (Model, type, allowed) =>
  asyncHandler(async (req, res) => {
    const payload = allowed ? pick(req.body, allowed) : req.body;
    const doc = await createDoc(Model, req.businessId, payload);
    await recordActivity(req.businessId, {
      type,
      action: 'created',
      title: `${Model.modelName} created`,
      description: doc.name || doc.sku || String(doc.id),
      actor: actorFrom(req.user),
      entityType: type,
      entityId: doc.id,
      entityName: doc.name,
    });
    created(res, doc);
  });

const updateHandler = (Model, type, allowed) =>
  asyncHandler(async (req, res) => {
    const payload = allowed ? pick(req.body, allowed) : req.body;
    const doc = await updateDoc(Model, req.businessId, req.params.id, payload);
    await recordActivity(req.businessId, {
      type,
      action: 'updated',
      title: `${Model.modelName} updated`,
      description: doc.name || String(doc.id),
      actor: actorFrom(req.user),
      entityType: type,
      entityId: doc.id,
    });
    success(res, doc, 'Updated');
  });

const deleteHandler = (Model, type) =>
  asyncHandler(async (req, res) => {
    const doc = await deleteDoc(Model, req.businessId, req.params.id);
    await recordActivity(req.businessId, {
      type,
      action: 'deleted',
      title: `${Model.modelName} deleted`,
      description: doc.name || String(doc.id),
      actor: actorFrom(req.user),
      entityType: type,
      entityId: doc.id,
    });
    success(res, null, 'Deleted');
  });

const products = {
  list: listHandler(Product, ['name', 'sku', 'category', 'description']),
  get: getHandler(Product),
  create: createHandler(Product, 'product', PRODUCT_FIELDS),
  update: updateHandler(Product, 'product', PRODUCT_UPDATE_FIELDS),
  remove: deleteHandler(Product, 'product'),
  categories: asyncHandler(async (req, res) => {
    const items = await Category.find({ businessId: req.businessId, isActive: true }).sort({ name: 1 });
    success(res, toClientList(items));
  }),
  units: asyncHandler(async (_req, res) => {
    success(res, UNITS);
  }),
};

const customers = {
  list: listHandler(Customer, ['name', 'email', 'phone', 'company']),
  get: getHandler(Customer),
  create: createHandler(Customer, 'customer', PARTY_FIELDS),
  update: updateHandler(Customer, 'customer', PARTY_FIELDS),
  remove: deleteHandler(Customer, 'customer'),
};

const suppliers = {
  list: listHandler(Supplier, ['name', 'email', 'phone', 'company']),
  get: getHandler(Supplier),
  create: createHandler(Supplier, 'supplier', PARTY_FIELDS),
  update: updateHandler(Supplier, 'supplier', PARTY_FIELDS),
  remove: deleteHandler(Supplier, 'supplier'),
};

const categories = {
  list: listHandler(Category, ['name', 'description']),
  create: createHandler(Category, 'product', CATEGORY_FIELDS),
  update: updateHandler(Category, 'product', CATEGORY_FIELDS),
  remove: deleteHandler(Category, 'product'),
};

const users = {
  list: asyncHandler(async (req, res) => {
    const result = await listDocs(User, req.businessId, req.query, ['name', 'email', 'role']);
    success(res, result.items, 'OK', 200, { total: result.total, page: result.page, limit: result.limit });
  }),
  get: getHandler(User),
  create: asyncHandler(async (req, res) => {
    if (!req.body.password) throw new ApiError(400, 'Password is required');
    const data = pick(req.body, USER_FIELDS);
    const passwordHash = await User.hashPassword(req.body.password);
    const doc = await User.create({
      businessId: req.businessId,
      ...data,
      company: data.company || req.user.company,
      role: data.role || 'staff',
      passwordHash,
    });
    created(res, toClient(doc));
  }),
  update: asyncHandler(async (req, res) => {
    const data = pick(req.body, USER_FIELDS);
    if (req.body.password) {
      data.passwordHash = await User.hashPassword(req.body.password);
    }
    success(res, await updateDoc(User, req.businessId, req.params.id, data, { allowPasswordHash: true }), 'Updated');
  }),
  remove: deleteHandler(User, 'auth'),
};

const businesses = {
  get: asyncHandler(async (req, res) => {
    const business = await Business.findById(req.businessId);
    if (!business) throw new ApiError(404, 'Business not found');
    success(res, toClient(business));
  }),
  update: asyncHandler(async (req, res) => {
    const business = await Business.findByIdAndUpdate(
      req.businessId,
      { $set: pick(req.body, BUSINESS_FIELDS) },
      {
        returnDocument: 'after',
        runValidators: true,
      },
    );
    success(res, toClient(business), 'Updated');
  }),
};

const notifications = {
  list: asyncHandler(async (req, res) => {
    const { page, limit, skip, sort } = parsePagination(req.query);
    const filter = { businessId: req.businessId };
    if (req.query.unread === 'true') filter.read = false;
    const [items, total] = await Promise.all([
      Notification.find(filter).sort(sort).skip(skip).limit(limit),
      Notification.countDocuments(filter),
    ]);
    success(res, toClientList(items), 'OK', 200, { total, page, limit });
  }),
  markRead: asyncHandler(async (req, res) => {
    const doc = await Notification.findOneAndUpdate(
      { _id: req.params.id, businessId: req.businessId },
      { read: true },
      { returnDocument: 'after' },
    );
    if (!doc) throw new ApiError(404, 'Notification not found');
    success(res, toClient(doc));
  }),
  markAllRead: asyncHandler(async (req, res) => {
    await Notification.updateMany({ businessId: req.businessId, read: false }, { read: true });
    success(res, null, 'All notifications marked as read');
  }),
};

const settings = {
  get: asyncHandler(async (req, res) => {
    const doc = await Settings.findOneAndUpdate(
      { businessId: req.businessId },
      {},
      { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true },
    );
    success(res, toClient(doc));
  }),
  update: asyncHandler(async (req, res) => {
    const doc = await Settings.findOneAndUpdate(
      { businessId: req.businessId },
      { $set: pick(req.body, SETTINGS_FIELDS) },
      {
        returnDocument: 'after',
        upsert: true,
        runValidators: true,
      },
    );
    success(res, toClient(doc), 'Settings saved');
  }),
};

const inventory = {
  movements: asyncHandler(async (req, res) => {
    const { page, limit, skip, sort } = parsePagination(req.query);
    const filter = { businessId: req.businessId };
    if (req.query.productId) filter.productId = req.query.productId;
    if (req.query.type) filter.type = req.query.type;
    const [items, total] = await Promise.all([
      StockMovement.find(filter).sort(sort).skip(skip).limit(limit),
      StockMovement.countDocuments(filter),
    ]);
    success(res, toClientList(items), 'OK', 200, { total, page, limit });
  }),
  adjust: asyncHandler(async (req, res) => {
    const { applyStockChange, withTransaction, flushStockAlerts } = require('../services/inventoryService');
    const quantity = Number(req.body.quantity);
    const direction = req.body.direction;
    if (!['in', 'out'].includes(direction) || !(quantity > 0)) {
      throw new ApiError(400, 'Valid direction and quantity are required');
    }
    const alerts = [];
    const product = await withTransaction(async (session) =>
      applyStockChange({
        businessId: req.businessId,
        productId: req.body.productId,
        quantity,
        direction,
        type: 'adjustment',
        referenceType: 'adjustment',
        note: req.body.note,
        userId: req.user._id,
        session,
        alerts,
      }),
    );
    await flushStockAlerts(req.businessId, alerts);
    success(res, toClient(product), 'Stock adjusted');
  }),
};

module.exports = {
  products,
  customers,
  suppliers,
  categories,
  users,
  businesses,
  notifications,
  settings,
  inventory,
};
