/**
 * CSV Loader Utility
 * Reads, parses and validates Kaggle Sample Superstore dataset from disk.
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { validateHeaders, validateAndTransformRow } = require('./dataValidator');

// Primary CSV path inside backend/data/superstore.csv
const CSV_FILE_PATH = path.join(__dirname, '..', '..', 'data', 'superstore.csv');

let cachedRecords = [];
let datasetMetadata = {
  loaded: false,
  filePath: CSV_FILE_PATH,
  totalRecords: 0,
  validRecords: 0,
  invalidRecords: 0,
  missingPostalCodes: 0,
  columnCount: 18,
  columns: [],
  loadDurationMs: 0,
  loadTimestamp: null,
  minDate: null,
  maxDate: null
};

/**
 * Loads and parses the Superstore CSV dataset into memory
 * @param {string} customPath - Optional custom path to CSV
 * @returns {Promise<Array<Object>>}
 */
function loadData(customPath) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const filePath = customPath || CSV_FILE_PATH;

    if (!fs.existsSync(filePath)) {
      return reject(
        new Error(
          `CSV dataset not found at expected location: ${filePath}. Please ensure backend/data/superstore.csv exists.`
        )
      );
    }

    const records = [];
    let headersChecked = false;
    let missingPostalCount = 0;
    let invalidCount = 0;
    let headersList = [];

    const stream = fs.createReadStream(filePath);

    stream
      .pipe(csv())
      .on('headers', (headers) => {
        headersList = headers;
        const validation = validateHeaders(headers);
        if (!validation.valid) {
          stream.destroy();
          return reject(
            new Error(`CSV Schema Validation Failed:\n${validation.errors.join('\n')}`)
          );
        }
        headersChecked = true;
      })
      .on('data', (rawRow) => {
        const transformed = validateAndTransformRow(rawRow);
        if (transformed) {
          if (transformed.isPostalCodeMissing) {
            missingPostalCount++;
          }
          records.push(transformed);
        } else {
          invalidCount++;
        }
      })
      .on('end', () => {
        cachedRecords = records;

        // Compute date bounds
        let minDate = null;
        let maxDate = null;
        if (records.length > 0) {
          minDate = records.reduce((min, r) => (r.orderDate < min ? r.orderDate : min), records[0].orderDate);
          maxDate = records.reduce((max, r) => (r.orderDate > max ? r.orderDate : max), records[0].orderDate);
        }

        datasetMetadata = {
          loaded: true,
          filePath,
          totalRecords: records.length + invalidCount,
          validRecords: records.length,
          invalidRecords: invalidCount,
          missingPostalCodes: missingPostalCount,
          columnCount: headersList.length,
          columns: headersList,
          loadDurationMs: Date.now() - startTime,
          loadTimestamp: new Date().toISOString(),
          minDate,
          maxDate
        };

        console.log(`[CSV Loader] Successfully loaded ${records.length} records in ${datasetMetadata.loadDurationMs}ms`);
        console.log(`[CSV Loader] Missing Postal Code records handled: ${missingPostalCount}`);
        console.log(`[CSV Loader] Date range: ${minDate} to ${maxDate}`);

        resolve(cachedRecords);
      })
      .on('error', (err) => {
        reject(new Error(`Failed to stream and parse CSV: ${err.message}`));
      });
  });
}

/**
 * Returns loaded records from memory cache
 * @returns {Array<Object>}
 */
function getData() {
  return cachedRecords;
}

/**
 * Returns metadata about loaded dataset
 * @returns {Object}
 */
function getMetadata() {
  return datasetMetadata;
}

module.exports = {
  CSV_FILE_PATH,
  loadData,
  getData,
  getMetadata
};
