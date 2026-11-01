/**
 * Analytics API Routes
 */

const express = require('express');
const router = express.Router();
const controller = require('../controllers/analyticsController');

// Health check endpoint
router.get('/health', controller.getHealth);

// Descriptive analytics endpoints
router.get('/analytics/summary', controller.getSummary);
router.get('/analytics/monthly-sales', controller.getMonthlySales);
router.get('/analytics/category-sales', controller.getCategorySales);
router.get('/analytics/subcategory-sales', controller.getSubCategorySales);
router.get('/analytics/region-sales', controller.getRegionSales);
router.get('/analytics/segment-sales', controller.getSegmentSales);
router.get('/analytics/top-products', controller.getTopProducts);
router.get('/analytics/top-states', controller.getTopStates);
router.get('/analytics/shipping-modes', controller.getShippingModes);
router.get('/analytics/orders', controller.getOrders);
router.get('/analytics/recent-orders', controller.getRecentOrders);
router.get('/analytics/data-quality', controller.getDataQuality);
router.get('/analytics/export-csv', controller.exportCsv);
router.get('/analytics/filters', controller.getFilters);

module.exports = router;
