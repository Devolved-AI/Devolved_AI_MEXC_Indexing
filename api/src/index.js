require( 'module-alias/register' );
require( 'dotenv' ).config();

const express = require( 'express' );
const compression = require( 'compression' );
const rateLimit = require( 'express-rate-limit' );
const helmet = require( 'helmet' );
const cors = require( 'cors' );
const hpp = require( 'hpp' );
const bodyParser = require('body-parser');
const connectDB = require('@config/mongoDB');

// Routes
const healthCheckRoute = require( '@routes/healthCheck.route' );
const authRoute = require('@routes/auth.route');
const userRoute = require('@routes/user.route');
const blockRoute = require( '@routes/block.route' );
const transactionRoute = require( '@routes/transaction.route' );
const transactionMessageRoute = require( '@routes/transactionMessage.route' );
const contractRoutes = require( '@routes/contract.route' );

// Connect to MongoDB
connectDB();

const app = express();

// @ts-ignore
app.use( helmet() );
app.use( compression() );
app.use( express.json( { limit: '4mb' } ) );
app.use(bodyParser.json());
app.use( express.urlencoded( { extended: true, limit: '4mb' } ) );
app.use( cors() );
// @ts-ignore
app.use( hpp() );

// @ts-ignore
app.use( rateLimit( {
    windowMs: 15 * 60 * 1000,
    max: 100000,
    standardHeaders: true,
    legacyHeaders: false,
} ) );

app.use( '/healthCheck', healthCheckRoute );
// Auth routes
app.use('/auth', authRoute);
// Use routes
app.use('/user', userRoute);
app.use( '/block', blockRoute );
app.use( '/transaction', transactionRoute );
app.use( '/transactionMessage', transactionMessageRoute );
app.use( '/contract', contractRoutes );

const PORT = process.env.PORT || 4000;
app.listen( PORT, () => {
    console.log( `Server running on port ${PORT}` );
} );