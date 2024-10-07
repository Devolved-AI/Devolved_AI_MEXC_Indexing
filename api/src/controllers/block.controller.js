const { query } = require('@config/connectDB');

// Function to get the last 10 blocks from PostgreSQL
const getLast10Blocks = async (req, res) => {
  try {
    // SQL query to get the last 10 blocks, ordered by block number in descending order
    const result = await query(
      'SELECT block_number, block_hash, parent_hash, state_root, extrinsics_root, timestamp FROM blocks ORDER BY block_number DESC LIMIT 10'
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No blocks found',
      });
    }

    return res.status(200).json({
      success: true,
      blocks: result.rows,
    });
  } catch (error) {
    console.error('Error retrieving blocks from PostgreSQL:', error.message);
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// Function to get block details by blockNum from PostgreSQL
const blockDetails = async (req, res) => {
  const { blockNumber } = req.body;

  if (!blockNumber) {
    return res.status(400).json({
      success: false,
      message: 'blockNumber is required',
    });
  }

  try {
    // SQL query to get the block details by block number
    const result = await query(
      'SELECT block_number, block_hash, parent_hash, state_root, extrinsics_root, timestamp FROM blocks WHERE block_number = $1',
      [blockNumber]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No block found with blockNum: ${blockNumber}`,
      });
    }

    // Return the block details
    return res.status(200).json({
      success: true,
      block: result.rows[0],
    });
  } catch (error) {
    console.error('Error fetching block from PostgreSQL:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

module.exports = {
  getLast10Blocks,
  blockDetails
};
