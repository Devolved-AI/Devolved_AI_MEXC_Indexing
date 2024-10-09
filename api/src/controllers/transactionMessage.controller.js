const { query } = require('@config/connectDB');

// API to store a tx_hash and message in PostgreSQL
const storeTransactionMessage = async (req, res) => {
  const { tx_hash, message } = req.body;

  if (!tx_hash || !message) {
    console.log('Validation failed: tx_hash or message is missing');
    return res.status(400).json({
      success: false,
      message: 'tx_hash and message are required',
    });
  }

  try {
    console.log(`Storing message for tx_hash: ${tx_hash}`);

    // SQL query to insert the transaction message into the database
    await query(
      `INSERT INTO transactionmessages (tx_hash, message) VALUES ($1, $2)`,
      [tx_hash, message]
    );

    console.log(`Transaction message for tx_hash: ${tx_hash} stored successfully`);

    return res.status(200).json({
      success: true,
      message: 'Transaction message stored successfully',
    });
  } catch (error) {
    console.error(`Error storing transaction message for tx_hash: ${tx_hash}`, error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// API to fetch a message by tx_hash from PostgreSQL
const getTransactionMessage = async (req, res) => {
  const { tx_hash } = req.body;

  if (!tx_hash) {
    console.log('Validation failed: tx_hash is missing');
    return res.status(400).json({
      success: false,
      message: 'tx_hash is required',
    });
  }

  try {
    console.log(`Fetching message for tx_hash: ${tx_hash}`);

    // SQL query to fetch the transaction message from the database by tx_hash
    const result = await query(
      `SELECT tx_hash, message FROM transactionmessages WHERE tx_hash = $1`,
      [tx_hash]
    );

    if (result.rows.length === 0) {
      console.log(`No message found for tx_hash: ${tx_hash}`);
      return res.status(404).json({
        success: false,
        message: `No message found for tx_hash: ${tx_hash}`,
      });
    }

    const transaction = result.rows[0];
    console.log(`Message for tx_hash: ${tx_hash} retrieved successfully`);

    return res.status(200).json({
      success: true,
      tx_hash: transaction.tx_hash,
      message: transaction.message
    });
  } catch (error) {
    console.error(`Error fetching transaction message for tx_hash: ${tx_hash}`, error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

module.exports = {
  storeTransactionMessage,
  getTransactionMessage
};
