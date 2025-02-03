const express = require('express');
const { getTopMaxBalanceAccounts } = require('../controllers/account.controller');

const router = express.Router();

// Route to get the top 100 accounts sorted by balance
router.post('/top-accounts', getTopMaxBalanceAccounts);

module.exports = router;
