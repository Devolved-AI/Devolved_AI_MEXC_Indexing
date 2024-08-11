// src/routes/blockRoutes.js
const express = require('express');
const { getBlockDetails } = require('../controllers/blockController');

const router = express.Router();

router.get('/:blockNumber', getBlockDetails);

module.exports = router;
