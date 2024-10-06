const { Client } = require('pg');
const { createClient } = require('redis');
require('dotenv').config();

const pgClient = new Client({
  user: process.env.POSTGRES_USER,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT
});

const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
});

const initialize = async () => {
  try {
    await pgClient.connect();
    console.log('Connected to PostgreSQL');

    await redisClient.connect();
    console.log('Connected to Redis');

    // Add LISTEN for all tables
    pgClient.query('LISTEN new_transaction');
    pgClient.query('LISTEN new_block');
    pgClient.query('LISTEN new_event');
    pgClient.query('LISTEN new_account');

    // Initialize Redis sorted sets
    await initializeRedisSortedSets();

    // Listen for new data notifications
    pgClient.on('notification', async (msg) => {
      const payload = JSON.parse(msg.payload);

      if (msg.channel === 'new_transaction') {
        await updateRedisSortedSet('transactions', 'tx_hash', payload.txHash);
      }

      if (msg.channel === 'new_block') {
        await updateRedisSortedSet('blocks', 'block_number', payload.blockNumber);
      }

      if (msg.channel === 'new_event') {
        await updateRedisSortedSet('events', 'id', payload.id);
      }

      if (msg.channel === 'new_account') {
        await updateRedisSortedSet('accounts', 'address', payload.address);
      }
    });

    // Periodically refresh Redis cache
    setInterval(async () => {
      await initializeRedisSortedSets();
    }, 5000); // Every 5 seconds

  } catch (err) {
    console.error('Error in initialize function:', err);
    setTimeout(initialize, 5000); // Retry after 5 seconds
  }
};

const initializeRedisSortedSets = async () => {
  await initializeRedisSet('blocks', 'block_number');
  await initializeRedisSet('transactions', 'tx_hash');
  await initializeRedisSet('events', 'id');
  await initializeRedisSet('accounts', 'address');
};

const initializeRedisSet = async (table, keyField) => {
  const query = `SELECT * FROM ${table} ORDER BY ${keyField} DESC`;
  try {
    const res = await pgClient.query(query);
    await redisClient.del(`sorted_${table}`);
    for (const row of res.rows) {
      const score = row[keyField];  // We use block_number or tx_hash as the score
      await redisClient.zAdd(`sorted_${table}`, { score, value: JSON.stringify(row) });
    }
  } catch (err) {
    console.error(`Error initializing Redis sorted set for ${table}`, err);
  }
};

const updateRedisSortedSet = async (table, keyField, keyValue) => {
  const query = `SELECT * FROM ${table} WHERE ${keyField} = $1`;
  const values = [keyValue];
  try {
    const res = await pgClient.query(query, values);
    if (res.rows.length > 0) {
      const row = res.rows[0];
      const score = row[keyField];
      await redisClient.zAdd(`sorted_${table}`, { score, value: JSON.stringify(row) });
    }
  } catch (err) {
    console.error(`Error updating Redis sorted set for ${table}`, err);
  }
};

initialize();
