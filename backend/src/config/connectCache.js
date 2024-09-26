const redis = require('redis');

let redisClient;

async function initializeRedisClient() {
  if (!redisClient) {
    redisClient = redis.createClient({
      url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
      socket: {
        reconnectStrategy: (retries) => {
          console.error(`Redis disconnected. Attempting reconnect... Retry attempt #${retries}`);
          return Math.min(retries * 100, 3000);
        },
      },
    });

    redisClient.on('error', (err) => {
      console.error('Redis error:', err);
    });

    redisClient.on('connect', () => {
      console.log('Connected to Redis');
    });

    redisClient.on('ready', () => {
      console.log('Redis client is ready');
    });

    await redisClient.connect().catch((err) => {
      console.error('Failed to connect to Redis:', err);
    });
  }

  return redisClient;
}

module.exports = initializeRedisClient;
