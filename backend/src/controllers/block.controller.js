const initializeRedisClient = require( '../config/connectCache' );
let redisClient;

// Initialize the Redis client
const initRedis = async () => {
  if ( !redisClient || !redisClient.isOpen ) {
    try {
      redisClient = await initializeRedisClient();
      console.log( '✓ Redis is connected successfully' );
    } catch ( error ) {
      console.error( 'Error connecting to Redis:', error.message );
      throw new Error( 'Redis connection failed' );
    }
  }
};

// Function to get the last 10 blocks from Redis cache
const getLast10Blocks = async ( req, res ) => {
  try {
    // Ensure Redis client is initialized
    await initRedis();

    // Check if the 'blocks' sorted set exists
    const blocksExist = await redisClient.exists( 'blocks' );
    if ( !blocksExist ) {
      return res.status( 404 ).json( {
        message: 'No sorted set "blocks" found in Redis'
      } );
    }

    // Retrieve the last 10 block keys from Redis sorted set 'blocks'
    const blockKeys = await redisClient.zRange( 'blocks', 0, 9, { REV: true } );

    if ( !blockKeys || blockKeys.length === 0 ) {
      return res.status( 404 ).json( {
        message: 'No blocks found in Redis sorted set'
      } );
    }

    console.log( 'Retrieved block keys:', blockKeys );

    // Fetch details for each block key from the Redis hash
    const blocks = await Promise.all(
      blockKeys.map( async ( key ) => {
        const block = await redisClient.hGetAll( `block:${key}` );
        return block;
      } )
    );

    // Return the blocks as a JSON response
    return res.status( 200 ).json( {
      blocks,
      message: 'Successfully retrieved the latest 10 blocks'
    } );
  } catch ( error ) {
    console.error( 'Error retrieving blocks from Redis:', error.message );
    return res.status( 500 ).json( {
      message: 'Internal server error',
      error: error.message
    } );
  }
};
// Function to get details for a specific block by block number
const getBlockDetails = async ( req, res ) => {
  // Extract blocknumber from the request body
  const { blocknumber } = req.body;

  // If blocknumber is not provided, return a 400 error
  if ( !blocknumber ) {
    return res.status( 400 ).json( {
      message: 'Block number is required',
    } );
  }

  try {
    // Initialize Redis client
    await initRedis();

    // Check if the block exists in Redis
    const blockExists = await redisClient.exists( `block:${blocknumber}` );
    if ( !blockExists ) {
      return res.status( 404 ).json( {
        message: `Block with number "${blocknumber}" not found in Redis`,
      } );
    }

    // Fetch the block data from Redis
    const blockData = await redisClient.hGetAll( `block:${blocknumber}` );

    // If no block data is found, return a 404 error
    if ( !blockData || Object.keys( blockData ).length === 0 ) {
      return res.status( 404 ).json( {
        message: `No data found for block number "${blocknumber}" in Redis`,
      } );
    }

    // Send the block data as a JSON response
    return res.status( 200 ).json( {
      block: blockData,
      message: `Successfully retrieved block data for block number "${blocknumber}"`,
    } );
  } catch ( error ) {
    console.error( `Error retrieving block data for number "${blocknumber}":`, error.message );
    return res.status( 500 ).json( {
      message: 'Internal server error',
      error: error.message,
    } );
  }
};

// Ensure Redis is initialized before handling requests
// initRedis();

module.exports = {
  getLast10Blocks,
  getBlockDetails
};
