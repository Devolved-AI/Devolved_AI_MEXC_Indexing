const logger = require('@config/logger');

/**
 * Validation utility functions
 */

/**
 * Validate Ethereum address format
 * @param {string} address - The address to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const isValidEthereumAddress = (address) => {
  if (!address || typeof address !== 'string') {
    return false;
  }
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * Validate transaction hash format
 * @param {string} hash - The transaction hash to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const isValidTransactionHash = (hash) => {
  if (!hash || typeof hash !== 'string') {
    return false;
  }
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
};

/**
 * Validate block number format
 * @param {string|number} blockNumber - The block number to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const isValidBlockNumber = (blockNumber) => {
  if (blockNumber === null || blockNumber === undefined) {
    return false;
  }
  const num = parseInt(blockNumber);
  return !isNaN(num) && num >= 0;
};

/**
 * Validate pagination parameters
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Object} - Normalized pagination parameters
 */
const validatePagination = (page = 1, limit = 10) => {
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
  
  return {
    page: pageNum,
    limit: limitNum,
    offset: (pageNum - 1) * limitNum
  };
};

/**
 * Validate email format
 * @param {string} email - The email to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate JWT token format
 * @param {string} token - The token to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const isValidJWTToken = (token) => {
  if (!token || typeof token !== 'string') {
    return false;
  }
  // Basic JWT format validation (3 parts separated by dots)
  const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
  return jwtRegex.test(token);
};

/**
 * Sanitize and validate string input
 * @param {string} input - The input to sanitize
 * @param {number} maxLength - Maximum allowed length
 * @returns {string|null} - Sanitized string or null if invalid
 */
const sanitizeString = (input, maxLength = 1000) => {
  if (!input || typeof input !== 'string') {
    return null;
  }
  
  const sanitized = input.trim().replace(/[<>]/g, '');
  
  if (sanitized.length > maxLength) {
    return null;
  }
  
  return sanitized;
};

/**
 * Validate and parse JSON string
 * @param {string} jsonString - The JSON string to parse
 * @returns {Object|null} - Parsed object or null if invalid
 */
const parseJSON = (jsonString) => {
  if (!jsonString || typeof jsonString !== 'string') {
    return null;
  }
  
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    logger.debug(`Failed to parse JSON string: ${error.message}`);
    return null;
  }
};

/**
 * Validate file upload
 * @param {Object} file - The uploaded file object
 * @param {Array} allowedTypes - Array of allowed MIME types
 * @param {number} maxSize - Maximum file size in bytes
 * @returns {Object} - Validation result
 */
const validateFileUpload = (file, allowedTypes = [], maxSize = 5 * 1024 * 1024) => {
  if (!file) {
    return { isValid: false, error: 'No file uploaded' };
  }
  
  if (file.size > maxSize) {
    return { isValid: false, error: `File size exceeds maximum limit of ${maxSize} bytes` };
  }
  
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
    return { isValid: false, error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}` };
  }
  
  return { isValid: true };
};

/**
 * Log validation errors
 * @param {string} requestId - Request ID for tracking
 * @param {string} field - Field name that failed validation
 * @param {string} value - Value that failed validation
 * @param {string} validationType - Type of validation that failed
 */
const logValidationError = (requestId, field, value, validationType) => {
  logger.warn(`[${requestId}] Validation failed for field "${field}": ${validationType} (value: ${value})`);
};

module.exports = {
  isValidEthereumAddress,
  isValidTransactionHash,
  isValidBlockNumber,
  validatePagination,
  isValidEmail,
  isValidJWTToken,
  sanitizeString,
  parseJSON,
  validateFileUpload,
  logValidationError
}; 