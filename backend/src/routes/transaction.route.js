const express = require( 'express' );
const { getLast10Transactions, getTransactionDetailsByAddress, getTransactionByHash } = require( '../controllers/transaction.controller' );

const router = express.Router();

// Define the GET route for last 10 blocks
router.post( '/getLast10Transactions', getLast10Transactions );
router.post( '/getTransactionDetailsByAddress', getTransactionDetailsByAddress );
router.post( '/getTransactionDetailsByHash', getTransactionByHash );

module.exports = router;
