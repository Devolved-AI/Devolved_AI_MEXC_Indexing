const redis = require('redis');

let redisClient;

async function initializeRedisClient() {
  try {
    if (!redisClient) {
      // Create Redis client instance with proper error and reconnect handling
      redisClient = redis.createClient({
        url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
        socket: {
          reconnectStrategy: (retries) => {
            const delay = Math.min(retries * 100, 3000); // Max delay of 3 seconds
            console.error(`Redis disconnected. Attempting reconnect... Retry attempt #${retries}. Next attempt in ${delay}ms`);
            return delay; // Keeps retrying indefinitely
          },
        },
      });

      // Handle connection errors
      redisClient.on('error', (err) => {
        console.error('Redis client encountered an error:', err);
      });

      // Successfully connected to Redis
      redisClient.on('connect', () => {
        console.log('Successfully connected to Redis');
      });

      // Redis client is fully ready to process commands
      redisClient.on('ready', () => {
        console.log('Redis client is ready to use');
      });

      // Redis client connection closed (should reconnect automatically)
      redisClient.on('end', () => {
        console.log('Redis client connection closed unexpectedly');
      });

      // Try to connect to Redis
      await redisClient.connect();
      console.log('Redis client connected successfully.');
    }

    // Return the Redis client to be used throughout the app
    return redisClient;

  } catch (error) {
    console.error('Failed to initialize Redis client:', error);
    throw new Error('Redis client initialization failed');
  }
}

// No shutdown logic as Redis should remain open

module.exports = {
  initializeRedisClient,
};
