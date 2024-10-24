const express = require('express');
const { 
    getLast10Transactions, 
    getTransactionDetailsByHash, 
    getTransactionDetailsByAddress, 
    getBalance, 
    fetchTransactionData 
} = require('@controllers/transaction.controller');

const router = express.Router();

router.post('/getLast10Transactions', getLast10Transactions);
router.post('/getTransactionDetailsByHash', getTransactionDetailsByHash);
router.post('/getTransactionDetailsByAddress', getTransactionDetailsByAddress);
router.post('/getBalance', getBalance);
router.post('/fetchTransactionData', fetchTransactionData);

module.exports = router;