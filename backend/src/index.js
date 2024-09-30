require( 'module-alias/register' );
require( 'dotenv' ).config();

const express = require( 'express' );
const compression = require( 'compression' );
const rateLimit = require( 'express-rate-limit' );
const helmet = require( 'helmet' );
const cors = require( 'cors' );
const hpp = require( 'hpp' );
const { createLogger, transports, format } = require( 'winston' );

// Config
const createTables = require( './config/initializeDB' ); // Assuming aliases are correctly set

// Controllers
const { fetchChainData } = require( './controllers/fetchChainData' ); // Corrected import with destructuring
const cacheListener = require( './controllers/cacheListener' );

// Routes
const healthCheckRoute = require( './routes/healthCheck.route' ); // Assuming aliases are correctly set
const transactionMessagesRoute = require( './routes/transactionMessages.route' );
const blockRoute = require( './routes/block.route' );
const transactionRoute = require( './routes/transaction.route' );

const app = express();

// Logger setup
const logger = createLogger( {
    level: 'info',
    format: format.combine(
        format.timestamp(),
        format.json()
    ),
    transports: [
        new transports.File( { filename: 'error.log', level: 'error' } ),
        new transports.File( { filename: 'combined.log' } ),
    ],
} );

// @ts-ignore
app.use( helmet() );
app.use( compression() );
app.use( express.json( { limit: '4mb' } ) );
app.use( express.urlencoded( { extended: true, limit: '4mb' } ) );
app.use( cors() );
// @ts-ignore
app.use( hpp() );

// @ts-ignore
app.use( rateLimit( {
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
} ) );

app.use( '/healthCheck', healthCheckRoute );
app.use( '/block', blockRoute );
app.use( '/transaction', transactionRoute );
app.use( '/transactionMessages', transactionMessagesRoute );

app.use( ( err, req, res, next ) => {
    logger.error( err.message );
    res.status( 500 ).json( {
        status: 500,
        success: false,
        message: 'Something went wrong!'
    } );
} );

createTables().then( () => {
    console.log( 'Database initialized and tables created successfully' );
} ).catch( ( error ) => {
    logger.error( `Error initializing database: ${error.message}` );
    process.exit( 1 );
} );

fetchChainData().catch( ( error ) => {
    logger.error( `Error fetching blockchain data: ${error.message}` );
} );

cacheListener().catch( ( error ) => {
    logger.error( `Error starting cache listener: ${error.message}` );
} );

const PORT = process.env.PORT || 4000;
app.listen( PORT, () => {
    console.log( `Server running on port ${PORT}` );
} );
