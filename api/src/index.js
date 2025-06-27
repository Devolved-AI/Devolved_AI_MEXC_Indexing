require( 'module-alias/register' );
require( 'dotenv' ).config();

const express = require( 'express' );
const compression = require( 'compression' );
const rateLimit = require( 'express-rate-limit' );
const helmet = require( 'helmet' );
const cors = require( 'cors' );
const hpp = require( 'hpp' );
const bodyParser = require( 'body-parser' );
const connectDB = require( '@config/mongoDB' );

// Import logging and middleware
const logger = require('@config/logger');
const requestLogger = require('@middleware/requestLogger');
const { errorHandler, notFound } = require('@middleware/errorHandler');
const { responseFormatter } = require('@middleware/responseFormatter');
const { performanceMonitor } = require('@middleware/performanceMonitor');

// Routes
const healthCheckRoute = require( '@routes/healthCheck.route' );
const authRoute = require( '@routes/auth.route' );
const userRoute = require( '@routes/user.route' );
const blockRoute = require( '@routes/block.route' );
const transactionRoute = require( '@routes/transaction.route' );
const transactionMessageRoute = require( '@routes/transactionMessage.route' );
const contractRoutes = require( '@routes/contract.route' );
const accountRoutes = require( '@routes/account.route' );

// Connect to MongoDB
connectDB();

const app = express();

// Log application startup
logger.info('🚀 Starting Argochain Scanner API...');
logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
logger.info(`🔗 Database: ${process.env.MONGODB_URI ? 'Connected' : 'Not configured'}`);
logger.info(`🌐 RPC URL: ${process.env.ARGOCHAIN_RPC_URL ? 'Configured' : 'Not configured'}`);

// Security middleware
logger.debug('🔒 Initializing security middleware...');
app.use( helmet() );
app.use( compression() );
app.use( cors() );
app.use( hpp() );

// Body parsing middleware
logger.debug('📝 Initializing body parsing middleware...');
app.use( express.json( { limit: '4mb' } ) );
app.use( bodyParser.json() );
app.use( express.urlencoded( { extended: true, limit: '4mb' } ) );

// Rate limiting
logger.debug('⏱️ Initializing rate limiting...');
app.use( rateLimit( {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100000, // limit each IP to 100000 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: {
            type: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests from this IP, please try again later.',
            timestamp: new Date().toISOString()
        }
    }
} ) );

// Custom middleware
logger.debug('🔍 Initializing custom middleware...');
app.use(requestLogger);
app.use(performanceMonitor);
app.use(responseFormatter);

// Health check route (before other routes)
logger.debug('🏥 Setting up health check route...');
app.use( '/healthCheck', healthCheckRoute );

// API routes
logger.debug('🛣️ Setting up API routes...');
app.use( '/auth', authRoute );
app.use( '/user', userRoute );
app.use( '/block', blockRoute );
app.use( '/transaction', transactionRoute );
app.use( '/transactionMessage', transactionMessageRoute );
app.use( '/contract', contractRoutes );
app.use( '/accounts', accountRoutes );

// 404 handler
app.use(notFound);

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

// Graceful shutdown handling
process.on('SIGTERM', () => {
    logger.info('🛑 SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('🛑 SIGINT received, shutting down gracefully...');
    process.exit(0);
});

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
    logger.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
    logger.error('💥 Uncaught Exception:', error);
    process.exit(1);
});

app.listen( PORT, () => {
    logger.info( `✅ Server running on port ${PORT}` );
    logger.info( `📡 API Documentation: http://localhost:${PORT}/healthCheck` );
    logger.info( `🔍 Debug mode: ${process.env.NODE_ENV === 'development' ? 'Enabled' : 'Disabled'}` );
} );