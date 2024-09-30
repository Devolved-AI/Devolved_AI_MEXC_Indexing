// middlewares/checkLastBlock.js
const pool = require('../config/connectDB');

// Middleware to check the last block saved in PostgreSQL
const checkLastBlock = async (req, res, next) => {
  try {
    // Query to get the maximum block number from the 'blocks' table
    const result = await pool.query('SELECT COALESCE(MAX(block_number), -1) as last_block_number FROM blocks');

    // Extract the last processed block number
    const lastProcessedBlockNumber = result.rows[0].last_block_number;

    // Set the startBlockNumber on the request object
    req.startBlockNumber = lastProcessedBlockNumber + 1;

    console.log(`Starting from block number: ${req.startBlockNumber}`);

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error('Error checking last block:', error.message);
    return res.status(500).json({
      message: 'Error checking the last saved block',
      error: error.message,
    });
  }
};

module.exports = checkLastBlock;
