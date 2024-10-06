const { ApiPromise, WsProvider } = require('@polkadot/api');
const { createClient } = require('redis');
const fs = require('fs');
const { exec } = require('child_process');
require('dotenv').config();

// Initialize WebSocket provider for the Substrate node
const wsProvider = new WsProvider(process.env.ARGOCHAIN_RPC_URL);

// Initialize Redis client
const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

const RETRY_LIMIT = 5; // Number of retries for block processing
const RETRY_DELAY = 5000; // Delay between retries (in milliseconds)
const BATCH_SIZE = parseInt(process.env.FETCHING_BATCH_SIZE || '10', 10); // Number of blocks to process in a batch
const RESTART_DELAY = 3000;

const main = async () => {
  try {
    console.log('Starting main process...');
    await redisClient.connect();

    // Create API instance
    const api = await ApiPromise.create({ provider: wsProvider });

    // Get the latest block number
    const latestHeader = await api.rpc.chain.getHeader();
    const latestBlockNumber = latestHeader.number.toNumber();
    console.log(`Latest block number: ${latestBlockNumber}`);

    // Load last processed block number if it exists
    let startBlockNumber = 0;
    if (fs.existsSync('lastProcessedBlockInCache.txt')) {
      startBlockNumber = parseInt(fs.readFileSync('lastProcessedBlockInCache.txt', 'utf8'), 10) + 1;
      console.log(`Starting from block number: ${startBlockNumber}`);
    }

    // Check if the difference between the latest block number and the last processed block number is more than 5
    // if (latestBlockNumber - startBlockNumber > 5) {
    //   console.log('Block processing is lagging. Restarting process to resynchronize.');
    //   await delay(RESTART_DELAY); // Wait for 5 seconds before restarting
    //   restartPM2();
    // }

    // Process blocks in batches
    for (let blockNumber = startBlockNumber; blockNumber <= latestBlockNumber; blockNumber += BATCH_SIZE) {
      const endBlockNumber = Math.min(blockNumber + BATCH_SIZE - 1, latestBlockNumber);
      console.log(`Processing block batch from ${blockNumber} to ${endBlockNumber}`);
      await processBlockBatch(api, blockNumber, endBlockNumber);
    }

    // Fetch and store all account balances
    console.log('Fetching and storing all accounts...');
    await fetchAndStoreAllAccounts(api);

    await redisClient.disconnect();
    console.log('Main process completed.');
    await delay(RESTART_DELAY); // Wait for 5 seconds before restarting
    restartPM2();
  } catch (error) {
    console.error('Error initializing API:', error);
    await redisClient.disconnect();
    restartPM2();
  }
};

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const restartPM2 = () => {
  exec('pm2 start ecosystem.config.js --env production', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error restarting PM2: ${error}`);
      return;
    }
    if (stderr) {
      console.error(`PM2 stderr: ${stderr}`);
      return;
    }
    console.log(`PM2 stdout: ${stdout}`);
  });
};

// Process a batch of blocks
const processBlockBatch = async (api, startBlockNumber, endBlockNumber) => {
  const blockNumbers = [];
  for (let blockNumber = startBlockNumber; blockNumber <= endBlockNumber; blockNumber++) {
    blockNumbers.push(blockNumber);
  }

  console.log(`Processing blocks: ${blockNumbers.join(', ')}`);
  const blockPromises = blockNumbers.map(blockNumber => processBlockWithRetries(api, blockNumber));
  await Promise.all(blockPromises);
};

// Retry processing a block up to the RETRY_LIMIT
const processBlockWithRetries = async (api, blockNumber) => {
  let retries = 0;
  while (retries < RETRY_LIMIT) {
    try {
      console.log(`Processing block ${blockNumber}`);
      await processBlock(api, blockNumber);
      console.log(`Successfully processed block ${blockNumber}`);
      // Save last processed block number
      fs.writeFileSync('lastProcessedBlockInCache.txt', blockNumber.toString(), 'utf8');
      break;
    } catch (error) {
      retries++;
      console.error(`Error processing block ${blockNumber}:`, error);
      if (retries < RETRY_LIMIT) {
        console.log(`Retrying block ${blockNumber} (${retries}/${RETRY_LIMIT})...`);
        await delay(RETRY_DELAY);
      } else {
        console.error(`Failed to process block ${blockNumber} after ${RETRY_LIMIT} retries.`);
      }
    }
  }
};

// Process a single block
const processBlock = async (api, blockNumber) => {
  try {
    const hash = await api.rpc.chain.getBlockHash(blockNumber);
    const signedBlock = await api.rpc.chain.getBlock(hash);

    const blockNum = signedBlock.block.header.number.toNumber();
    const blockHash = signedBlock.block.header.hash.toHex();
    const parentHash = signedBlock.block.header.parentHash.toHex();
    const stateRoot = signedBlock.block.header.stateRoot.toHex();
    const extrinsicsRoot = signedBlock.block.header.extrinsicsRoot.toHex();
    let timestamp = new Date();

    // Extract timestamp from block extrinsics
    for (const extrinsic of signedBlock.block.extrinsics) {
      const { method: { method, section }, args } = extrinsic;
      if (section === 'timestamp' && method === 'set') {
        timestamp = new Date(parseInt(args[0].toString(), 10));
        break;
      }
    }

    // Ensure timestamp is not null
    if (!timestamp) {
      console.error(`No timestamp found for block ${blockNumber}`);
      return;
    }

    // Store block data in Redis sorted set
    await redisClient.zAdd('blocks', { score: blockNum, value: JSON.stringify({ blockNum, blockHash, parentHash, stateRoot, extrinsicsRoot, timestamp }) });

    const allEvents = await api.query.system.events.at(signedBlock.block.header.hash);
    const transactions = [];

    for (const [extrinsicIndex, extrinsic] of signedBlock.block.extrinsics.entries()) {
      const { isSigned, meta, method: { method, section }, args, signer, hash } = extrinsic;

      if (isSigned) {
        const [to, amount] = args;
        const tip = meta.isSome ? meta.unwrap().tip.toString() : '0';

        let gasFee = '0';
        const extrinsicEvents = allEvents.filter(
          ({ phase }) => phase.isApplyExtrinsic && phase.asApplyExtrinsic.eq(extrinsicIndex)
        );

        const events = extrinsicEvents.map(({ event }) => ({
          section: event.section,
          method: event.method,
          data: event.data.map((data) => data.toString()),
        }));

        for (const { event } of extrinsicEvents) {
          if (event.section === 'balances' && event.method === 'Withdraw') {
            gasFee = event.data[1].toString();
          }
        }

        const transaction = {
          extrinsic_index: extrinsicIndex,
          hash: hash.toHex(),
          block_number: blockNum,
          from_address: signer.toString(),
          to_address: to.toString(),
          amount: amount.toString(),
          fee: tip,
          gas_fee: gasFee,
          gas_value: '0', // Assuming gas value is not available
          method: `${section}.${method}`,
          events: events
        };

        transactions.push(transaction);

        // Store transactions in Redis sorted set
        await redisClient.zAdd('transactions', { score: blockNum, value: JSON.stringify(transaction) });

        // Update account balances in Redis
        await updateAccountBalance(api, signer.toString());
        await updateAccountBalance(api, to.toString());
      }
    }

    // Store events in Redis sorted set
    const eventInsertData = allEvents.map(({ event, phase }) => {
      const { section, method, data } = event;
      return {
        block_number: blockNum,
        section,
        method,
        data: JSON.stringify(data.map(d => d.toString()))
      };
    });

    await Promise.all(eventInsertData.map(event => redisClient.zAdd('events', { score: blockNum, value: JSON.stringify(event) })));

    console.log(`Successfully processed block ${blockNumber}`);
  } catch (error) {
    console.error(`Error processing block ${blockNumber}:`, error);
  }
};

// Update account balance for a given address
const updateAccountBalance = async (api, address) => {
  try {
    if (address.length !== 48) {
      console.error(`Invalid AccountId provided, expected 32 bytes, found ${address.length / 2} bytes`);
      return;
    }

    const { data: { free: balance } } = await api.query.system.account(address);

    await redisClient.zAdd('accounts', { score: balance.toString(), value: JSON.stringify({ address, balance: balance.toString() }) });
  } catch (error) {
    console.error(`Error updating balance for account ${address}:`, error);
  }
};

// Fetch and store all accounts and their balances
const fetchAndStoreAllAccounts = async (api) => {
  try {
    const accounts = await api.query.system.account.entries();
    console.log(`Fetched ${accounts.length} accounts.`);

    const accountQueries = accounts.map(([key, account]) => {
      const address = key.args.map(k => k.toString())[0];
      const balance = account.data.free.toString();
      return redisClient.zAdd('accounts', { score: balance, value: JSON.stringify({ address, balance }) });
    });

    await Promise.all(accountQueries);
    console.log('Successfully fetched and stored all accounts');
  } catch (error) {
    console.error('Error fetching and storing accounts:', error);
  }
};

// Start the main process
main().catch(console.error);

// Monitor memory usage
setInterval(() => {
  const memoryUsage = process.memoryUsage();
  console.log(`Memory Usage: RSS ${memoryUsage.rss}, Heap Total ${memoryUsage.heapTotal}, Heap Used ${memoryUsage.heapUsed}`);
}, 60000);

// Handle unhandled rejections and uncaught exceptions
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
