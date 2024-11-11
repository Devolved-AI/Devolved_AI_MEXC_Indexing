const { ApiPromise, WsProvider } = require('@polkadot/api');
const { Pool } = require('pg');
const fs = require('fs');
const { exec } = require('child_process');
require('dotenv').config();

// Initialize WebSocket provider for the Substrate node
const wsProvider = new WsProvider(process.env.ARGOCHAIN_RPC_URL);

// Initialize PostgreSQL connection pool
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT
});

const RETRY_LIMIT = 3; // Number of retries for block processing
const RETRY_DELAY = 3000; // Delay between retries (in milliseconds)
const BATCH_SIZE = parseInt(process.env.FETCHING_BATCH_SIZE || '10', 10);; // Number of blocks to process in a batch
const RESTART_DELAY = 3000;

const main = async () => {
  try {
    console.log('Starting main process...');
    // Create API instance
    const api = await ApiPromise.create({ provider: wsProvider });

    // Get the latest block number
    const latestHeader = await api.rpc.chain.getHeader();
    const latestBlockNumber = latestHeader.number.toNumber();
    console.log(`Latest block number: ${latestBlockNumber}`);

    // Load last processed block number if it exists
    let startBlockNumber = 0;
    if (fs.existsSync('lastProcessedBlock.txt')) {
      startBlockNumber = parseInt(fs.readFileSync('lastProcessedBlock.txt', 'utf8'), 10) + 1;
      console.log(`Starting from block number: ${startBlockNumber}`);
    }

    // Process blocks in batches
    for (let blockNumber = startBlockNumber; blockNumber <= latestBlockNumber; blockNumber += BATCH_SIZE) {
      const endBlockNumber = Math.min(blockNumber + BATCH_SIZE - 1, latestBlockNumber);
      console.log(`Processing block batch from ${blockNumber} to ${endBlockNumber}`);
      await processBlockBatch(api, blockNumber, endBlockNumber);
    }

    // Fetch and store all account balances
    console.log('Fetching and storing all accounts...');
    await fetchAndStoreAllAccounts(api);

    await pool.end();
    console.log('Main process completed.');
    await delay(RESTART_DELAY); // Wait for 5 seconds before restarting
    restartPM2();
  } catch (error) {
    console.error('Error initializing API:', error);
    await pool.end();
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
  // const blockPromises = blockNumbers.map(blockNumber => processBlockWithTimeout(api, blockNumber));
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
      fs.writeFileSync('lastProcessedBlock.txt', blockNumber.toString(), 'utf8');
      break;
    } catch (error) {
      retries++;
      console.error(`Error processing block ${blockNumber}:`, error);
      if (retries < RETRY_LIMIT) {
        console.log(`Retrying block ${blockNumber} (${retries}/${RETRY_LIMIT})...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      } else {
        console.error(`Failed to process block ${blockNumber} after ${RETRY_LIMIT} retries.`);
      }
    }
  }
};

// Process a single block
const processBlock = async (api, blockNumber) => {
  try {
    console.log(`Processing block ${blockNumber}`);
    const blockInsertData = [];
    const transactionInsertData = [];
    const eventInsertData = [];

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

    if (!timestamp) {
      console.error(`No timestamp found for block ${blockNumber}`);
      return;
    }

    blockInsertData.push([blockNum, blockHash, parentHash, stateRoot, extrinsicsRoot, timestamp]);

    const allEvents = await api.query.system.events.at(signedBlock.block.header.hash);
    const transactions = [];

    for (const [extrinsicIndex, extrinsic] of signedBlock.block.extrinsics.entries()) {
      const { isSigned, meta, method: { method, section }, args, signer, hash } = extrinsic;
      const extrinsicMethod = `${section}.${method}`;

      // Check if the section and method match the new specified criteria
      if (
        (section === 'balances' && ['transfer', 'transferAll', 'transferAllowDeath', 'transferKeepAlive'].includes(method)) ||
        (section === 'palletCounter' && ['balanceTransferNew', 'mint'].includes(method))
      ) {
        let from = isSigned ? signer.toString() : null;
        let to = null;
        let amount = '0';
        let gasFee = '0';

        // Assign `to` and `amount` based on method arguments
        if (section === 'balances') {
          if (['transfer', 'transferAllowDeath', 'transferKeepAlive'].includes(method)) {
            [to, amount] = args;
          } else if (method === 'transferAll') {
            [to] = args; // transferAll may not have `amount` argument, adjust based on requirements
            // `transferAll` doesn't include `amount` in args, so fetch from events below
          }
        } 

        // else if (section === 'palletCounter') {
        //   if (method === 'mint') {
        //     [to, amount] = [args[0].toString(), args[1].toString()];
        //   } 
          
        //   else if (method === 'balanceTransferNew' || method === 'TransferOfBalanceNew') {
        //     // Look for a `balances.Transfer` or `balances.transfer` event to get `from`, `to`, and `amount`
        //     const balanceTransferEvent = allEvents.find(
        //       ({ event }) =>
        //         event.section === 'balances' &&
        //         (event.method === 'Transfer' || event.method === 'transfer')
        //     );
            
        //     if (balanceTransferEvent && balanceTransferEvent.event.data.length >= 3) {
        //       from = balanceTransferEvent.event.data[0].toString(); // Sender
        //       to = balanceTransferEvent.event.data[1].toString();   // Receiver
        //       amount = balanceTransferEvent.event.data[2].toString(); // Amount
        //     } else {
        //       from = '0';
        //       to = '0';
        //       amount = '0';
        //     }
        //   }
        // }

        else if (section === 'palletCounter') {
          if (method === 'mint') {
              [to, amount] = [args[0].toString(), args[1].toString()];
          } 
          else if (method === 'balanceTransferNew' || method === 'TransferOfBalanceNew') {
              // Define initial default values for `from`, `to`, and `amount`
              from = '0';
              to = '0';
              amount = '0';
      
              // Look for `Withdraw` and `Deposit` events to find `from`, `to`, and `amount`
              const withdrawEvent = allEvents.find(
                  ({ event }) => event.section === 'balances' && event.method === 'Withdraw'
              );
              const depositEvent = allEvents.find(
                  ({ event }) => event.section === 'balances' && event.method === 'Deposit'
              );
      
              // If a `Withdraw` event is found, set `from` based on the event data
              if (withdrawEvent && withdrawEvent.event.data.length >= 2) {
                  from = withdrawEvent.event.data[0].toString(); // Sender
              }
      
              // If a `Deposit` event is found, set `to` and `amount` based on the event data
              if (depositEvent && depositEvent.event.data.length >= 2) {
                  to = depositEvent.event.data[0].toString();     // Receiver
                  amount = depositEvent.event.data[1].toString();  // Amount
              }
              
              // Check for `TransferOfBalanceNew` to handle Case 2, if it exists
              const transferEvent = allEvents.find(
                  ({ event }) => event.section === 'palletCounter' && 
                                 (event.method === 'TransferOfBalanceNew' || event.method === 'balanceTransferNew')
              );
      
              // Use the `TransferOfBalanceNew` event data if available and relevant
              if (transferEvent && transferEvent.event.data.length >= 3) {
                  from = transferEvent.event.data[0].toString() || from;
                  to = transferEvent.event.data[1].toString() || to;
                  amount = transferEvent.event.data[2].toString() || amount;
              }
          }
      }      
        

        // For `transferAll`, find `amount` from `Transfer` or `Endowed` events if not in args
        if (method === 'transferAll' && amount === '0') {
          const transferEvent = allEvents.find(
            ({ event }) => event.section === 'balances' && (event.method === 'Transfer' || event.method === 'Endowed')
          );
          if (transferEvent) {
            amount = transferEvent.event.data[2]?.toString() || '0';
          }
        }
        const tip = meta.isSome ? meta.unwrap().tip.toString() : '0';

        // Filter events related to this extrinsic
        const extrinsicEvents = allEvents.filter(
          ({ phase }) => phase.isApplyExtrinsic && phase.asApplyExtrinsic.eq(extrinsicIndex)
        );

        // Map events to JSON format for storage
        const events = extrinsicEvents.map(({ event }) => ({
          section: event.section,
          method: event.method,
          data: event.data.map((data) => data.toString()),
        }));

        // Find gas fee within events if applicable
        for (const { event } of extrinsicEvents) {
          if (event.section === 'balances' && event.method === 'Withdraw') {
            gasFee = event.data[1].toString();
          }
        }

        // Accumulate transaction data in the `transactions` array
        transactions.push({
          hash: hash.toHex(),
          block_number: blockNum,
          from_address: from,
          to_address: to.toString(),
          amount: amount.toString(),
          fee: tip,
          gas_fee: gasFee,
          gas_value: '0', // Assuming gas_value as '0' for now
          method: extrinsicMethod,
          events: JSON.stringify(events), // Events stored in JSON format
        });

        // Update account balances if necessary
        await updateAccountBalance(api, from);
        if (to) await updateAccountBalance(api, to);
      }
    }

    // Accumulate transaction data for insertion
    for (const transaction of transactions) {
      transactionInsertData.push([
        transaction.hash,
        transaction.block_number,
        transaction.from_address,
        transaction.to_address,
        transaction.amount,
        transaction.fee,
        transaction.gas_fee,
        transaction.gas_value,
        transaction.method,
        JSON.stringify(transaction.events),
      ]);
    }

    // Accumulate event data
    for (const { event, phase } of allEvents) {
      const { section, method, data } = event;
      eventInsertData.push([
        blockNum,
        section,
        method,
        JSON.stringify(data.map(d => d.toString()))
      ]);
    }

    // Perform bulk insert for blocks
    if (blockInsertData.length > 0) {
      const blockQuery = `
        INSERT INTO blocks (block_number, block_hash, parent_hash, state_root, extrinsics_root, timestamp)
        VALUES ${blockInsertData.map((_, i) => `($${i * 6 + 1}, $${i * 6 + 2}, $${i * 6 + 3}, $${i * 6 + 4}, $${i * 6 + 5}, $${i * 6 + 6})`).join(', ')}
        ON CONFLICT (block_number) DO NOTHING;
      `;
      await pool.query(blockQuery, blockInsertData.flat());
      console.log(`Inserted block data for block ${blockNumber}`);
    }

    // Perform bulk insert for transactions
    if (transactionInsertData.length > 0) {
      const transactionQuery = `
        INSERT INTO transactions (tx_hash, block_number, from_address, to_address, amount, fee, gas_fee, gas_value, method, events)
        VALUES ${transactionInsertData.map((_, i) => `($${i * 10 + 1}, $${i * 10 + 2}, $${i * 10 + 3}, $${i * 10 + 4}, $${i * 10 + 5}, $${i * 10 + 6}, $${i * 10 + 7}, $${i * 10 + 8}, $${i * 10 + 9}, $${i * 10 + 10})`).join(', ')}
        ON CONFLICT (tx_hash) DO NOTHING;
      `;
      await pool.query(transactionQuery, transactionInsertData.flat());
      console.log(`Inserted transaction data for block ${blockNumber}`);
    }

    // Perform bulk insert for events
    if (eventInsertData.length > 0) {
      const eventQuery = `
        INSERT INTO events (block_number, section, method, data)
        VALUES ${eventInsertData.map((_, i) => `($${i * 4 + 1}, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4})`).join(', ')}
        ON CONFLICT DO NOTHING;
      `;
      await pool.query(eventQuery, eventInsertData.flat());
      console.log(`Inserted event data for block ${blockNumber}`);
    }

    console.log(`Successfully processed block ${blockNumber}`);
  } catch (error) {
    console.error(`Error processing block ${blockNumber}:`, error);
  }
};

// Update account balance for a given address
const updateAccountBalance = async (api, address) => {
  try {
    // Check if the address is of the correct length (32 bytes)
    if (address.length !== 48) { // 48 characters for hex representation of 32 bytes
      console.error(`Invalid AccountId provided, expected 32 bytes, found ${address.length / 2} bytes`);
      return;
    }

    const { data: { free: balance } } = await api.query.system.account(address);

    await pool.query(
      'INSERT INTO accounts (address, balance) VALUES ($1, $2) ON CONFLICT (address) DO UPDATE SET balance = $2',
      [address, balance.toString()]
    );
  } catch (error) {
    console.error(`Error updating balance for account ${address}:`, error);
  }
};

// Fetch and store all accounts and their balances
const fetchAndStoreAllAccounts = async (api) => {
  try {
    console.log('Fetching and storing all accounts...');
    const accounts = await api.query.system.account.entries();
    console.log(`Fetched ${accounts.length} accounts.`);
    const accountQueries = accounts.map(([key, account]) => {
      const address = key.args.map(k => k.toString())[0];
      const balance = account.data.free.toString();
      return {
        text: `
          INSERT INTO accounts (address, balance) VALUES ($1, $2)
          ON CONFLICT (address) DO UPDATE SET balance = $2
        `,
        values: [address, balance]
      };
    });

    if (accountQueries.length > 0) {
      await Promise.all(accountQueries.map(query => pool.query(query)));
      console.log('Successfully fetched and stored all accounts');
    }
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
}, 60000); // Log memory usage every minute

// Handle unhandled rejections and uncaught exceptions
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Recommended: send the information to a crash reporting service
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Recommended: send the information to a crash reporting service
  process.exit(1); // Exit the process to avoid undefined state
});