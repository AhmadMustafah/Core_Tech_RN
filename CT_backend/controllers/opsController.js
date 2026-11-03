const { asyncHandler } = require('../utils/asyncHandler');
const { success, created } = require('../utils/response');
const saleService = require('../services/saleService');
const purchaseService = require('../services/purchaseService');
const dashboardService = require('../services/dashboardService');
const reportService = require('../services/reportService');
const { toClientList } = require('../utils/toClient');

const sales = {
  list: asyncHandler(async (req, res) => {
    const result = await saleService.listSales(req.businessId, req.query);
    success(res, result.items, 'OK', 200, { total: result.total, page: result.page, limit: result.limit });
  }),
  get: asyncHandler(async (req, res) => {
    success(res, await saleService.getSale(req.businessId, req.params.id));
  }),
  create: asyncHandler(async (req, res) => {
    created(res, await saleService.createSale(req.user, req.body), 'Sale created');
  }),
  update: asyncHandler(async (req, res) => {
    success(res, await saleService.updateSalePayment(req.user, req.params.id, req.body.paymentStatus), 'Sale updated');
  }),
  remove: asyncHandler(async (req, res) => {
    await saleService.deleteSale(req.user, req.params.id);
    success(res, null, 'Sale deleted');
  }),
};

const purchases = {
  list: asyncHandler(async (req, res) => {
    const result = await purchaseService.listPurchases(req.businessId, req.query);
    success(res, result.items, 'OK', 200, { total: result.total, page: result.page, limit: result.limit });
  }),
  get: asyncHandler(async (req, res) => {
    success(res, await purchaseService.getPurchase(req.businessId, req.params.id));
  }),
  create: asyncHandler(async (req, res) => {
    created(res, await purchaseService.createPurchase(req.user, req.body), 'Purchase created');
  }),
  update: asyncHandler(async (req, res) => {
    success(res, await purchaseService.updatePurchase(req.user, req.params.id, req.body), 'Purchase updated');
  }),
  receive: asyncHandler(async (req, res) => {
    success(res, await purchaseService.receivePurchase(req.user, req.params.id), 'Purchase received');
  }),
  remove: asyncHandler(async (req, res) => {
    await purchaseService.deletePurchase(req.user, req.params.id);
    success(res, null, 'Purchase deleted');
  }),
};

const dashboard = {
  summary: asyncHandler(async (req, res) => {
    success(res, await dashboardService.getSummary(req.businessId));
  }),
  activities: asyncHandler(async (req, res) => {
    success(res, await dashboardService.getActivities(req.businessId, req.query));
  }),
};

const reports = {
  sales: asyncHandler(async (req, res) => {
    success(res, await reportService.salesReport(req.businessId, req.query));
  }),
  purchases: asyncHandler(async (req, res) => {
    success(res, await reportService.purchasesReport(req.businessId, req.query));
  }),
  inventory: asyncHandler(async (req, res) => {
    const data = await reportService.inventoryReport(req.businessId);
    success(res, { ...data, lowStock: toClientList(data.lowStock) });
  }),
};

module.exports = { sales, purchases, dashboard, reports };
