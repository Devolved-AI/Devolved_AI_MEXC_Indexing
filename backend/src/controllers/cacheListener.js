const pool = require( '../config/connectDB' ); // Importing pg client
const initializeRedisClient = require( '../libs/redisClient' ); // Importing Redis client
require( 'dotenv' ).config();

let redisClient; // Global Redis client

// Function to initialize both PostgreSQL and Redis clients and set up listeners
const initialize = async () => {
  try {
    // Initialize Redis client
    redisClient = await initializeRedisClient();
    console.log( '4. Connected to Redis' );

    // Initialize Redis with all existing data from PostgreSQL
    await initializeRedisWithAllData();

    // Connect to PostgreSQL and listen for notifications
    const client = await pool.connect();
    console.log( '3. Connected to PostgreSQL' );

    // Listen for PostgreSQL notifications
    client.on( 'notification', async ( msg ) => {
      const payload = JSON.parse( msg.payload );
      const operation = payload.operation;
      const record = payload.record;

      switch ( msg.channel ) {
        case 'block_change':
          await cacheBlock( operation, record );
          break;
        case 'event_change':
          await cacheEvent( operation, record );
          break;
        case 'transaction_change':
          await cacheTransaction( operation, record );
          break;
        case 'account_change':
          await cacheAccount( operation, record );
          break;
        case 'transaction_message_change':
          await cacheTransactionMessage( operation, record );
          break;
        default:
          console.error( `Unknown notification channel: ${msg.channel}` );
      }
    } );

    // Subscribe to PostgreSQL notification channels
    await client.query( 'LISTEN block_change' );
    await client.query( 'LISTEN event_change' );
    await client.query( 'LISTEN transaction_change' );
    await client.query( 'LISTEN account_change' );
    await client.query( 'LISTEN transaction_message_change' );

    // Handle PostgreSQL errors
    client.on( 'error', ( err ) => {
      console.error( 'PostgreSQL client error', err );
      reconnectPostgres( client );
    } );
  } catch ( err ) {
    console.error( 'Error in initialize function:', err );
    setTimeout( initialize, 5000 ); // Retry after 5 seconds on failure
  }
};

// Function to reconnect to PostgreSQL in case of connection loss
const reconnectPostgres = ( client ) => {
  console.log( 'Reconnecting to PostgreSQL...' );
  client.connect( ( err ) => {
    if ( err ) {
      console.error( 'PostgreSQL client reconnection error', err );
      setTimeout( () => reconnectPostgres( client ), 5000 ); // Retry after 5 seconds
    } else {
      console.log( '3.1 Reconnected to PostgreSQL' );
    }
  } );
};

// Initialize Redis with all data from PostgreSQL
const initializeRedisWithAllData = async () => {
  try {
    console.log( '5. Initializing Redis with all data from PostgreSQL...' );
    await initializeRedisBlocks();
    await initializeRedisEvents();
    await initializeRedisTransactions();
    await initializeRedisAccounts();
    await initializeRedisTransactionMessages();
    console.log( '8. Redis initialization complete.' );
  } catch ( err ) {
    console.error( 'Error initializing Redis with all data:', err );
  }
};

// Individual table initialization functions for Redis
const initializeRedisBlocks = async () => {
  await initializeRedisTable( 'blocks', cacheBlock );
};

const initializeRedisEvents = async () => {
  await initializeRedisTable( 'events', cacheEvent );
};

const initializeRedisTransactions = async () => {
  await initializeRedisTable( 'transactions', cacheTransaction );
};

const initializeRedisAccounts = async () => {
  await initializeRedisTable( 'accounts', cacheAccount );
};

const initializeRedisTransactionMessages = async () => {
  await initializeRedisTable( 'transactionmessages', cacheTransactionMessage );
};

// Function to initialize Redis from a specific PostgreSQL table
const initializeRedisTable = async ( tableName, cacheFunction ) => {
  const query = `SELECT * FROM ${tableName}`;
  try {
    const res = await pool.query( query );
    for ( const row of res.rows ) {
      await cacheFunction( 'INSERT', row );
    }
  } catch ( err ) {
    console.error( `Error initializing Redis with ${tableName}:`, err );
  }
};

// Function to initialize Redis client
const initRedis = async () => {
  if ( !redisClient || !redisClient.isOpen ) {
    redisClient = await initializeRedisClient();
    console.log( '✓ Redis is connected successfully' );
  }
};

// Caching functions for different operations
const cacheBlock = async ( operation, block ) => {
  try {
    // Ensure Redis client is initialized
    await initRedis();

    // Safely extract the block number (check if block contains block_number or blockNumber)
    const blockNumber = block.block_number || block.blockNumber;

    if ( !blockNumber ) {
      throw new Error( 'blockNumber is undefined or null.' );
    }

    if ( operation === 'DELETE' ) {
      // Remove block from sorted set and hash
      await redisClient.zRem( 'blocks', blockNumber );
      await redisClient.del( `block:${blockNumber}` );
      console.log( `Deleted block ${blockNumber} from Redis.` );
    } else {
      // Add block to the sorted set 'blocks' and cache block details
      await redisClient.zAdd( 'blocks', [ { score: parseInt( blockNumber ), value: blockNumber } ] );
      await redisClient.hSet( `block:${blockNumber}`, mapObjectToHash( block ) );
      console.log( `Block ${blockNumber} added to sorted set and cached successfully.` );
    }
  } catch ( error ) {
    // @ts-ignore
    console.error( `Error caching block ${blockNumber}:`, error.message );
  }
};

// Populate sorted set for blocks that already exist in Redis
const populateSortedSet = async () => {
  try {
    // Ensure Redis client is initialized
    await initRedis();

    // Get all block keys in Redis
    const blockKeys = await redisClient.keys( 'block:*' );

    if ( !blockKeys || blockKeys.length === 0 ) {
      console.log( 'No blocks found in Redis.' );
      return;
    }

    // Add each block to the sorted set 'blocks'
    await Promise.all(
      blockKeys.map( async ( blockKey ) => {
        const blockNumber = blockKey.split( ':' )[ 1 ];
        await redisClient.zAdd( 'blocks', [ { score: parseInt( blockNumber ), value: blockNumber } ] );
      } )
    );

    console.log( 'Sorted set "blocks" populated with existing block data.' );
  } catch ( error ) {
    console.error( 'Error populating sorted set with blocks:', error.message );
  }
};

// Run the function to populate the sorted set
populateSortedSet();

// Caching functions for events, transactions, accounts, etc.
const cacheEvent = async ( operation, event ) => {
  await cacheEntity( operation, `event:${event.id}`, event );
};

const cacheTransaction = async ( operation, transaction ) => {
  await cacheEntity( operation, `transaction:${transaction.tx_hash}`, transaction );
};

const cacheAccount = async ( operation, account ) => {
  await cacheEntity( operation, `account:${account.address}`, account );
};

const cacheTransactionMessage = async ( operation, transactionMessage ) => {
  await cacheEntity( operation, `transactionMessage:${transactionMessage.id}`, transactionMessage );
};

// General cache entity function
const cacheEntity = async ( operation, key, entity ) => {
  try {
    if ( operation === 'DELETE' ) {
      await redisClient.del( key );
      console.log( `Deleted ${key} from Redis.` );
    } else {
      await redisClient.hSet( key, mapObjectToHash( entity ) );
      console.log( `Cached ${key} in Redis.` );
    }
  } catch ( err ) {
    console.error( `Error caching ${key}:`, err );
  }
};

// Helper function to convert object into a Redis hash
const mapObjectToHash = ( obj ) => {
  return Object.entries( obj ).reduce( ( acc, [ key, value ] ) => {
    acc[ key ] = value !== null && value !== undefined ? value.toString() : '';
    return acc;
  }, {} );
};

// Start the cache listener
const cacheListener = async () => {
  await initialize();
};

module.exports = cacheListener;
