const { ApiPromise, WsProvider } = require( '@polkadot/api' );
require( 'dotenv' ).config();
const pool = require( '../config/connectDB' );
const initializeRedisClient = require( '../libs/redisClient' );

// Initialize WebSocket provider for the Substrate node
const wsProvider = new WsProvider( process.env.ARGOCHAIN_RPC_URL );

const RETRY_LIMIT = 5; // Number of retries for block processing
const RETRY_DELAY = 5000; // Delay between retries (in milliseconds)
const BATCH_SIZE = parseInt( process.env.FETCHING_BATCH_SIZE || '10', 10 );; // Number of blocks to process in a batch


let redisClient;

// Function to initialize Redis client
const initRedis = async () => {
  if ( !redisClient || !redisClient.isOpen ) {
    redisClient = await initializeRedisClient();
    console.log( '✓ Redis is connected successfully' );
  }
};

async function main() {
  try {
    await initRedis();
    const api = await ApiPromise.create( { provider: wsProvider } );
    const latestHeader = await api.rpc.chain.getHeader();
    const latestBlockNumber = latestHeader.number.toNumber();
    console.log( `Latest block number: ${latestBlockNumber}` );

    const result = await pool.query( 'SELECT COALESCE(MAX(block_number), 0) as last_block_number FROM blocks' );
    const lastProcessedBlockNumber = result.rows[ 0 ].last_block_number;

    let startBlockNumber = lastProcessedBlockNumber - 1;
    if ( startBlockNumber < 0 ) {
      startBlockNumber = 0;
      console.log( 'Starting from block 0.' );
    }

    // Process blocks in batches
    for ( let blockNumber = startBlockNumber; blockNumber <= latestBlockNumber; blockNumber += BATCH_SIZE ) {
      const endBlockNumber = Math.min( blockNumber + BATCH_SIZE - 1, latestBlockNumber );
      console.log( `Processing block batch from ${blockNumber} to ${endBlockNumber}` );
      await processBlockBatch( api, blockNumber, endBlockNumber );
    }

    console.log( `Processing from block ${startBlockNumber} to ${latestBlockNumber}` );
    for ( let blockNumber = startBlockNumber; blockNumber <= latestBlockNumber; blockNumber++ ) {
      await processBlock( api, blockNumber );
    }

    console.log( 'All blocks processed.' );
  } catch ( error ) {
    console.error( 'Error in main function:', error );
  }
}

// Process a batch of blocks
const processBlockBatch = async ( api, startBlockNumber, endBlockNumber ) => {
  const blockNumbers = [];
  for ( let blockNumber = startBlockNumber; blockNumber <= endBlockNumber; blockNumber++ ) {
    blockNumbers.push( blockNumber );
  }

  console.log( `Processing blocks: ${blockNumbers.join( ', ' )}` );
  const blockPromises = blockNumbers.map( blockNumber => processBlockWithRetries( api, blockNumber ) );
  // const blockPromises = blockNumbers.map(blockNumber => processBlockWithTimeout(api, blockNumber));
  await Promise.all( blockPromises );
};

// Retry processing a block up to the RETRY_LIMIT
const processBlockWithRetries = async ( api, blockNumber ) => {
  let retries = 0;
  while ( retries < RETRY_LIMIT ) {
    try {
      console.log( `Processing block ${blockNumber}` );
      await processBlock( api, blockNumber );
      console.log( `Successfully processed block ${blockNumber}` );
      break;
    } catch ( error ) {
      retries++;
      console.error( `Error processing block ${blockNumber}:`, error );
      if ( retries < RETRY_LIMIT ) {
        console.log( `Retrying block ${blockNumber} (${retries}/${RETRY_LIMIT})...` );
        await new Promise( resolve => setTimeout( resolve, RETRY_DELAY ) );
      } else {
        console.error( `Failed to process block ${blockNumber} after ${RETRY_LIMIT} retries.` );
      }
    }
  }
};

function getBlockTimestamp( extrinsics ) {
  for ( const extrinsic of extrinsics ) {
    const { method: { method, section }, args } = extrinsic;
    if ( section === 'timestamp' && method === 'set' ) {
      return new Date( parseInt( args[ 0 ].toString(), 10 ) );
    }
  }
  return new Date(); // Default to current time if no timestamp is found
}
async function processBlock( api, blockNumber ) {
  try {
    const hash = await api.rpc.chain.getBlockHash( blockNumber );
    const block = await api.rpc.chain.getBlock( hash );

    const blockData = {
      blockNumber: block.block.header.number.toNumber(),
      blockHash: block.block.header.hash.toString(),
      parentHash: block.block.header.parentHash.toString(),
      stateRoot: block.block.header.stateRoot.toString(),
      extrinsicsRoot: block.block.header.extrinsicsRoot.toString(),
      timestamp: getBlockTimestamp( block.block.extrinsics )
    };

    await insertBlockData( blockData );
    await updateRedisWithBlockData( blockData );

    const allEvents = await api.query.system.events.at( hash );
    // Process message transfers for 'TransferOfBalanceNew'
    const messageTransfers = allEvents
      .filter( ( { event } ) => event.section === 'palletCounter' && event.method === 'TransferOfBalanceNew' )
      .map( ( { event, phase } ) => {
        const [ fromAddress, toAddress, amount, messageHex ] = event.data;
        const messageHumanReadable = Buffer.from( messageHex.toHex().replace( /^0x/, '' ), 'hex' ).toString( 'utf-8' );
        return {
          txHash: event.hash.toHex(),
          blockNumber: blockData.blockNumber,
          from: fromAddress.toString(),
          to: toAddress.toString(),
          amount: amount.toString(),
          method: `${event.section}.${event.method}`,
          message: messageHumanReadable,
          timestamp: blockData.timestamp
        };
      } );

    for ( const transfer of messageTransfers ) {
      console.log( `Inserting palletCounter transaction with message: ${JSON.stringify( transfer )}` );
      await insertTransactionWithMessage( transfer );
      await updateRedisWithTransaction( transfer );
    }

    // Process each extrinsic
    for ( const [ index, extrinsic ] of block.block.extrinsics.entries() ) {
      const { isSigned, method, args } = extrinsic;
      if ( isSigned && method.section === 'balances' && method.method === 'transfer' ) {
        const transactionData = {
          txHash: extrinsic.hash.toHex(),
          blockNumber: blockData.blockNumber,
          fromAddress: extrinsic.signer?.toString(),
          toAddress: args[ 0 ]?.toString(),
          amount: args[ 1 ]?.toString(),
          method: `${method.section}.${method.method}`,
          timestamp: blockData.timestamp
        };
        console.log( `Processing transfer transaction: ${JSON.stringify( transactionData )}` );
        await insertTransaction( transactionData );
        await updateRedisWithTransaction( transactionData );
      }
    }

    // Insert all events into the database and Redis
    for ( const record of allEvents ) {
      const { event, phase } = record;
      if ( phase.isApplyExtrinsic ) {
        const eventData = {
          blockNumber: blockData.blockNumber,
          eventIndex: phase.asApplyExtrinsic.toNumber(),
          section: event.section,
          method: event.method,
          data: event.data.toString(),
          timestamp: blockData.timestamp
        };
        await insertEvent( eventData );
        await updateRedisWithEvent( eventData );
      }
    }

    console.log( `Processed block ${blockNumber}` );
  } catch ( error ) {
    console.error( `Failed to process block ${blockNumber}:`, error );
  }
}

async function updateRedisWithBlockData( blockData ) {
  const redisKey = `block:${blockData.blockNumber}`;
  if ( blockData && redisClient ) {
    // Ensure all values are strings or numbers; Redis doesn't accept objects directly
    try {
      await redisClient.hSet( redisKey, {
        blockNumber: String( blockData.blockNumber ),
        blockHash: blockData.blockHash,
        parentHash: blockData.parentHash,
        stateRoot: blockData.stateRoot,
        extrinsicsRoot: blockData.extrinsicsRoot,
        timestamp: blockData.timestamp ? blockData.timestamp.toISOString() : new Date().toISOString()
      } );
      console.log( `Block ${blockData.blockNumber} data updated in Redis.` );
    } catch ( error ) {
      console.error( `Failed to update Redis with block data for block ${blockData.blockNumber}:`, error );
    }
  }
}


async function updateRedisWithTransaction( transactionData ) {
  try {
    const redisKey = `transaction:${transactionData.txHash}`;
    // Using hSet with an object to set multiple fields at once
    await redisClient.hSet( redisKey, {
      'blockNumber': transactionData.blockNumber,
      'from_address': transactionData.fromAddress, // Ensure property names match your data structure
      'to_address': transactionData.toAddress,
      'amount': transactionData.amount,
      'method': transactionData.method,
      'message': transactionData.message, // Only add this line if your transaction data includes a message
      'timestamp': transactionData.timestamp
    } );

    console.log( `Transaction ${transactionData.txHash} data updated in Redis.` );
  } catch ( error ) {
    console.error( 'Failed to update Redis with transaction data:', error );
  }
}


// Assuming updateRedisWithEvent is where the error occurs
async function updateRedisWithEvent( eventData ) {
  try {
    const redisKey = `event:${eventData.blockNumber}:${eventData.eventIndex}`;
    // Assuming 'data' as the field where event data will be stored in the hash.
    const serializedData = JSON.stringify( eventData );
    await redisClient.hSet( redisKey, 'data', serializedData );
    console.log( `Event data for block ${eventData.blockNumber} updated in Redis.` );
  } catch ( error ) {
    console.error( 'Failed to update Redis with event data:', error );
  }
}

async function insertBlockData( blockData ) {
  const query = `
    INSERT INTO blocks (block_number, block_hash, parent_hash, state_root, extrinsics_root, timestamp)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (block_number) DO NOTHING;
  `;
  await pool.query( query, [
    blockData.blockNumber,
    blockData.blockHash,
    blockData.parentHash,
    blockData.stateRoot,
    blockData.extrinsicsRoot,
    blockData.timestamp
  ] );
}

async function insertTransaction( transactionData ) {
  const query = `
    INSERT INTO transactions (tx_hash, block_number, from_address, to_address, amount, method, timestamp)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (tx_hash) DO NOTHING;
  `;
  await pool.query( query, [
    transactionData.txHash,
    transactionData.blockNumber,
    transactionData.fromAddress,
    transactionData.toAddress,
    transactionData.amount,
    transactionData.method,
    transactionData.timestamp
  ] );
}

async function insertTransactionWithMessage( transactionData ) {
  const query = `
    INSERT INTO transactionmessages (
      tx_hash, 
      block_number, 
      from_address, 
      to_address, 
      amount, 
      method, 
      message, 
      timestamp
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (tx_hash) DO NOTHING;
  `;

  try {
    const res = await pool.query( query, [
      transactionData.txHash,
      transactionData.blockNumber,
      transactionData.from,
      transactionData.to,
      transactionData.amount,
      transactionData.method,
      transactionData.message,
      transactionData.timestamp
    ] );
    console.log( `Inserted transaction with message for tx_hash: ${transactionData.txHash}, Rows affected: ${res.rowCount}` );
  } catch ( error ) {
    console.error( `Error inserting transaction with message for tx_hash ${transactionData.txHash}:`, error.message, 'Query:', query );
  }
}

async function insertEvent( eventData ) {
  const query = `
    INSERT INTO events (block_number, event_index, section, method, data, timestamp)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT DO NOTHING;
  `;
  await pool.query( query, [
    eventData.blockNumber,
    eventData.eventIndex,
    eventData.section,
    eventData.method,
    eventData.data,
    eventData.timestamp
  ] );
}

main();

module.exports = {
  fetchChainData: main,
};
