/**
 * Analytics Controller
 * Handles incoming HTTP requests for descriptive analytics APIs.
 */

const { getData, getMetadata } = require('../utils/csvLoader');
const analyticsService = require('../services/analyticsService');

/**
 * Extracts filter options from request query
 */
function extractFilters(query) {
  return {
    startDate: query.startDate || null,
    endDate: query.endDate || null,
    region: query.region || 'All',
    category: query.category || 'All',
    segment: query.segment || 'All',
    shipMode: query.shipMode || 'All',
    state: query.state || 'All'
  };
}

/**
 * GET /api/health
 */
function getHealth(req, res) {
  try {
    const meta = getMetadata();
    res.status(200).json({
      status: 'UP',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      dataset: {
        loaded: meta.loaded,
        totalRecords: meta.totalRecords,
        validRecords: meta.validRecords,
        missingPostalCodes: meta.missingPostalCodes,
        columnCount: meta.columnCount,
        columns: meta.columns,
        minDate: meta.minDate,
        maxDate: meta.maxDate
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', message: error.message });
  }
}

/**
 * GET /api/analytics/summary
 */
function getSummary(req, res) {
  try {
    const allRecords = getData();
    const filters = extractFilters(req.query);
    const filteredRecords = analyticsService.applyFilters(allRecords, filters);
    const summary = analyticsService.getSummary(filteredRecords);

    res.status(200).json({
      success: true,
      data: summary,
      filtersApplied: filters
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * GET /api/analytics/monthly-sales
 */
function getMonthlySales(req, res) {
  try {
    const allRecords = getData();
    const filters = extractFilters(req.query);
    const filteredRecords = analyticsService.applyFilters(allRecords, filters);
    const monthlySales = analyticsService.getMonthlySales(filteredRecords);

    res.status(200).json({
      success: true,
      data: monthlySales,
      filtersApplied: filters
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * GET /api/analytics/category-sales
 */
function getCategorySales(req, res) {
  try {
    const allRecords = getData();
    const filters = extractFilters(req.query);
    const filteredRecords = analyticsService.applyFilters(allRecords, filters);
    const categorySales = analyticsService.getCategorySales(filteredRecords);

    res.status(200).json({
      success: true,
      data: categorySales,
      filtersApplied: filters
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * GET /api/analytics/subcategory-sales
 */
function getSubCategorySales(req, res) {
  try {
    const allRecords = getData();
    const filters = extractFilters(req.query);
    const filteredRecords = analyticsService.applyFilters(allRecords, filters);
    const subcategorySales = analyticsService.getSubCategorySales(filteredRecords);

    res.status(200).json({
      success: true,
      data: subcategorySales,
      filtersApplied: filters
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * GET /api/analytics/region-sales
 */
function getRegionSales(req, res) {
  try {
    const allRecords = getData();
    const filters = extractFilters(req.query);
    const filteredRecords = analyticsService.applyFilters(allRecords, filters);
    const regionSales = analyticsService.getRegionSales(filteredRecords);

    res.status(200).json({
      success: true,
      data: regionSales,
      filtersApplied: filters
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * GET /api/analytics/segment-sales
 */
function getSegmentSales(req, res) {
  try {
    const allRecords = getData();
    const filters = extractFilters(req.query);
    const filteredRecords = analyticsService.applyFilters(allRecords, filters);
    const segmentSales = analyticsService.getSegmentSales(filteredRecords);

    res.status(200).json({
      success: true,
      data: segmentSales,
      filtersApplied: filters
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * GET /api/analytics/top-products
 */
function getTopProducts(req, res) {
  try {
    const allRecords = getData();
    const filters = extractFilters(req.query);
    const limit = parseInt(req.query.limit, 10) || 10;
    const filteredRecords = analyticsService.applyFilters(allRecords, filters);
    const topProducts = analyticsService.getTopProducts(filteredRecords, limit);

    res.status(200).json({
      success: true,
      data: topProducts,
      filtersApplied: filters
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * GET /api/analytics/top-states
 */
function getTopStates(req, res) {
  try {
    const allRecords = getData();
    const filters = extractFilters(req.query);
    const limit = parseInt(req.query.limit, 10) || 10;
    const filteredRecords = analyticsService.applyFilters(allRecords, filters);
    const topStates = analyticsService.getTopStates(filteredRecords, limit);

    res.status(200).json({
      success: true,
      data: topStates,
      filtersApplied: filters
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * GET /api/analytics/shipping-modes
 */
function getShippingModes(req, res) {
  try {
    const allRecords = getData();
    const filters = extractFilters(req.query);
    const filteredRecords = analyticsService.applyFilters(allRecords, filters);
    const shippingModes = analyticsService.getShippingModes(filteredRecords);

    res.status(200).json({
      success: true,
      data: shippingModes,
      filtersApplied: filters
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * GET /api/analytics/orders
 */
function getOrders(req, res) {
  try {
    const allRecords = getData();
    const filters = extractFilters(req.query);
    const filteredRecords = analyticsService.applyFilters(allRecords, filters);

    const options = {
      page: req.query.page,
      limit: req.query.limit,
      search: req.query.search,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder
    };

    const result = analyticsService.getOrders(filteredRecords, options);

    res.status(200).json({
      success: true,
      data: result.records,
      pagination: result.pagination,
      filtersApplied: filters
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * GET /api/analytics/recent-orders
 */
function getRecentOrders(req, res) {
  try {
    const allRecords = getData();
    const filters = extractFilters(req.query);
    const limit = parseInt(req.query.limit, 10) || 5;
    const filteredRecords = analyticsService.applyFilters(allRecords, filters);
    const recentOrders = analyticsService.getRecentOrders(filteredRecords, limit);

    res.status(200).json({
      success: true,
      data: recentOrders,
      filtersApplied: filters
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * GET /api/analytics/data-quality
 */
function getDataQuality(req, res) {
  try {
    const allRecords = getData();
    const summary = analyticsService.getDataQualitySummary(allRecords);

    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * GET /api/analytics/export-csv
 */
function exportCsv(req, res) {
  try {
    const allRecords = getData();
    const filters = extractFilters(req.query);
    let filteredRecords = analyticsService.applyFilters(allRecords, filters);

    const search = (req.query.search || '').trim().toLowerCase();
    if (search) {
      filteredRecords = filteredRecords.filter((r) =>
        r.orderId.toLowerCase().includes(search) ||
        r.customerName.toLowerCase().includes(search) ||
        r.productName.toLowerCase().includes(search) ||
        r.city.toLowerCase().includes(search) ||
        r.state.toLowerCase().includes(search) ||
        r.subCategory.toLowerCase().includes(search) ||
        r.category.toLowerCase().includes(search)
      );
    }

    const csvContent = analyticsService.generateCsvContent(filteredRecords);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="superstore_filtered_orders.csv"');
    res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * GET /api/analytics/filters
 */
function getFilters(req, res) {
  try {
    const allRecords = getData();
    const filterOptions = analyticsService.getFilterOptions(allRecords);

    res.status(200).json({
      success: true,
      data: filterOptions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  getHealth,
  getSummary,
  getMonthlySales,
  getCategorySales,
  getSubCategorySales,
  getRegionSales,
  getSegmentSales,
  getTopProducts,
  getTopStates,
  getShippingModes,
  getOrders,
  getRecentOrders,
  getDataQuality,
  exportCsv,
  getFilters
};
