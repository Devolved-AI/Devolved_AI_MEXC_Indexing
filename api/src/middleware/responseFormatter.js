const logger = require('@config/logger');

/**
 * Response formatter middleware
 */
const responseFormatter = (req, res, next) => {
  const requestId = req.requestId || 'unknown';
  const startTime = Date.now();
  
  // Store original json method
  const originalJson = res.json;
  
  // Override json method to format responses
  res.json = function(data) {
    const duration = Date.now() - startTime;
    
    // Format the response
    const formattedResponse = {
      success: true,
      data: data,
      meta: {
        requestId: requestId,
        timestamp: new Date().toISOString(),
        duration: `${duration}ms`,
        path: req.originalUrl,
        method: req.method,
        statusCode: res.statusCode
      }
    };
    
    // Log successful response
    logger.info(`[${requestId}] Response formatted successfully (${duration}ms)`);
    logger.debug(`[${requestId}] Formatted response: ${JSON.stringify(formattedResponse, null, 2)}`);
    
    return originalJson.call(this, formattedResponse);
  };
  
  // Override status method to capture status code
  const originalStatus = res.status;
  res.status = function(code) {
    logger.debug(`[${requestId}] Setting response status: ${code}`);
    return originalStatus.call(this, code);
  };
  
  next();
};

/**
 * Success response helper
 */
const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  const requestId = res.req?.requestId || 'unknown';
  
  logger.info(`[${requestId}] Sending success response: ${message}`);
  
  return res.status(statusCode).json({
    success: true,
    data: data,
    message: message,
    meta: {
      requestId: requestId,
      timestamp: new Date().toISOString(),
      statusCode: statusCode
    }
  });
};

/**
 * Error response helper
 */
const errorResponse = (res, message, statusCode = 500, errorType = 'INTERNAL_ERROR') => {
  const requestId = res.req?.requestId || 'unknown';
  
  logger.error(`[${requestId}] Sending error response: ${message}`);
  
  return res.status(statusCode).json({
    success: false,
    error: {
      type: errorType,
      message: message,
      requestId: requestId,
      timestamp: new Date().toISOString(),
      statusCode: statusCode
    }
  });
};

/**
 * Pagination response helper
 */
const paginatedResponse = (res, data, page, limit, total, message = 'Data retrieved successfully') => {
  const requestId = res.req?.requestId || 'unknown';
  const totalPages = Math.ceil(total / limit);
  
  logger.info(`[${requestId}] Sending paginated response: ${data.length} items, page ${page}/${totalPages}`);
  
  return res.status(200).json({
    success: true,
    data: data,
    message: message,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: total,
      totalPages: totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    },
    meta: {
      requestId: requestId,
      timestamp: new Date().toISOString(),
      statusCode: 200
    }
  });
};

module.exports = {
  responseFormatter,
  successResponse,
  errorResponse,
  paginatedResponse
}; 