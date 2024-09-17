const redisClient = require('@libs/redisClient');

const getLast10Blocks = async (res) => {
  try {
    const blockKeys = await redisClient.zrevrange('blocks', 0, 9);

    const blocks = [];
    for (const key of blockKeys) {
      const block = await redisClient.hGetAll(`block:${key}`);
      blocks.push(block);
    }

    return res.status(200).json(blocks);
  } catch (error) {
    console.error('Error retrieving blocks from Redis:', error.message);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};


const getBlockDetails = async (req, res, next) => {
  const { blockNumber } = req.params;
  try {
    const cacheKey = `block:${blockNumber}`;
    let blockData = await redisClient.get(cacheKey);

    if (blockData) {
      return res.json({ success: true, result: JSON.parse(blockData) });
    }

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

module.exports = { 
  getLast10Blocks,
  getBlockDetails
};