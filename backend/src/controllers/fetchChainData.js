const { ApiPromise, WsProvider } = require( '@polkadot/api' );
require( 'dotenv' ).config();
const pool = require( '../config/connectDB' );
const initializeRedisClient = require( '../libs/redisClient' );

// Initialize WebSocket provider for the Substrate node
const wsProvider = new WsProvider( process.env.ARGOCHAIN_RPC_URL );
const delay = ( ms ) => new Promise( resolve => setTimeout( resolve, ms ) );

const RETRY_LIMIT = 5;
const RETRY_DELAY = 5000;
const BATCH_SIZE = parseInt( process.env.FETCHING_BATCH_SIZE || '10', 10 );

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
    await initRedis(); // Ensure Redis is connected
    console.log( 'Starting main process...' );
    const api = await ApiPromise.create( { provider: wsProvider } );
    const latestHeader = await api.rpc.chain.getHeader();
    const latestBlockNumber = latestHeader.number.toNumber();
    console.log( `Latest block number: ${latestBlockNumber}` );

    // Fetch the last processed block from the database
    const result = await pool.query( 'SELECT COALESCE(MAX(block_number), -1) as last_block_number FROM blocks' );
    const lastProcessedBlockNumber = result.rows[ 0 ].last_block_number;

    // Validate the lastProcessedBlockNumber before using it
    if ( lastProcessedBlockNumber === undefined || lastProcessedBlockNumber === null ) {
      console.error( 'Invalid last processed block number:', lastProcessedBlockNumber );
      throw new Error( 'Last processed block number is invalid.' );
    }

    // Start from the next block after the last processed block
    let startBlockNumber = lastProcessedBlockNumber + 1;

    // If lastProcessedBlockNumber is invalid or too old, start from block 0
    if ( lastProcessedBlockNumber < 18000 || !Number.isFinite( lastProcessedBlockNumber ) ) {
      console.warn( 'Starting from block 0 due to invalid or undefined lastProcessedBlockNumber' );
      startBlockNumber = 18000;
    }

    console.log( `Starting from block number: ${startBlockNumber}` );
    for ( let blockNumber = startBlockNumber; blockNumber <= latestBlockNumber; blockNumber += BATCH_SIZE ) {
      const endBlockNumber = Math.min( blockNumber + BATCH_SIZE - 1, latestBlockNumber );
      console.log( `Processing block batch from ${blockNumber} to ${endBlockNumber}` );
      await processBlockBatch( api, blockNumber, endBlockNumber );
    }

    console.log( 'Main process completed.' );
  } catch ( error ) {
    console.error( 'Error in main process:', error );
  }
}

async function processBlockBatch( api, startBlockNumber, endBlockNumber ) {
  const blockNumbers = [];
  for ( let blockNumber = startBlockNumber; blockNumber <= endBlockNumber; blockNumber++ ) {
    blockNumbers.push( blockNumber );
  }

  console.log( `Processing blocks: ${blockNumbers.join( ', ' )}` );
  const blockPromises = blockNumbers.map( blockNumber => processBlockWithRetries( api, blockNumber ) );
  await Promise.all( blockPromises );
}

async function processBlockWithRetries( api, blockNumber, retries = 0 ) {
  const MAX_RETRIES = 5;
  const BACKOFF_DELAY = Math.pow( 2, retries ) * 1000; // Exponential backoff

  try {
    console.log( `Processing block ${blockNumber}` );
    await processBlock( api, blockNumber );
    console.log( `Successfully processed block ${blockNumber}` );
  } catch ( error ) {
    console.error( `Error processing block ${blockNumber}:`, error );
    if ( retries < MAX_RETRIES ) {
      console.log( `Retrying block ${blockNumber} in ${BACKOFF_DELAY}ms...` );
      await delay( BACKOFF_DELAY ); // Wait before retrying
      await processBlockWithRetries( api, blockNumber, retries + 1 );
    } else {
      console.error( `Failed to process block ${blockNumber} after ${MAX_RETRIES} retries.` );
    }
  }
}

async function processBlock( api, blockNumber ) {
  const hash = await api.rpc.chain.getBlockHash( blockNumber );
  const signedBlock = await api.rpc.chain.getBlock( hash );
  const blockNum = signedBlock.block.header.number.toNumber();
  const blockHash = signedBlock.block.header.hash.toHex();
  const parentHash = signedBlock.block.header.parentHash.toHex();
  const stateRoot = signedBlock.block.header.stateRoot.toHex();
  const extrinsicsRoot = signedBlock.block.header.extrinsicsRoot.toHex();
  let timestamp = new Date();

  for ( const extrinsic of signedBlock.block.extrinsics ) {
    const { method: { method, section }, args } = extrinsic;
    if ( section === 'timestamp' && method === 'set' ) {
      timestamp = new Date( parseInt( args[ 0 ]?.toString() || Date.now(), 10 ) );
      break;
    }
  }

  if ( !timestamp ) {
    console.error( `No timestamp found for block ${blockNumber}` );
    return;
  }

  // Insert the block data before proceeding
  try {
    await insertBlockData( blockNum, blockHash, parentHash, stateRoot, extrinsicsRoot, timestamp );
  } catch ( error ) {
    console.error( `Error inserting block data for block ${blockNum}:`, error );
    return; // If inserting block data fails, don't proceed
  }

  const extrinsics = [];
  const allEvents = await api.query.system.events.at( signedBlock.block.header.hash );

  // Map extrinsics to transaction hash (txHash)
  const txHashes = {};

  for ( const [ extrinsicIndex, extrinsic ] of signedBlock.block.extrinsics.entries() ) {
    const { isSigned, method: { method, section }, args, signer } = extrinsic;
    const txHash = extrinsic.hash.toHex(); // Define txHash here

    if ( isSigned ) {
      const [ to = 'unknown', amount = '0' ] = args;

      if ( section === 'palletCounter' && method === 'TransferOfBalanceNew' ) {
        const [ from, toAddress, transferAmount, messageHex ] = args;
        const message = Buffer.from( messageHex.replace( /^0x/, '' ), 'hex' ).toString( 'utf-8' );
        console.log( `Message in human-readable format: ${message}` );

        // Insert message into transactionmessages table
        await insertTransactionMessage( txHash, message );
        await insertTransaction( txHash, blockNum, from.toString(), toAddress.toString(), transferAmount.toString() );
      }

      extrinsics.push( {
        extrinsic_index: extrinsicIndex,
        tx_hash: txHash,
        block_number: blockNum,
        from_address: signer?.toString() || 'unknown',
        to_address: to?.toString() || 'unknown',
        amount: amount?.toString() || '0',
        fee: '0',
        gas_fee: '0',
        method: `${section}.${method}`,
        timestamp: timestamp.toISOString(),
      } );

      // Save txHash for event processing
      txHashes[ extrinsicIndex ] = txHash;

      await updateAccountBalance( api, to?.toString() || 'unknown' );
      await updateAccountBalance( api, signer?.toString() || 'unknown' );
    }
  }

  // Process and insert events
  try {
    for ( const { event, phase } of allEvents ) {
      const { section, method, data } = event;
      const txIndex = phase.isApplyExtrinsic ? phase.asApplyExtrinsic.toNumber() : null;
      const txHash = txIndex !== null ? txHashes[ txIndex ] : null;

      if ( section === 'palletCounter' && method === 'TransferOfBalanceNew' ) {
        const [ fromAddress, toAddress, transferAmount, messageHex ] = data;
        const message = Buffer.from( messageHex.toHex().replace( /^0x/, '' ), 'hex' ).toString( 'utf-8' );
        console.log( `Message in human-readable format: ${message}` );

        // Insert message into transactionmessages table
        if ( txHash ) {
          await insertTransactionMessage( txHash, message );
          await insertTransaction( txHash, blockNum, fromAddress.toString(), toAddress.toString(), transferAmount.toString() );
        }
      }

      // Insert the entire event data
      await insertEvent( blockNum, section, method, data.map( d => d.toString() ) );
    }
  } catch ( error ) {
    console.error( `Error inserting events for block ${blockNum}:`, error );
  }

  await insertExtrinsicData( extrinsics ); // Save extrinsics data to the database
  await insertTransactionsData( extrinsics ); // Assuming you handle transactions similarly
  await insertEventsData( allEvents, blockNum ); // Save all events

  // Cache block in Redis
  await cacheBlockInRedis( blockNum, {
    blockNumber: blockNum,
    blockHash,
    parentHash,
    stateRoot,
    extrinsicsRoot,
    timestamp,
    extrinsics,
    events: allEvents.map( event => ( {
      section: event.event.section,
      method: event.event.method,
      data: event.event.data.map( d => d.toString() ),
    } ) ),
  } );
}



// Save events to PostgreSQL
async function insertEvent( blockNumber, section, method, data ) {
  const query = `
    INSERT INTO events (block_number, section, method, data)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT DO NOTHING;
  `;
  await pool.query( query, [ blockNumber, section, method, JSON.stringify( data ) ] );
}
// Ensure the `insertTransaction` function allows null values for `to_address`
async function insertTransaction( txHash, blockNumber, fromAddress, toAddress, amount ) {
  const query = `
    INSERT INTO transactions (tx_hash, block_number, from_address, to_address, amount, fee, gas_fee, method, events)
    VALUES ($1, $2, $3, $4, $5, '0', '0', 'palletCounter.TransferOfBalanceNew', '[]')
    ON CONFLICT (tx_hash) DO NOTHING;
  `;

  // Ensure to_address is not null
  const safeToAddress = toAddress || 'unknown';

  await pool.query( query, [ txHash, blockNumber, fromAddress, safeToAddress, amount ] );
}

// Function to insert transaction message into the transactionmessages table
async function insertTransactionMessage( tx_hash, message ) {
  const query = `
    INSERT INTO transactionmessages (tx_hash, message)
    VALUES ($1, $2)
    ON CONFLICT (tx_hash) 
    DO UPDATE SET message = EXCLUDED.message;
  `;

  try {
    await pool.query( query, [ tx_hash, message ] );
    console.log( `Inserted/Updated message for tx_hash: ${tx_hash}` );
  } catch ( error ) {
    console.error( `Error inserting/updating message for tx_hash ${tx_hash}:`, error );
  }
}

// Helper function to cache block data in Redis
async function cacheBlockInRedis( blockNumber, blockData ) {
  await redisClient.zAdd( 'blocks', [ { score: blockNumber, value: blockNumber.toString() } ] );
  await redisClient.hSet( `block:${blockNumber}`, mapObjectToHash( blockData ) );
  console.log( `Block ${blockNumber} cached successfully.` );
}

// Function to map object to Redis hash
const mapObjectToHash = ( obj ) => {
  return Object.entries( obj ).reduce( ( acc, [ key, value ] ) => {
    acc[ key ] = value !== null && value !== undefined ? value.toString() : '';
    return acc;
  }, {} );
};

// Other existing functions (insertExtrinsicData, insertBlockData, insertTransactionsData, etc.) remain unchanged
async function updateAccountBalance( api, address ) {
  try {
    const { data: { free: balance } } = await api.query.system.account( address );
    await pool.query(
      'INSERT INTO accounts (address, balance) VALUES ($1, $2) ON CONFLICT (address) DO UPDATE SET balance = $2',
      [ address, balance.toString() ]
    );
    console.log( `Updated balance for address: ${address}` );
  } catch ( error ) {
    console.error( `Error updating account balance for address ${address}:`, error );
  }
}

async function insertExtrinsicData( extrinsics ) {
  if ( extrinsics.length === 0 ) {
    console.log( "No extrinsics to process" );
    return; // Skip if no extrinsics to process
  }

  // Ensure each extrinsic has a valid gas_fee and other necessary fields
  extrinsics.forEach( ex => {
    ex.gas_fee = ex.gas_fee || '0'; // Default to '0' if gas_fee is missing
    ex.amount = ex.amount || '0'; // Default to '0' if amount is missing
    ex.fee = ex.fee || '0'; // Default to '0' if fee is missing
  } );

  // Create placeholders for parameterized queries
  const placeholders = extrinsics.map( ( _, index ) => {
    const base = index * 9 + 1; // Update to reflect 9 parameters per extrinsic
    return `($${base}, $${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8})`;
  } ).join( ', ' );

  // Insert query
  const query = `
    INSERT INTO extrinsics (extrinsic_index, tx_hash, block_number, from_address, to_address, amount, fee, gas_fee, method, timestamp)
    VALUES ${placeholders}
    ON CONFLICT (tx_hash) DO NOTHING;
  `;

  // Flatten parameters for insertion
  const flatParams = extrinsics.flatMap( ex => [
    ex.extrinsic_index,
    ex.tx_hash,
    ex.block_number,
    ex.from_address,
    ex.to_address,
    ex.amount,
    ex.fee,
    ex.gas_fee,
    ex.method,
    ex.timestamp,
  ] );

  try {
    const result = await pool.query( query, flatParams );
    console.log( `Inserted/Updated ${result.rowCount} extrinsics` );
  } catch ( error ) {
    console.error( 'Error inserting extrinsic data:', error );
  }
}

async function insertBlockData( blockNum, blockHash, parentHash, stateRoot, extrinsicsRoot, timestamp ) {
  const query = `
    INSERT INTO blocks (block_number, block_hash, parent_hash, state_root, extrinsics_root, timestamp)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (block_number) DO NOTHING;
  `;
  try {
    await pool.query( query, [ blockNum, blockHash, parentHash, stateRoot, extrinsicsRoot, timestamp ] );
    console.log( `Inserted block ${blockNum}` );
  } catch ( error ) {
    console.error( `Error inserting block ${blockNum}:`, error );
  }
}

async function insertTransactionsData( transactions ) {
  if ( transactions.length === 0 ) {
    return; // Skip if no transactions to process
  }

  // Set default gas_value if it's null
  transactions.forEach( tx => {
    if ( !tx.gas_value ) {
      tx.gas_value = '0'; // Default value for missing gas_value
    }
  } );

  const placeholders = transactions.map( ( _, index ) => {
    const base = index * 10 + 1;
    return `($${base}, $${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9})`;
  } ).join( ', ' );

  const query = `
    INSERT INTO transactions (tx_hash, block_number, from_address, to_address, amount, fee, gas_fee, gas_value, method, events)
    VALUES ${placeholders}
    ON CONFLICT (tx_hash) DO NOTHING;
  `;

  const flatParams = transactions.flatMap( tx => [
    tx.tx_hash, tx.block_number, tx.from_address, tx.to_address, tx.amount, tx.fee, tx.gas_fee, tx.gas_value, tx.method, JSON.stringify( tx.events )
  ] );

  try {
    await pool.query( query, flatParams );
    console.log( `Inserted/Updated ${transactions.length} transactions` );
  } catch ( error ) {
    console.error( 'Error inserting transaction data:', error );
  }
}

async function insertEventsData( allEvents, blockNum ) {
  if ( allEvents.length === 0 ) {
    return; // No events to process
  }

  const events = allEvents.map( ( { event, phase } ) => ( {
    blockNum,
    section: event.section,
    method: event.method,
    data: JSON.stringify( event.data.map( d => d.toString() ) ),
  } ) );

  const placeholders = events.map( ( _, index ) => {
    const base = index * 4 + 1; // Calculate placeholder starting index correctly
    return `($${base}, $${base + 1}, $${base + 2}, $${base + 3})`;
  } ).join( ', ' );

  const query = `
    INSERT INTO events (block_number, section, method, data)
    VALUES ${placeholders}
    ON CONFLICT DO NOTHING;
  `;

  const flatParams = events.flatMap( evt => [ evt.blockNum, evt.section, evt.method, evt.data ] );

  try {
    await pool.query( query, flatParams );
    console.log( `Inserted/Updated ${events.length} events` );
  } catch ( error ) {
    console.error( 'Error inserting event data:', error );
  }
}

module.exports = {
  fetchChainData: main,
};
