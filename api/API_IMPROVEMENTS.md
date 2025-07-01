
# API Improvements & Debugging Enhancements

## Overview
This document outlines the comprehensive improvements made to the Argochain Scanner API, including enhanced logging, request tracking, error handling, performance monitoring, and standardized response formatting.

## 🚀 New Features

### 1. Comprehensive Logging System
- **Winston Logger**: Structured logging with different levels (error, warn, info, http, debug)
- **File Rotation**: Automatic log file rotation with size limits (5MB per file, 5 files max)
- **Colored Console Output**: Easy-to-read colored logs in development
- **Request Tracking**: Unique request IDs for tracking requests across the application

### 2. Request/Response Middleware
- **Request Logger**: Logs detailed request information including headers, body, query params
- **Response Formatter**: Standardizes all API responses with consistent structure
- **Performance Monitor**: Tracks response times, memory usage, and performance metrics

### 3. Enhanced Error Handling
- **Global Error Handler**: Catches all errors and provides structured error responses
- **Async Error Wrapper**: Automatic error handling for async controllers
- **Validation Error Handling**: Specific handling for different error types
- **Request ID Tracking**: All errors include request ID for debugging

### 4. Performance Monitoring
- **Request Performance**: Tracks response times and memory usage per request
- **Database Query Monitoring**: Monitors slow database queries (>500ms)
- **External API Monitoring**: Tracks external API call performance
- **System Metrics**: Memory usage, uptime, and system information

### 5. Input Validation
- **Validation Utilities**: Common validation functions for addresses, hashes, emails
- **Sanitization**: Input sanitization to prevent XSS and injection attacks
- **File Upload Validation**: Secure file upload validation with size and type checks

## 📁 File Structure

```
api/src/
├── config/
│   └── logger.js              # Winston logging configuration
├── middleware/
│   ├── requestLogger.js       # Request logging middleware
│   ├── errorHandler.js        # Error handling middleware
│   ├── responseFormatter.js   # Response formatting middleware
│   └── performanceMonitor.js  # Performance monitoring middleware
├── utils/
│   └── validation.js          # Common validation functions
└── routes/
    └── healthCheck.route.js   # Enhanced health check endpoints
```

## 🔧 Usage Examples

### 1. Using Enhanced Controllers

```javascript
const logger = require('@config/logger');
const { asyncHandler } = require('@middleware/errorHandler');
const { successResponse, errorResponse } = require('@middleware/responseFormatter');
const { isValidEthereumAddress } = require('@utils/validation');

// Enhanced controller with logging and error handling
const getTransactionDetails = asyncHandler(async (req, res) => {
  const requestId = req.requestId;
  const { address } = req.body;

  logger.info(`[${requestId}] 🔍 Fetching transaction details for address: ${address}`);

  if (!address) {
    logger.warn(`[${requestId}] Missing address in request body`);
    return errorResponse(res, 'Address is required', 400, 'MISSING_PARAMETER');
  }

  if (!isValidEthereumAddress(address)) {
    logger.warn(`[${requestId}] Invalid address format: ${address}`);
    return errorResponse(res, 'Invalid address format', 400, 'INVALID_FORMAT');
  }

  // Your business logic here
  const result = await someDatabaseQuery(address);
  
  logger.info(`[${requestId}] Successfully retrieved transaction details`);
  return successResponse(res, result, 'Transaction details retrieved successfully');
});
```

### 2. Database Query with Performance Monitoring

```javascript
const { dbPerformanceMonitor } = require('@middleware/performanceMonitor');

const getTransactions = asyncHandler(async (req, res) => {
  const requestId = req.requestId;
  
  // Monitor database query performance
  const dbMonitor = dbPerformanceMonitor(
    'SELECT * FROM transactions WHERE block_number > $1',
    [1000],
    requestId
  );
  
  const result = await query('SELECT * FROM transactions WHERE block_number > $1', [1000]);
  const queryTime = dbMonitor.end();
  
  logger.info(`[${requestId}] Query completed in ${queryTime}ms`);
  return successResponse(res, result.rows);
});
```

### 3. External API Call with Monitoring

```javascript
const { apiCallMonitor } = require('@middleware/performanceMonitor');

const fetchBlockchainData = asyncHandler(async (req, res) => {
  const requestId = req.requestId;
  
  // Monitor external API call
  const apiMonitor = apiCallMonitor('https://api.example.com/data', 'GET', requestId);
  
  try {
    const response = await axios.get('https://api.example.com/data');
    const callTime = apiMonitor.end(true);
    
    logger.info(`[${requestId}] External API call successful in ${callTime}ms`);
    return successResponse(res, response.data);
  } catch (error) {
    apiMonitor.end(false, error.message);
    throw error;
  }
});
```

## 📊 Health Check Endpoints

### 1. Basic Health Check
```bash
GET /healthCheck
```
Returns overall service health status with detailed service information.

### 2. System Metrics
```bash
GET /healthCheck/metrics
```
Returns detailed system metrics including memory usage, uptime, and environment info.

### 3. Database Test
```bash
GET /healthCheck/db-test
```
Tests database connection and returns connection pool information.

### 4. Redis Test
```bash
GET /healthCheck/redis-test
```
Tests Redis connection and returns connection status.

## 📝 Log Files

The application creates several log files in the `api/logs/` directory:

- **error.log**: Only error-level messages
- **combined.log**: All log messages
- **http.log**: HTTP request/response logs

## 🎯 Response Format

All API responses now follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully",
  "meta": {
    "requestId": "req_1234567890_abc123",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "duration": "150ms",
    "path": "/api/transactions",
    "method": "GET",
    "statusCode": 200
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "type": "VALIDATION_ERROR",
    "message": "Invalid address format",
    "requestId": "req_1234567890_abc123",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "path": "/api/transactions",
    "method": "POST",
    "details": [
      {
        "field": "address",
        "message": "Invalid Ethereum address format"
      }
    ]
  }
}
```

## 🔍 Debugging Features

### 1. Request Tracking
Every request gets a unique ID that appears in all logs:
```
[req_1234567890_abc123] 🔍 Fetching transaction details for address: 0x123...
[req_1234567890_abc123] ✅ Database query completed in 45ms
[req_1234567890_abc123] ⚡ Request completed in 150ms
```

### 2. Performance Alerts
- Slow requests (>1 second) are logged as warnings
- Slow database queries (>500ms) are logged as warnings
- High memory usage (>50MB increase) is logged as warnings

### 3. Structured Error Logging
All errors include:
- Request ID for tracking
- Full error stack trace
- Request details (URL, method, body, headers)
- Timestamp and context

## 🛠️ Environment Configuration

Set these environment variables for optimal logging:

```bash
NODE_ENV=development  # Enables debug logging
LOG_LEVEL=debug       # Sets minimum log level
```

## 📈 Monitoring Dashboard

You can monitor your API using the health check endpoints:

1. **Service Status**: `/healthCheck`
2. **System Metrics**: `/healthCheck/metrics`
3. **Database Health**: `/healthCheck/db-test`
4. **Cache Health**: `/healthCheck/redis-test`

## 🔒 Security Enhancements

- **Input Sanitization**: All inputs are sanitized to prevent XSS
- **File Upload Validation**: Secure file upload with size and type restrictions
- **Rate Limiting**: Enhanced rate limiting with detailed error messages
- **Request Logging**: All requests are logged for security auditing

## 🚀 Getting Started

1. **Install Dependencies**: `npm install`
2. **Create Logs Directory**: `mkdir -p logs`
3. **Set Environment Variables**: Configure your `.env` file
4. **Start the Server**: `npm start` or `npm run dev`

## 📚 Best Practices

1. **Always use asyncHandler**: Wrap all controller functions with `asyncHandler`
2. **Use validation utilities**: Use the provided validation functions
3. **Log important events**: Use appropriate log levels (info, warn, error, debug)
4. **Monitor performance**: Use the performance monitoring functions for database and API calls
5. **Handle errors gracefully**: Let the global error handler catch and format errors

## 🔧 Troubleshooting

### Common Issues

1. **Log files not created**: Ensure the `logs` directory exists and is writable
2. **High memory usage**: Check for memory leaks using the memory monitor
3. **Slow responses**: Use the performance monitor to identify bottlenecks
4. **Database connection issues**: Use `/healthCheck/db-test` to diagnose problems

### Debug Mode

Enable debug mode for detailed logging:
```bash
NODE_ENV=development npm start
```

This will show all debug messages and provide detailed request/response information. 