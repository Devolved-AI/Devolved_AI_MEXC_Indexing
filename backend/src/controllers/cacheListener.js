const pool = require('@config/connectDB'); // Importing pg client
const { createClient } = require('redis');
require('dotenv').config();

const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
});

const initialize = async () => {
  try {
    // Connect to PostgreSQL
    await pool.connect();
    console.log('Connected to PostgreSQL');

    // Connect to Redis
    await redisClient.connect();
    console.log('Connected to Redis');

    // Listen for PostgreSQL notifications for each table
    pool.query('LISTEN block_change');
    pool.query('LISTEN event_change');
    pool.query('LISTEN transaction_change');
    pool.query('LISTEN account_change');
    pool.query('LISTEN transaction_message_change');

    // Initialize Redis with the current state of the database
    await initializeRedisWithAllData();

    // Listen for changes and update Redis cache
    pool.on('notification', async (msg) => {
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
      }
    });

    pool.on('error', (err) => {
      console.error('PostgreSQL client error', err);
      reconnectPostgres();
    });

    redisClient.on('error', (err) => {
      console.error('Redis client error', err);
      reconnectRedis();
    });

  } catch (err) {
    console.error('Error in initialize function:', err);
    setTimeout(initialize, 5000); // Retry after 5 seconds
  }
};

const reconnectPostgres = () => {
  console.log('Reconnecting to PostgreSQL...');
  pool.connect((err) => {
    if (err) {
      console.error('PostgreSQL client reconnection error', err);
      setTimeout(reconnectPostgres, 5000); // Retry after 5 seconds
    } else {
      console.log('Reconnected to PostgreSQL');
    }
  });
};

const reconnectRedis = () => {
  console.log('Reconnecting to Redis...');
  redisClient.connect().catch((err) => {
    console.error('Redis client reconnection error', err);
    setTimeout(reconnectRedis, 5000); // Retry after 5 seconds
  });
};

// Function to initialize Redis with all current data from PostgreSQL
const initializeRedisWithAllData = async () => {
  try {
    console.log('Initializing Redis with all data from PostgreSQL...');
    await initializeRedisBlocks();
    await initializeRedisEvents();
    await initializeRedisTransactions();
    await initializeRedisAccounts();
    await initializeRedisTransactionMessages();
    console.log('Redis initialization complete.');
  } catch (err) {
    console.error('Error initializing Redis with all data:', err);
  }
};

// Individual table initialization functions
const initializeRedisBlocks = async () => {
  const query = 'SELECT * FROM blocks';
  try {
    const res = await pool.query(query);
    for (const row of res.rows) {
      await cacheBlock('INSERT', row);
    }
  } catch (err) {
    console.error('Error initializing Redis with blocks:', err);
  }
};

const initializeRedisEvents = async () => {
  const query = 'SELECT * FROM events';
  try {
    const res = await pool.query(query);
    for (const row of res.rows) {
      await cacheEvent('INSERT', row);
    }
  } catch (err) {
    console.error('Error initializing Redis with events:', err);
  }
};

const initializeRedisTransactions = async () => {
  const query = 'SELECT * FROM transactions';
  try {
    const res = await pool.query(query);
    for (const row of res.rows) {
      await cacheTransaction('INSERT', row);
    }
  } catch (err) {
    console.error('Error initializing Redis with transactions:', err);
  }
};

const initializeRedisAccounts = async () => {
  const query = 'SELECT * FROM accounts';
  try {
    const res = await pool.query(query);
    for (const row of res.rows) {
      await cacheAccount('INSERT', row);
    }
  } catch (err) {
    console.error('Error initializing Redis with accounts:', err);
  }
};

const initializeRedisTransactionMessages = async () => {
  const query = 'SELECT * FROM transactionmessages';
  try {
    const res = await pool.query(query);
    for (const row of res.rows) {
      await cacheTransactionMessage('INSERT', row);
    }
  } catch (err) {
    console.error('Error initializing Redis with transactionMessages:', err);
  }
};

// Caching functions for different operations
const cacheBlock = async (operation, block) => {
  const key = `block:${block.block_number}`;
  try {
    if (operation === 'DELETE') {
      await redisClient.del(key);
      console.log(`Deleted block ${block.block_number} from Redis.`);
    } else {
      await redisClient.hSet(key, block);
      console.log(`Cached block ${block.block_number} in Redis.`);
    }
  } catch (err) {
    console.error(`Error caching block ${block.block_number}:`, err);
  }
};

const cacheEvent = async (operation, event) => {
  const key = `event:${event.id}`;
  try {
    if (operation === 'DELETE') {
      await redisClient.del(key);
      console.log(`Deleted event ${event.id} from Redis.`);
    } else {
      await redisClient.hSet(key, event);
      console.log(`Cached event ${event.id} in Redis.`);
    }
  } catch (err) {
    console.error(`Error caching event ${event.id}:`, err);
  }
};

const cacheTransaction = async (operation, transaction) => {
  const key = `transaction:${transaction.tx_hash}`;
  try {
    if (operation === 'DELETE') {
      await redisClient.del(key);
      console.log(`Deleted transaction ${transaction.tx_hash} from Redis.`);
    } else {
      await redisClient.hSet(key, transaction);
      console.log(`Cached transaction ${transaction.tx_hash} in Redis.`);
    }
  } catch (err) {
    console.error(`Error caching transaction ${transaction.tx_hash}:`, err);
  }
};

const cacheAccount = async (operation, account) => {
  const key = `account:${account.address}`;
  try {
    if (operation === 'DELETE') {
      await redisClient.del(key);
      console.log(`Deleted account ${account.address} from Redis.`);
    } else {
      await redisClient.hSet(key, account);
      console.log(`Cached account ${account.address} in Redis.`);
    }
  } catch (err) {
    console.error(`Error caching account ${account.address}:`, err);
  }
};

const cacheTransactionMessage = async (operation, transactionMessage) => {
  const key = `transactionMessage:${transactionMessage.id}`;
  try {
    if (operation === 'DELETE') {
      await redisClient.del(key);
      console.log(`Deleted transactionMessage ${transactionMessage.id} from Redis.`);
    } else {
      await redisClient.hSet(key, transactionMessage);
      console.log(`Cached transactionMessage ${transactionMessage.id} in Redis.`);
    }
  } catch (err) {
    console.error(`Error caching transactionMessage ${transactionMessage.id}:`, err);
  }
};

// Your function
const cacheListener = async () => {
  initialize();
};

module.exports = cacheListener;
