const initializeRedisClient = require('@config/connectCache');
let redisClient;

// Initialize the Redis client
const initRedis = async () => {
  if (!redisClient || !redisClient.isOpen) {
    try {
      redisClient = await initializeRedisClient();
      console.log('✓ Redis is connected successfully');
    } catch (error) {
      console.error('Error connecting to Redis:', error.message);
      throw new Error('Redis connection failed');
    }
  }
};

// Function to get all entries from the Redis sorted set with scores
const getSortedSetEntries = async (req, res) => {
  try {
    // Ensure Redis client is initialized
    await initRedis();

    // Check if the 'blocks' sorted set exists
    const blocksExist = await redisClient.exists('blocks');
    if (!blocksExist) {
      return res.status(404).json({
        message: 'No sorted set "blocks" found in Redis'
      });
    }

    // Retrieve all block keys and scores from Redis sorted set 'blocks'
    const blockEntries = await redisClient.zRangeWithScores('blocks', 0, -1); // Get all entries

    if (!blockEntries || blockEntries.length === 0) {
      return res.status(404).json({
        message: 'No entries found in Redis sorted set'
      });
    }

    console.log('Block entries from Redis sorted set:', blockEntries);

    // Return the block entries as a JSON response
    return res.status(200).json({
      blockEntries,
      message: 'Successfully retrieved all entries from the Redis sorted set "blocks"'
    });
  } catch (error) {
    console.error('Error retrieving sorted set entries from Redis:', error.message);
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Function to get the last 10 blocks from Redis cache
const getLast10Blocks = async (req, res) => {
  try {
    // Ensure Redis client is initialized
    await initRedis();

    // Check if the 'blocks' sorted set exists
    const blocksExist = await redisClient.exists('blocks');
    if (!blocksExist) {
      return res.status(404).json({
        message: 'No sorted set "blocks" found in Redis'
      });
    }

    // Retrieve the last 10 block keys from Redis sorted set 'blocks'
    const blockKeys = await redisClient.zRange('blocks', 0, 9, { REV: true });

    // Log block keys for debugging
    console.log('Block keys retrieved from Redis:', blockKeys);

    if (!blockKeys || blockKeys.length === 0) {
      return res.status(404).json({
        message: 'No blocks found in Redis sorted set'
      });
    }

    // Fetch details for each block key from the Redis hash
    const blocks = await Promise.all(
      blockKeys.map(async (blockNumber) => {
        const block = await redisClient.hGetAll(`blocks:${blockNumber}`);
        console.log(`Block data for block number ${blockNumber}:`, block); // Log block data for debugging
        return block;
      })
    );

    // Filter out empty blocks in case some were missing
    const validBlocks = blocks.filter(block => Object.keys(block).length > 0);

    if (validBlocks.length === 0) {
      return res.status(404).json({
        message: 'No valid blocks found in Redis'
      });
    }

    // Return the blocks as a JSON response
    return res.status(200).json({
      blocks: validBlocks,
      message: 'Successfully retrieved the latest 10 blocks'
    });
  } catch (error) {
    console.error('Error retrieving blocks from Redis:', error.message);
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Function to get details for a specific block by block number
const getBlockDetails = async (req, res) => {
  const { blocknumber } = req.body;

  if (!blocknumber) {
    return res.status(400).json({
      message: 'Block number is required',
    });
  }

  try {
    // Initialize Redis client
    await initRedis();

    // Check if the block exists in Redis
    const blockExists = await redisClient.exists(`blocks:${blocknumber}`);
    if (!blockExists) {
      return res.status(404).json({
        message: `Block with number "${blocknumber}" not found in Redis`,
      });
    }

    // Fetch the block data from Redis
    const blockData = await redisClient.hGetAll(`blocks:${blocknumber}`);

    // Check if the block data has all the required fields
    if (!blockData || Object.keys(blockData).length === 0 || !blockData.parent_hash || !blockData.state_root) {
      return res.status(404).json({
        message: `Incomplete data found for block number "${blocknumber}" in Redis`,
      });
    }

    // Send the full block data as a JSON response
    return res.status(200).json({
      block: blockData,
      message: `Successfully retrieved block data for block number "${blocknumber}"`,
    });
  } catch (error) {
    console.error(`Error retrieving block data for number "${blocknumber}":`, error.message);
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
};

module.exports = {
  getLast10Blocks,
  getBlockDetails,
  getSortedSetEntries
};
