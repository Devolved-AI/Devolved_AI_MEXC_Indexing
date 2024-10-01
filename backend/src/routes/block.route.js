const express = require('express');
const { getLast10Blocks, getBlockDetails } = require('../controllers/block.controller');

const router = express.Router();

// Define the POST route for fetching the last 10 blocks
router.post('/getLast10Blocks', getLast10Blocks);

// Define the POST route for fetching block details by block number
// Changed from 'blockKey' to 'blocknumber' to match the route parameter name
router.post('/blockDetails', getBlockDetails);

module.exports = router;
