const express = require('express');
const { getLast10Blocks, blockDetails } = require('@controllers/block.controller');

const router = express.Router();

// Define the POST route for fetching the last 10 blocks
router.post('/getLast10Blocks', getLast10Blocks);
router.post('/blockDetails', blockDetails);

module.exports = router;