require('module-alias/register'); // always call on top
require('dotenv').config(); // Load environment variables

const createTables = require('@config/initializeDB');
const fetchChainData = require('@controllers/fetchChainData');

// libraries
const express = require('express');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const DOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const hpp = require('hpp');
const { createLogger, transports, format } = require('winston');

// routes
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

// set security HTTP headers
app.use(helmet());

//Use compression middleware
app.use(compression());

// Other middlewares like express.json() can be used after compression
// app.use(express.json());
app.use(express.json({ limit: '4gb' }));
app.use(express.urlencoded({ limit: '4gb', extended: true }));

// enable cors
app.use(cors());
app.options('*', cors());

// Data sanitization against XSS
// Initialize DOMPurify with jsdom
const window = (new JSDOM('')).window;
const dompurify = DOMPurify(window);

// Middleware to sanitize user inputs
app.use((req, res, next) => {
    for (const prop in req.body) {
        if (Object.hasOwnProperty.call(req.body, prop)) {
            req.body[prop] = dompurify.sanitize(req.body[prop]);
        }
    }
    next();
});

// Prevent parameter pollution
app.use(hpp());

// rate limiter
app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10000, // limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
}));

// health check
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
      console.log('Database initialized and tables created successfully');
    })
    .catch((error) => {
      console.error('Error initializing database:', error);
    });
  
  // Start fetching blockchain data as soon as the server starts
  fetchChainData()
    .then(() => {
      console.log('Started fetching blockchain data');
    })
    .catch((error) => {
      console.error('Error starting data fetch:', error);
    });

// server run
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});