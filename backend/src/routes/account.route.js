const express = require('express');
const { getAddressBalance } = require( '../controllers/account.controller' );

const router = express.Router();

// Get balance by account address
router.post('/getaccountbalance', getAddressBalance);

module.exports = router;
