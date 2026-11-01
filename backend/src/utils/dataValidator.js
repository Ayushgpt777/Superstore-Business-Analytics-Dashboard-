/**
 * Data Validator Utility
 * Validates Kaggle Sample Superstore schema and transforms records.
 *
 * Rules:
 * - Exactly 18 expected columns.
 * - NO Profit, Discount, or Quantity columns allowed.
 * - Safely handles missing Postal Code (e.g. Burlington, Vermont).
 * - Accurately parses DD/MM/YYYY date format to ISO YYYY-MM-DD.
 */

const EXPECTED_COLUMNS = [
  'Row ID',
  'Order ID',
  'Order Date',
  'Ship Date',
  'Ship Mode',
  'Customer ID',
  'Customer Name',
  'Segment',
  'Country',
  'City',
  'State',
  'Postal Code',
  'Region',
  'Product ID',
  'Category',
  'Sub-Category',
  'Product Name',
  'Sales'
];

const DISALLOWED_COLUMNS = ['Profit', 'Discount', 'Quantity'];

/**
 * Validates CSV header columns
 * @param {Array<string>} headers
 * @returns {{ valid: boolean, errors: Array<string> }}
 */
function validateHeaders(headers) {
  const errors = [];
  const normalizedHeaders = headers.map(h => h.trim());

  // Check for disallowed columns
  for (const disallowed of DISALLOWED_COLUMNS) {
    if (normalizedHeaders.includes(disallowed)) {
      errors.push(`Disallowed column detected: '${disallowed}'. Dataset must not contain or use Profit, Discount, or Quantity.`);
    }
  }

  // Check for missing expected columns
  for (const expected of EXPECTED_COLUMNS) {
    if (!normalizedHeaders.includes(expected)) {
      errors.push(`Missing mandatory column: '${expected}'`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Parses a date string in DD/MM/YYYY format to ISO YYYY-MM-DD and timestamp
 * @param {string} dateStr - Date string, e.g. "08/11/2017"
 * @returns {{ iso: string, timestamp: number, year: number, month: number, day: number } | null}
 */
function parseDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;

  const parts = dateStr.trim().split('/');
  if (parts.length !== 3) return null;

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);

  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  const paddedDay = String(day).padStart(2, '0');
  const paddedMonth = String(month).padStart(2, '0');
  const iso = `${year}-${paddedMonth}-${paddedDay}`;
  const timestamp = new Date(Date.UTC(year, month - 1, day)).getTime();

  return {
    iso,
    timestamp,
    year,
    month,
    day
  };
}

/**
 * Sanitizes and validates a single CSV row
 * @param {Object} rawRow
 * @returns {Object|null}
 */
function validateAndTransformRow(rawRow) {
  if (!rawRow) return null;

  const rowId = parseInt(rawRow['Row ID'], 10);
  const orderId = (rawRow['Order ID'] || '').trim();
  const orderDateRaw = (rawRow['Order Date'] || '').trim();
  const shipDateRaw = (rawRow['Ship Date'] || '').trim();
  const shipMode = (rawRow['Ship Mode'] || '').trim();
  const customerId = (rawRow['Customer ID'] || '').trim();
  const customerName = (rawRow['Customer Name'] || '').trim();
  const segment = (rawRow['Segment'] || '').trim();
  const country = (rawRow['Country'] || '').trim();
  const city = (rawRow['City'] || '').trim();
  const state = (rawRow['State'] || '').trim();

  // Missing Postal Code handling: If missing or whitespace, assign "N/A"
  let postalCode = (rawRow['Postal Code'] || '').trim();
  const isPostalCodeMissing = !postalCode || postalCode.length === 0;
  if (isPostalCodeMissing) {
    postalCode = 'N/A';
  }

  const region = (rawRow['Region'] || '').trim();
  const productId = (rawRow['Product ID'] || '').trim();
  const category = (rawRow['Category'] || '').trim();
  const subCategory = (rawRow['Sub-Category'] || '').trim();
  const productName = (rawRow['Product Name'] || '').trim();

  // Parse Sales as float
  const salesRaw = rawRow['Sales'];
  const sales = parseFloat(salesRaw);

  if (isNaN(sales) || sales < 0) {
    return null;
  }

  const orderDateParsed = parseDate(orderDateRaw);
  const shipDateParsed = parseDate(shipDateRaw);

  if (!orderDateParsed) {
    return null;
  }

  return {
    rowId: isNaN(rowId) ? 0 : rowId,
    orderId,
    orderDate: orderDateParsed.iso,
    orderDateRaw,
    orderTimestamp: orderDateParsed.timestamp,
    orderYear: orderDateParsed.year,
    orderMonth: orderDateParsed.month,
    shipDate: shipDateParsed ? shipDateParsed.iso : orderDateParsed.iso,
    shipDateRaw,
    shipMode,
    customerId,
    customerName,
    segment,
    country,
    city,
    state,
    postalCode,
    isPostalCodeMissing,
    region,
    productId,
    category,
    subCategory,
    productName,
    sales: Math.round(sales * 100) / 100
  };
}

module.exports = {
  EXPECTED_COLUMNS,
  DISALLOWED_COLUMNS,
  validateHeaders,
  parseDate,
  validateAndTransformRow
};
