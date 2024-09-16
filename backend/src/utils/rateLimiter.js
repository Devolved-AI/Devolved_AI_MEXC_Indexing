const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const { createClient } = require('redis');
require('dotenv').config();

const redisClient = createClient({
    legacyMode: true,
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

// Don't forget to connect
redisClient.connect().catch(console.error);

// Rate Limiter Middleware
const rateLimiter = rateLimit({
    store: new RedisStore({
        client: redisClient,
        expiry: 60, // Expiry in seconds
    }),
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: 'Too many requests, please try again later.',
});

module.exports = rateLimiter;
