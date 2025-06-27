const logger = require('@config/logger');

/**
 * Performance monitoring middleware
 */
const performanceMonitor = (req, res, next) => {
  const startTime = process.hrtime();
  const startMemory = process.memoryUsage();
  const requestId = req.requestId || 'unknown';
  
  // Log request start with performance metrics
  logger.debug(`[${requestId}] 🚀 Request started - Memory: ${formatBytes(startMemory.heapUsed)}`);
  
  // Override res.end to capture response metrics
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const endTime = process.hrtime(startTime);
    const endMemory = process.memoryUsage();
    const duration = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2); // Convert to milliseconds
    const memoryDiff = endMemory.heapUsed - startMemory.heapUsed;
    
    // Log performance metrics
    logger.info(`[${requestId}] ⚡ Request completed in ${duration}ms`);
    logger.debug(`[${requestId}] 📊 Performance metrics:`, {
      duration: `${duration}ms`,
      memoryUsed: formatBytes(memoryDiff),
      totalMemory: formatBytes(endMemory.heapUsed),
      statusCode: res.statusCode,
      contentLength: chunk ? chunk.length : 0
    });
    
    // Log slow requests (over 1 second)
    if (parseFloat(duration) > 1000) {
      logger.warn(`[${requestId}] 🐌 Slow request detected: ${duration}ms for ${req.method} ${req.originalUrl}`);
    }
    
    // Log high memory usage (over 50MB increase)
    if (memoryDiff > 50 * 1024 * 1024) {
      logger.warn(`[${requestId}] 💾 High memory usage detected: ${formatBytes(memoryDiff)} for ${req.method} ${req.originalUrl}`);
    }
    
    return originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

/**
 * Database query performance monitor
 */
const dbPerformanceMonitor = (query, params = [], requestId = 'unknown') => {
  const startTime = process.hrtime();
  
  logger.debug(`[${requestId}] 🗄️ Database query started: ${query.substring(0, 100)}...`);
  
  return {
    end: () => {
      const endTime = process.hrtime(startTime);
      const duration = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
      
      logger.debug(`[${requestId}] ✅ Database query completed in ${duration}ms`);
      
      // Log slow queries (over 500ms)
      if (parseFloat(duration) > 500) {
        logger.warn(`[${requestId}] 🐌 Slow database query detected: ${duration}ms`);
        logger.debug(`[${requestId}] Query: ${query}`);
        logger.debug(`[${requestId}] Parameters: ${JSON.stringify(params)}`);
      }
      
      return duration;
    }
  };
};

/**
 * External API call performance monitor
 */
const apiCallMonitor = (url, method = 'GET', requestId = 'unknown') => {
  const startTime = process.hrtime();
  
  logger.debug(`[${requestId}] 🌐 External API call started: ${method} ${url}`);
  
  return {
    end: (success = true, error = null) => {
      const endTime = process.hrtime(startTime);
      const duration = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
      
      if (success) {
        logger.debug(`[${requestId}] ✅ External API call completed in ${duration}ms`);
      } else {
        logger.error(`[${requestId}] ❌ External API call failed after ${duration}ms: ${error}`);
      }
      
      // Log slow API calls (over 2 seconds)
      if (parseFloat(duration) > 2000) {
        logger.warn(`[${requestId}] 🐌 Slow external API call detected: ${duration}ms for ${method} ${url}`);
      }
      
      return duration;
    }
  };
};

/**
 * Memory usage monitor
 */
const memoryMonitor = () => {
  const memory = process.memoryUsage();
  
  logger.debug('💾 Memory usage:', {
    rss: formatBytes(memory.rss),
    heapTotal: formatBytes(memory.heapTotal),
    heapUsed: formatBytes(memory.heapUsed),
    external: formatBytes(memory.external),
    arrayBuffers: formatBytes(memory.arrayBuffers)
  });
  
  // Log high memory usage warnings
  if (memory.heapUsed > 500 * 1024 * 1024) { // 500MB
    logger.warn('⚠️ High heap memory usage detected:', formatBytes(memory.heapUsed));
  }
  
  return memory;
};

/**
 * Format bytes to human readable format
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get system performance metrics
 */
const getSystemMetrics = () => {
  const memory = process.memoryUsage();
  const uptime = process.uptime();
  
  return {
    memory: {
      rss: formatBytes(memory.rss),
      heapTotal: formatBytes(memory.heapTotal),
      heapUsed: formatBytes(memory.heapUsed),
      external: formatBytes(memory.external),
      arrayBuffers: formatBytes(memory.arrayBuffers)
    },
    uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`,
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch
  };
};

module.exports = {
  performanceMonitor,
  dbPerformanceMonitor,
  apiCallMonitor,
  memoryMonitor,
  getSystemMetrics
}; 