// src/controllers/cacheListener.js
const pool = require('@config/connectDB'); // Importing pg client
const redisClient = require('@config/redisClient'); // Importing redis client
require('dotenv').config();

const initialize = async () => {
  try {
    // Connect to Redis
    await redisClient.connect();
    console.log('4. Connected to Redis');

    // Initialize Redis with the current state of the database
    await initializeRedisWithAllData();

    // Connect to PostgreSQL and listen for notifications
    const client = await pool.connect();
    console.log('3. Connected to PostgreSQL');

    client.on('notification', async (msg) => {
      const payload = JSON.parse(msg.payload);
      const operation = payload.operation;
      const record = payload.record;

      switch (msg.channel) {
        case 'block_change':
          await cacheBlock(operation, record);
          break;
        case 'event_change':
          await cacheEvent(operation, record);
          break;
        case 'transaction_change':
          await cacheTransaction(operation, record);
          break;
        case 'account_change':
          await cacheAccount(operation, record);
          break;
        case 'transaction_message_change':
          await cacheTransactionMessage(operation, record);
          break;
        default:
          console.error(`Unknown notification channel: ${msg.channel}`);
      }
    });

    // Subscribe to the necessary PostgreSQL notification channels
    await client.query('LISTEN block_change');
    await client.query('LISTEN event_change');
    await client.query('LISTEN transaction_change');
    await client.query('LISTEN account_change');
    await client.query('LISTEN transaction_message_change');

    client.on('error', (err) => {
      console.error('PostgreSQL client error', err);
      reconnectPostgres(client);
    });
  } catch (err) {
    console.error('Error in initialize function:', err);
    setTimeout(initialize, 5000); // Retry after 5 seconds
  }
};

const reconnectPostgres = (client) => {
  console.log('Reconnecting to PostgreSQL...');
  client.connect((err) => {
    if (err) {
      console.error('PostgreSQL client reconnection error', err);
      setTimeout(() => reconnectPostgres(client), 5000); // Retry after 5 seconds
    } else {
      console.log('3.1 Reconnected to PostgreSQL');
    }
  });
};

const initializeRedisWithAllData = async () => {
  try {
    console.log('5. Initializing Redis with all data from PostgreSQL...');
    await initializeRedisBlocks();
    await initializeRedisEvents();
    await initializeRedisTransactions();
    await initializeRedisAccounts();
    await initializeRedisTransactionMessages();
    console.log('8. Redis initialization complete.');
  } catch (err) {
    console.error('Error initializing Redis with all data:', err);
  }
};

// Individual table initialization functions
const initializeRedisBlocks = async () => {
  await initializeRedisTable('blocks', cacheBlock);
};

const initializeRedisEvents = async () => {
  await initializeRedisTable('events', cacheEvent);
};

const initializeRedisTransactions = async () => {
  await initializeRedisTable('transactions', cacheTransaction);
};

const initializeRedisAccounts = async () => {
  await initializeRedisTable('accounts', cacheAccount);
};

const initializeRedisTransactionMessages = async () => {
  await initializeRedisTable('transactionmessages', cacheTransactionMessage);
};

const initializeRedisTable = async (tableName, cacheFunction) => {
  const query = `SELECT * FROM ${tableName}`;
  try {
    const res = await pool.query(query);
    for (const row of res.rows) {
      await cacheFunction('INSERT', row);
    }
  } catch (err) {
    console.error(`Error initializing Redis with ${tableName}:`, err);
  }
};

// Caching functions for different operations
const cacheBlock = async (operation, block) => {
  await cacheEntity(operation, `block:${block.block_number}`, block);
};

const cacheEvent = async (operation, event) => {
  await cacheEntity(operation, `event:${event.id}`, event);
};

const cacheTransaction = async (operation, transaction) => {
  await cacheEntity(operation, `transaction:${transaction.tx_hash}`, transaction);
};

const cacheAccount = async (operation, account) => {
  await cacheEntity(operation, `account:${account.address}`, account);
};

const cacheTransactionMessage = async (operation, transactionMessage) => {
  await cacheEntity(operation, `transactionMessage:${transactionMessage.id}`, transactionMessage);
};

// General cache entity function
const cacheEntity = async (operation, key, entity) => {
  try {
    if (operation === 'DELETE') {
      await redisClient.del(key);
      console.log(`Deleted ${key} from Redis.`);
    } else {
      await redisClient.hSet(key, mapObjectToHash(entity));
      console.log(`Cached ${key} in Redis.`);
    }
  } catch (err) {
    console.error(`Error caching ${key}:`, err);
  }
};

// Helper function to map an object to Redis hash
const mapObjectToHash = (obj) => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    acc[key] = value !== null && value !== undefined ? value.toString() : '';
    return acc;
  }, {});
};

// Start the cache listener
const cacheListener = async () => {
  await initialize();
};

module.exports = cacheListener;
