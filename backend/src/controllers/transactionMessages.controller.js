const { validationResult } = require('express-validator');
const pool = require('@config/connectDB');

const postTransactionMessage = async (req, res) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { tx_hash, message } = req.body;

  try {
    // Check if the transaction exists in the transactions table
    const transactionCheck = await pool.query('SELECT * FROM transactions WHERE tx_hash = $1', [tx_hash]);

    if (transactionCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check if the message for this tx_hash already exists in the transactionMessages table
    const messageCheck = await pool.query('SELECT * FROM transactionMessages WHERE tx_hash = $1', [tx_hash]);

    if (messageCheck.rows.length > 0) {
      // Update the existing message
      await pool.query(
        'UPDATE transactionMessages SET message = $1 WHERE tx_hash = $2',
        [message, tx_hash]
      );
      return res.status(200).json({ message: 'Transaction message updated successfully' });
    } else {
      // Insert a new transaction message
      await pool.query(
        'INSERT INTO transactionMessages (tx_hash, message) VALUES ($1, $2)',
        [tx_hash, message]
      );
      return res.status(201).json({ message: 'Transaction message added successfully' });
    }
  } catch (error) {
    console.error('Error storing transaction message:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  postTransactionMessage,
};
