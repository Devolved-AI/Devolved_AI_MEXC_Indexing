const express = require('express');
const { storeTransactionMessage, getTransactionMessage } = require('@controllers/transactionMessage.controller');

const router = express.Router();

router.post('/storeTransactionMessage', storeTransactionMessage);
router.post('/getTransactionMessage', getTransactionMessage);

module.exports = router;