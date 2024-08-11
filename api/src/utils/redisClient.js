// src/utils/redisClient.js
const { createClient } = require('redis');
require('dotenv').config();

const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
});

redisClient.on('error', (err) => {
  console.error('Redis client error:', err);
});

redisClient.connect()
  .then(() => console.log('Connected to Redis'))
  .catch((err) => console.error('Redis connection error:', err));

module.exports = redisClient;
