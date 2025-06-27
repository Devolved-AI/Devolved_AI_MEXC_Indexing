const logger = require('@config/logger');

/**
 * Error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  const requestId = req.requestId || 'unknown';
  
  // Log error details
  logger.error(`[${requestId}] Error occurred: ${err.message}`);
  logger.error(`[${requestId}] Error Stack: ${err.stack}`);
  logger.error(`[${requestId}] Request URL: ${req.method} ${req.originalUrl}`);
  logger.error(`[${requestId}] Request Body: ${JSON.stringify(req.body, null, 2)}`);
  logger.error(`[${requestId}] Request Headers: ${JSON.stringify(req.headers, null, 2)}`);
  
  // Determine error type and status code
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errorType = 'INTERNAL_ERROR';
  
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errorType = 'VALIDATION_ERROR';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
    errorType = 'CAST_ERROR';
  } else if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate field value';
    errorType = 'DUPLICATE_ERROR';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    errorType = 'JWT_ERROR';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    errorType = 'JWT_EXPIRED';
  } else if (err.status) {
    statusCode = err.status;
    message = err.message || message;
    errorType = err.errorType || 'CUSTOM_ERROR';
  }
  
  // Create error response
  const errorResponse = {
    success: false,
    error: {
      type: errorType,
      message: message,
      requestId: requestId,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method
    }
  };
  
  // Add validation errors if available
  if (err.errors) {
    errorResponse.error.details = Object.keys(err.errors).map(key => ({
      field: key,
      message: err.errors[key].message
    }));
  }
  
  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
  }
  
  logger.error(`[${requestId}] Sending error response: ${JSON.stringify(errorResponse, null, 2)}`);
  
  res.status(statusCode).json(errorResponse);
};

/**
 * Async error wrapper for controllers
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Not found middleware
 */
const notFound = (req, res, next) => {
  const requestId = req.requestId || 'unknown';
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.status = 404;
  error.errorType = 'NOT_FOUND';
  
  logger.warn(`[${requestId}] Route not found: ${req.method} ${req.originalUrl}`);
  next(error);
};

module.exports = {
  errorHandler,
  asyncHandler,
  notFound
}; 