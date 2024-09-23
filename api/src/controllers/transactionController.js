// src/controllers/transactionController.js
const db = require('../utils/connectDb');
const redisClient = require('../utils/redisClient');

const getTransactionDetails = async (req, res, next) => {
  const { address } = req.params;
  try {
    const cacheKey = `transactions:${address}`;
    let transactionData = await redisClient.get(cacheKey);

    if (transactionData) {
      return res.json({ success: true, result: JSON.parse(transactionData) });
    }

    // @ts-ignore
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

module.exports = { getTransactionDetails };
