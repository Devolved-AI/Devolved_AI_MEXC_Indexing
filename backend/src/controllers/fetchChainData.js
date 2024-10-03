const { ApiPromise, WsProvider } = require('@polkadot/api');
const pool = require('@config/connectDB');  // Importing PostgreSQL pool
const initializeRedisClient = require('@libs/redisClient');  // Importing Redis client
require('dotenv').config();

const BATCH_SIZE = parseInt(process.env.FETCHING_BATCH_SIZE || '10', 10);  // Process 10 blocks at a time
const RETRY_DELAY = 5000; // Delay between retries (in milliseconds)
let redisClient;  // Redis client

// Initialize WebSocket provider for the Substrate node
const wsProvider = new WsProvider(process.env.ARGOCHAIN_RPC_URL);

// Function to initialize Redis client
const initRedis = async () => {
  if (!redisClient || !redisClient.isOpen) {
    redisClient = await initializeRedisClient();
    console.log('✓ Redis is connected successfully');
  }
};

// Main function to start the block processing
async function main() {
  try {
    await initRedis();  // Initialize Redis

    const api = await ApiPromise.create({ provider: wsProvider });
    const latestHeader = await api.rpc.chain.getHeader();
    const latestBlockNumber = latestHeader.number.toNumber();
    console.log(`Latest block number: ${latestBlockNumber}`);

    const result = await pool.query('SELECT COALESCE(MAX(block_number), 0) as last_block_number FROM blocks');
    let lastProcessedBlockNumber = result.rows[0].last_block_number;

    if (lastProcessedBlockNumber === 0) {
      console.log('Starting from block 0.');
    }

    // Process blocks in batches
    for (let blockNumber = lastProcessedBlockNumber; blockNumber <= latestBlockNumber; blockNumber += BATCH_SIZE) {
      const endBlockNumber = Math.min(blockNumber + BATCH_SIZE - 1, latestBlockNumber);
      console.log(`Processing block batch from ${blockNumber} to ${endBlockNumber}`);
      await processBlockBatch(api, blockNumber, endBlockNumber);
      await updateCache();  // Update Redis cache after processing each batch
    }

    console.log('All blocks processed.');
  } catch (error) {
    console.error('Error in main function:', error);
    restartProcess();  // Restart the process if any critical error occurs
  }
}

// Process a batch of blocks
const processBlockBatch = async (api, startBlockNumber, endBlockNumber) => {
  const blockNumbers = [];
  for (let blockNumber = startBlockNumber; blockNumber <= endBlockNumber; blockNumber++) {
    blockNumbers.push(blockNumber);
  }

  for (const blockNumber of blockNumbers) {
    await processBlockWithRetries(api, blockNumber);
  }
};

// Infinite retry mechanism with exponential backoff for block processing
const processBlockWithRetries = async (api, blockNumber) => {
  let retries = 0;
  const maxRetries = Infinity;  // Allow infinite retries for each block

  while (retries < maxRetries) {
    try {
      await processBlock(api, blockNumber);
      console.log(`Successfully processed block ${blockNumber}`);
      break;  // Exit loop on success
    } catch (error) {
      retries++;
      const backoffDelay = RETRY_DELAY * Math.pow(2, retries);  // Exponential backoff
      console.error(`Error processing block ${blockNumber}. Retry ${retries} after ${backoffDelay} ms:`, error);
      await new Promise(resolve => setTimeout(resolve, backoffDelay));  // Delay before retrying
    }
  }
};

// Process a single block
async function processBlock(api, blockNumber) {
  try {
    const hash = await api.rpc.chain.getBlockHash(blockNumber);
    const block = await api.rpc.chain.getBlock(hash);
    const blockData = {
      blockNumber: block.block.header.number.toNumber(),
      blockHash: block.block.header.hash.toString(),
      parentHash: block.block.header.parentHash.toString(),
      stateRoot: block.block.header.stateRoot.toString(),
      extrinsicsRoot: block.block.header.extrinsicsRoot.toString(),
      timestamp: getBlockTimestamp(block.block.extrinsics)
    };

    // Insert block data into PostgreSQL
    await insertBlockData(blockData);

    // Process events and extrinsics
    await processExtrinsicsAndEvents(api, block, blockData);
  } catch (error) {
    console.error(`Failed to process block ${blockNumber}:`, error);
    throw error;  // Propagate the error to trigger retries
  }
}

// Process extrinsics and events in a block
async function processExtrinsicsAndEvents(api, block, blockData) {
  const allEvents = await api.query.system.events.at(block.block.header.hash);
  const transactions = [];
  const events = [];

  // Process extrinsics (transactions)
  for (const extrinsic of block.block.extrinsics) {
    if (extrinsic.isSigned && extrinsic.method.section === 'balances' && extrinsic.method.method === 'transfer') {
      transactions.push({
        txHash: extrinsic.hash.toHex(),
        blockNumber: blockData.blockNumber,
        fromAddress: extrinsic.signer?.toString(),
        toAddress: extrinsic.args[0]?.toString(),
        amount: extrinsic.args[1]?.toString(),
        method: `${extrinsic.method.section}.${extrinsic.method.method}`,
        timestamp: blockData.timestamp
      });
    }
  }

  // Insert transactions into PostgreSQL
  for (const tx of transactions) {
    await insertTransaction(tx);
  }

  // Process events
  for (const record of allEvents) {
    const { event, phase } = record;
    if (phase.isApplyExtrinsic) {
      events.push({
        blockNumber: blockData.blockNumber,
        eventIndex: phase.asApplyExtrinsic.toNumber(),
        section: event.section,
        method: event.method,
        data: event.data.toString(),
        timestamp: blockData.timestamp
      });
    }
  }

  // Insert events into PostgreSQL
  for (const eventData of events) {
    await insertEvent(eventData);
  }
}

// Insert block data into PostgreSQL and Redis
async function insertBlockData(blockData) {
  const query = `
    INSERT INTO blocks (block_number, block_hash, parent_hash, state_root, extrinsics_root, timestamp)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (block_number) DO NOTHING;
  `;
  
  // Store in PostgreSQL
  await pool.query(query, [
    blockData.blockNumber,
    blockData.blockHash,
    blockData.parentHash,
    blockData.stateRoot,
    blockData.extrinsicsRoot,
    blockData.timestamp
  ]);

  // Store in Redis
  const redisKey = `blocks:${blockData.blockNumber}`;
  await redisClient.hSet(redisKey, {
    block_number: blockData.blockNumber,
    block_hash: blockData.blockHash,
    parent_hash: blockData.parentHash,
    state_root: blockData.stateRoot,
    extrinsics_root: blockData.extrinsicsRoot,
    timestamp: blockData.timestamp.toISOString()
  });
  console.log(`Block ${blockData.blockNumber} added to PostgreSQL and Redis.`);
}

// Infinite retry logic to ensure data is stored no matter what happens
async function insertTransaction(transactionData) {
  const query = `
    INSERT INTO transactions (tx_hash, block_number, from_address, to_address, amount, method, timestamp)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (tx_hash) DO NOTHING;
  `;
  await pool.query(query, [
    transactionData.txHash,
    transactionData.blockNumber,
    transactionData.fromAddress,
    transactionData.toAddress,
    transactionData.amount,
    transactionData.method,
    transactionData.timestamp
  ]);
}

// Insert event into PostgreSQL
async function insertEvent(eventData) {
  const query = `
    INSERT INTO events (block_number, event_index, section, method, data, timestamp)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT DO NOTHING;
  `;
  await pool.query(query, [
    eventData.blockNumber,
    eventData.eventIndex,
    eventData.section,
    eventData.method,
    eventData.data,
    eventData.timestamp
  ]);
}

// Get timestamp from block extrinsics
function getBlockTimestamp(extrinsics) {
  for (const extrinsic of extrinsics) {
    if (extrinsic.method.section === 'timestamp' && extrinsic.method.method === 'set') {
      return new Date(parseInt(extrinsic.args[0].toString(), 10));
    }
  }
  return new Date();
}

// Start the main function
main();

module.exports = {
  fetchChainData: main,
};
