require('module-alias/register'); // Always call on top
const express = require('express');
const pool = require('@config/connectDB');
const initializeRedisClient = require('@config/connectCache');
const logger = require('@config/logger');
const { asyncHandler } = require('@middleware/errorHandler');
const { successResponse, errorResponse } = require('@middleware/responseFormatter');
const { getSystemMetrics } = require('@middleware/performanceMonitor');
const router = express.Router();

let redisClient;

// Function to initialize Redis client if it's not already initialized
const initRedis = async () => {
  if (!redisClient || !redisClient.isOpen) {
    redisClient = await initializeRedisClient();
  }
};

// Enhanced health check with detailed metrics
router.get('/', asyncHandler(async (req, res) => {
  const requestId = req.requestId;
  const startTime = Date.now();
  
  logger.info(`[${requestId}] 🏥 Health check requested`);
  
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    services: {}
  };

  try {
    // Check PostgreSQL connection
    logger.debug(`[${requestId}] Checking PostgreSQL connection...`);
    const dbStartTime = Date.now();
    await pool.query('SELECT 1');
    const dbResponseTime = Date.now() - dbStartTime;
    
    healthStatus.services.database = {
      status: 'connected',
      responseTime: `${dbResponseTime}ms`,
      type: 'PostgreSQL'
    };
    
    logger.debug(`[${requestId}] PostgreSQL connection successful (${dbResponseTime}ms)`);

    // Check Redis connection
    logger.debug(`[${requestId}] Checking Redis connection...`);
    const redisStartTime = Date.now();
    await initRedis();
    
    if (!redisClient.isReady) {
      healthStatus.services.cache = {
        status: 'disconnected',
        type: 'Redis',
        error: 'Redis client not ready'
      };
      logger.warn(`[${requestId}] Redis connection failed`);
    } else {
      // Test Redis with a simple ping
      await redisClient.ping();
      const redisResponseTime = Date.now() - redisStartTime;
      
      healthStatus.services.cache = {
        status: 'connected',
        responseTime: `${redisResponseTime}ms`,
        type: 'Redis'
      };
      
      logger.debug(`[${requestId}] Redis connection successful (${redisResponseTime}ms)`);
    }

    // Get system metrics
    const systemMetrics = getSystemMetrics();
    healthStatus.system = systemMetrics;
    
    // Check if any service is down
    const hasDisconnectedService = Object.values(healthStatus.services).some(
      service => service.status === 'disconnected'
    );
    
    if (hasDisconnectedService) {
      healthStatus.status = 'degraded';
      logger.warn(`[${requestId}] Health check shows degraded service`);
    }
    
    const totalResponseTime = Date.now() - startTime;
    healthStatus.responseTime = `${totalResponseTime}ms`;
    
    logger.info(`[${requestId}] Health check completed successfully (${totalResponseTime}ms)`);
    
    return successResponse(res, healthStatus, 'Service health check completed', 200);

  } catch (error) {
    logger.error(`[${requestId}] Health check failed:`, error);
    
    healthStatus.status = 'unhealthy';
    healthStatus.error = error.message;
    healthStatus.responseTime = `${Date.now() - startTime}ms`;
    
    // Determine which service failed
    if (error.message.includes('Database') || error.message.includes('PostgreSQL')) {
      healthStatus.services.database = {
        status: 'disconnected',
        type: 'PostgreSQL',
        error: error.message
      };
    } else if (error.message.includes('Redis')) {
      healthStatus.services.cache = {
        status: 'disconnected',
        type: 'Redis',
        error: error.message
      };
    }
    
    return errorResponse(res, 'Service health check failed', 503, 'SERVICE_UNAVAILABLE');
  }
}));

// Detailed system metrics endpoint
router.get('/metrics', asyncHandler(async (req, res) => {
  const requestId = req.requestId;
  
  logger.info(`[${requestId}] 📊 System metrics requested`);
  
  try {
    const metrics = {
      system: getSystemMetrics(),
      process: {
        pid: process.pid,
        version: process.version,
        platform: process.platform,
        arch: process.arch,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage()
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        port: process.env.PORT || 4000,
        hasMongoDB: !!process.env.MONGODB_URI,
        hasRedis: !!process.env.REDIS_URL,
        hasRPC: !!process.env.ARGOCHAIN_RPC_URL
      },
      timestamp: new Date().toISOString()
    };
    
    logger.debug(`[${requestId}] System metrics retrieved successfully`);
    return successResponse(res, metrics, 'System metrics retrieved successfully');
    
  } catch (error) {
    logger.error(`[${requestId}] Failed to retrieve system metrics:`, error);
    throw new Error(`Failed to retrieve system metrics: ${error.message}`);
  }
}));

// Database connection test endpoint
router.get('/db-test', asyncHandler(async (req, res) => {
  const requestId = req.requestId;
  
  logger.info(`[${requestId}] 🗄️ Database connection test requested`);
  
  try {
    const startTime = Date.now();
    const result = await pool.query('SELECT version(), current_timestamp, current_database()');
    const responseTime = Date.now() - startTime;
    
    const dbInfo = {
      version: result.rows[0].version,
      currentTime: result.rows[0].current_timestamp,
      database: result.rows[0].current_database,
      responseTime: `${responseTime}ms`,
      connectionPool: {
        totalCount: pool.totalCount,
        idleCount: pool.idleCount,
        waitingCount: pool.waitingCount
      }
    };
    
    logger.info(`[${requestId}] Database connection test successful (${responseTime}ms)`);
    return successResponse(res, dbInfo, 'Database connection test successful');
    
  } catch (error) {
    logger.error(`[${requestId}] Database connection test failed:`, error);
    throw new Error(`Database connection test failed: ${error.message}`);
  }
}));

// Redis connection test endpoint
router.get('/redis-test', asyncHandler(async (req, res) => {
  const requestId = req.requestId;
  
  logger.info(`[${requestId}] 🔴 Redis connection test requested`);
  
  try {
    await initRedis();
    
    if (!redisClient.isReady) {
      throw new Error('Redis client is not ready');
    }
    
    const startTime = Date.now();
    const pingResult = await redisClient.ping();
    const responseTime = Date.now() - startTime;
    
    const redisInfo = {
      ping: pingResult,
      responseTime: `${responseTime}ms`,
      isReady: redisClient.isReady,
      isOpen: redisClient.isOpen
    };
    
    logger.info(`[${requestId}] Redis connection test successful (${responseTime}ms)`);
    return successResponse(res, redisInfo, 'Redis connection test successful');
    
  } catch (error) {
    logger.error(`[${requestId}] Redis connection test failed:`, error);
    throw new Error(`Redis connection test failed: ${error.message}`);
  }
}));

module.exports = router;