const initializeRedisClient = require( '../config/connectCache' );
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

// Function to get the last 10 blocks from Redis cache
const getLast10Blocks = async ( req, res ) => {
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

    if (!blockKeys || blockKeys.length === 0) {
      return res.status(404).json({
        message: 'No blocks found in Redis sorted set'
      });
    }

    console.log('Retrieved block keys:', blockKeys);

    // Fetch details for each block key from the Redis hash
    const blocks = await Promise.all(
      blockKeys.map(async (key) => {
        const block = await redisClient.hGetAll(`block:${key}`);
        return block;
      })
    );

    // Return the blocks as a JSON response
    return res.status(200).json({
      blocks,
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

// Function to get specific block details from Redis cache or database
const getBlockDetails = async ( req, res, next ) => {
  const { blockNumber } = req.params;
  try {
    // Ensure Redis client is initialized
    await initRedis();

    const cacheKey = `block:${blockNumber}`;
    let blockData = await redisClient.get( cacheKey );

    if ( blockData ) {
      return res.json( { success: true, result: JSON.parse( blockData ) } );
    }

    // Fallback to database if block is not found in Redis cache 
    // @ts-ignore
    const result = await db.query( 'SELECT * FROM blocks WHERE block_number = $1', [ blockNumber ] );

    if ( result.rows.length === 0 ) {
      return res.status( 404 ).json( { success: false, message: 'Block not found' } );
    }

    // Cache the block data in Redis for future requests
    blockData = result.rows[ 0 ];
    await redisClient.set( cacheKey, JSON.stringify( blockData ) );

    return res.json( { success: true, result: blockData } );
  } catch ( error ) {
    next( error );
  }
};

// Ensure Redis is initialized before handling requests
// initRedis();

module.exports = {
  getLast10Blocks,
  getBlockDetails
};
