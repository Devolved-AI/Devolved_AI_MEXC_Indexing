const express = require('express');
const { getTransactionDetails } = require('../controllers/addressController');
const router = express.Router();

router.post('/address', getTransactionDetails);

module.exports = router;
