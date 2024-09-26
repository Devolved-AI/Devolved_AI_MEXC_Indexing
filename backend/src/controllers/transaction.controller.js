const initializeRedisClient = require( '../config/connectCache' );
let redisClient;

// Initialize the Redis client
const initRedis = async () => {
  if (!redisClient || !redisClient.isOpen) {
    try {
      redisClient = await initializeRedisClient();
      console.log('✓ Redis is connected successfully');
    } catch (error) {
      console.error('Error connecting to Redis:', error.message);
      throw new Error('Redis connection failed');
    }
  }
};

// Function to get the last 10 blocks from Redis cache
const getLast10Transactions = async (req, res) => {
  try {
    // Ensure Redis client is initialized
    await initRedis();

    // Check if the 'transactions' sorted set exists
    const transactionsExist = await redisClient.exists('transactions');
    if (!transactionsExist) {
      return res.status(404).json({
        message: 'No sorted set "transactions" found in Redis'
      });
    }

    // Retrieve the last 10 transaction keys from Redis sorted set 'transactions'
    const transactionKeys = await redisClient.zRange('transactions', 0, 9, { REV: true });

    if (!transactionKeys || transactionKeys.length === 0) {
      return res.status(404).json({
        message: 'No transactions found in Redis sorted set'
      });
    }

    console.log('Retrieved transaction keys:', transactionKeys);

    // Fetch details for each transaction key from the Redis hash
    const transactions = await Promise.all(
      transactionKeys.map(async (key) => {
        const transaction = await redisClient.hGetAll(`transaction:${key}`);
        return transaction;
      })
    );

    // Return the transactions as a JSON response
    return res.status(200).json({
      transactions,
      message: 'Successfully retrieved the latest 10 transactions'
    });
  } catch (error) {
    console.error('Error retrieving transactions from Redis:', error.message);
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
};

const getTransactionDetails = async (req, res, next) => {
  const { address } = req.params;
  try {
    const cacheKey = `transactions:${address}`;
    let transactionData = await redisClient.get(cacheKey);

    if (transactionData) {
      return res.json({ success: true, result: JSON.parse(transactionData) });
    }

    const result = await db.query(`
      SELECT * FROM transactions WHERE from_address = $1 OR to_address = $1
      ORDER BY block_number DESC LIMIT 100
    `, [address]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Transactions not found' });
    }

    transactionData = result.rows;
    await redisClient.set(cacheKey, JSON.stringify(transactionData));

    res.json({ success: true, result: transactionData });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLast10Transactions,
  getTransactionDetails
 };
