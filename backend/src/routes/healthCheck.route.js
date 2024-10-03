require('module-alias/register'); // Always call on top
const express = require('express');
const pool = require('../config/connectDB');
const initializeRedisClient = require('../config/connectCache');
const router = express.Router();

let redisClient;

// Function to initialize Redis client if it's not already initialized
const initRedis = async () => {
  if (!redisClient || !redisClient.isOpen) {
    redisClient = await initializeRedisClient();
  }
};

router.get('/', async (req, res) => {
  try {
    // Check PostgreSQL connection
    await pool.query('SELECT 1');
    const dbStatus = 'Connected';

    // Ensure Redis client is initialized and connected
    await initRedis();

    // Check Redis connection using the `isReady` property
    if (!redisClient.isReady) {
      return res.status(500).json({
        message: "Service Unavailable",
        server: 'Up',
        dbStatus: 'Connected',
        cacheStatus: 'Disconnected',
      });
    }

    // If everything is okay, respond with 200 status
    return res.status(200).json({
      message: "Ok",
      server: 'Up',
      dbStatus: dbStatus,
      cacheStatus: 'Connected',
    });

  } catch (error) {
    console.error('Database or Redis error:', error.message);
    res.status(500).json({
      message: "Service Unavailable",
      server: 'Up',
      dbStatus: error.message.includes('Database') ? 'Disconnected' : 'Connected',
      cacheStatus: error.message.includes('Redis') ? 'Disconnected' : 'Unknown',
    });
  }
});

module.exports = router;
