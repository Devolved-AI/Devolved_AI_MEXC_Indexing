const { ApiPromise, WsProvider } = require('@polkadot/api');
require('dotenv').config();
const pool = require('@config/connectDB');
const { validationResult } = require('express-validator');

// Setup the Polkadot.js API provider
const wsProvider = new WsProvider(process.env.ARGOCHAIN_RPC_URL);
let api = null;

const initializeApi = async () => {
  if (!api) {
    api = await ApiPromise.create({ provider: wsProvider });
  }
};

const postTransactionMessage = async (req, res) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { tx_hash, message, sender, recipient, amount } = req.body;

  try {
    await initializeApi();

    // Check if the transaction exists in the transactions table
    const transactionCheck = await pool.query('SELECT * FROM transactions WHERE tx_hash = $1', [tx_hash]);

    if (transactionCheck.rows.length === 0) {
      // Execute the balance transfer
      const transfer = api.tx.palletCounter.balanceTransferNew(recipient, amount);
      const hash = await transfer.signAndSend(sender);

      // Assume tx_hash from the body is the same as the transaction hash from the blockchain
      if (hash.toHex() !== tx_hash) {
        return res.status(400).json({ message: 'Transaction hash mismatch' });
      }
    }

    // Check if the message for this tx_hash already exists in the transactionMessages table
    const messageCheck = await pool.query('SELECT * FROM transactionmessages WHERE tx_hash = $1', [tx_hash]);

    if (messageCheck.rows.length > 0) {
      // Update the existing message
      await pool.query(
        'UPDATE transactionmessages SET message = $1 WHERE tx_hash = $2',
        [message, tx_hash]
      );
      return res.status(200).json({ message: 'Transaction message updated successfully' });
    } else {
      // Insert a new transaction message
      await pool.query(
        'INSERT INTO transactionmessages (tx_hash, message) VALUES ($1, $2)',
        [tx_hash, message]
      );
      return res.status(201).json({ message: 'Transaction message added successfully' });
    }
  } catch (error) {
    console.error('Error storing transaction message or sending Substrate transaction:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  postTransactionMessage,
};
