// src/routes/transactionRoutes.js
const express = require('express');
const { getTransactionDetails } = require('../controllers/transactionController');

const router = express.Router();

router.get('/:trxHash', getTransactionDetails);

module.exports = router;
