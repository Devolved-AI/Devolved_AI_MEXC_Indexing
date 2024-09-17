const express = require('express');
const { getLast10Blocks, getBlockDetails } = require('@controllers/block.controller');

const router = express.Router();

// Define the GET route for last 10 blocks
router.post('/getLast10Blocks', getLast10Blocks);
router.post('/blockDetails', getBlockDetails);

module.exports = router;
