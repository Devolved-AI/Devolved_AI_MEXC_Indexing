const logger = require('@config/logger');

/**
 * Middleware to log detailed request information
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  const requestId = generateRequestId();
  
  // Add request ID to request object for tracking
  req.requestId = requestId;
  
  // Log request details
  logger.info(`[${requestId}] ${req.method} ${req.originalUrl} - Request started`);
  logger.debug(`[${requestId}] Request Headers: ${JSON.stringify(req.headers, null, 2)}`);
  logger.debug(`[${requestId}] Request Query: ${JSON.stringify(req.query, null, 2)}`);
  logger.debug(`[${requestId}] Request Body: ${JSON.stringify(req.body, null, 2)}`);
  logger.debug(`[${requestId}] Request IP: ${req.ip || req.connection.remoteAddress}`);
  logger.debug(`[${requestId}] User Agent: ${req.get('User-Agent')}`);
  
  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(data) {
    const duration = Date.now() - start;
    logger.info(`[${requestId}] ${req.method} ${req.originalUrl} - Response sent (${duration}ms)`);
    logger.debug(`[${requestId}] Response Status: ${res.statusCode}`);
    logger.debug(`[${requestId}] Response Body: ${JSON.stringify(data, null, 2)}`);
    return originalJson.call(this, data);
  };
  
  // Override res.status to capture status code
  const originalStatus = res.status;
  res.status = function(code) {
    logger.debug(`[${requestId}] Setting response status: ${code}`);
    return originalStatus.call(this, code);
  };
  
  next();
};

/**
 * Generate a unique request ID
 */
function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

module.exports = requestLogger; 