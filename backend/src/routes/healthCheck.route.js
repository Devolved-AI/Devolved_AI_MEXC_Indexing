require('module-alias/register'); // Always call on top
const express = require('express');
const pool = require('@config/connectDB'); // Assuming you save the PostgreSQL connection as postgres.js
const redisClient = require('@config/connectCache'); // Assuming you save the Redis connection as redis.js
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // Check PostgreSQL connection
    await pool.query('SELECT 1');
    const dbStatus = 'Connected';

    // Check Redis connection
    redisClient.ping((err, result) => {
      if (err || result !== 'PONG') {
        return res.status(500).json({
          message: "Service Unavailable",
          server: 'Up',
          dbStatus: 'Connected',
          cacheStatus: 'Disconnected',
        });
      }

      res.status(200).json({
        message: "Ok",
        server: 'Up',
        dbStatus: dbStatus,
        cacheStatus: 'Connected',
      });
    });

  } catch (error) {
    console.error('Database error:', error.message);
    res.status(500).json({
      message: "Service Unavailable",
      server: 'Up',
      dbStatus: 'Disconnected',
      cacheStatus: 'Unknown', // Redis status is unknown at this point
    });
  }
});

module.exports = router;
