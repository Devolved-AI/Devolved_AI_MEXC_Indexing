require('module-alias/register'); // Always call on top
require('dotenv').config(); // Load environment variables

const createTables = require('@config/initializeDB');
const fetchChainData = require('@controllers/fetchChainData');
const cacheListener = require('@controllers/cacheListener');

// Libraries
const express = require('express');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const hpp = require('hpp');
const { createLogger, transports, format } = require('winston');

// Routes
const healthCheckRoute = require('@routes/healthCheck.route');

const app = express();

// Logger setup
const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp(),
        format.json()
    ),
    transports: [
        new transports.File({ filename: 'error.log', level: 'error' }),
        new transports.File({ filename: 'combined.log' }),
    ],
});

// Set security HTTP headers
app.use(helmet());

// Use compression middleware
app.use(compression());

// Middleware for parsing JSON and URL-encoded data
app.use(express.json({ limit: '4mb' })); // Adjusted limit for better performance
app.use(express.urlencoded({ limit: '4mb', extended: true }));

// Enable CORS
app.use(cors());

// Prevent parameter pollution
app.use(hpp());

// Rate limiter
app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
}));

// Health check route
app.use('/healthCheck', healthCheckRoute);

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error(err.message);
    return res.status(500).json({
        status: 500,
        success: false,
        message: 'Something went wrong!'
    });
});

// Initialize the database tables when the server starts
createTables()
    .then(() => {
        console.log('5.2 Database initialized and tables created successfully');
    })
    .catch((error) => {
        logger.error(`Error initializing database: ${error.message}`);
        process.exit(1); // Exit process if database initialization fails
    });

// Start fetching blockchain data as soon as the server starts
cacheListener()
    .then(() => {
        console.log('2. Started caching database');
    })
    .catch((error) => {
        logger.error(`Error starting cache fetch: ${error.message}`);
    });

    cacheListener

// Server run
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`1. Server running on port ${PORT}`);
});