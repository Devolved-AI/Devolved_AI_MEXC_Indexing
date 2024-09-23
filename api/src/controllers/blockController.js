// src/controllers/blockController.js
const db = require('../utils/connectDb');
const redisClient = require('../utils/redisClient');

const getBlockDetails = async (req, res, next) => {
  const { blockNumber } = req.params;
  try {
    const cacheKey = `block:${blockNumber}`;
    let blockData = await redisClient.get(cacheKey);

    if (blockData) {
      return res.json({ success: true, result: JSON.parse(blockData) });
    }

    // @ts-ignore
    const result = await db.query('SELECT * FROM blocks WHERE block_number = $1', [blockNumber]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Block not found' });
    }

    blockData = result.rows[0];
    await redisClient.set(cacheKey, JSON.stringify(blockData));

    res.json({ success: true, result: blockData });
  } catch (error) {
    next(error);
  }
};

module.exports = { getBlockDetails };