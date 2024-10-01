const { ApiPromise, WsProvider } = require( '@polkadot/api' );
require( 'dotenv' ).config();
const pool = require( '../config/connectDB' );
const initializeRedisClient = require( '../libs/redisClient' );

// Initialize WebSocket provider for the Substrate node
const wsProvider = new WsProvider( process.env.ARGOCHAIN_RPC_URL );

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

    let startBlockNumber = lastProcessedBlockNumber + 1;
    if ( startBlockNumber < 314620 ) {
      startBlockNumber = 314620;
      console.log( 'Starting from block 0.' );
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
    const serializedData = JSON.stringify( transactionData );
    await redisClient.hSet( redisKey, 'data', serializedData );
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
