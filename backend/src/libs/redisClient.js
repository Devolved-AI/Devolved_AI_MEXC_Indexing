const { createClient } = require('redis');

let redisClient;

async function initializeRedisClient() {
  if (!redisClient) {
    redisClient = createClient({
      url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    });

    redisClient.on('error', (err) => {
      console.error('Redis error:', err);
    });

    await redisClient.connect().catch(err => {
      console.error('Failed to connect to Redis:', err);
    });

    console.log('Connected to Redis');
  }

  return redisClient;
}

module.exports = initializeRedisClient;
