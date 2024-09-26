const express = require('express');
const { getLast10Transactions, getTransactionDetails } = require('@controllers/transaction.controller');

const router = express.Router();

// Define the GET route for last 10 blocks
router.post('/getLast10Transactions', getLast10Transactions);
router.post('/getTransactionDetails', getTransactionDetails);

module.exports = router;
