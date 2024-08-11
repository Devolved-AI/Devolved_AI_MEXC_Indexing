// src/controllers/blockController.js
const { pool, connectToDatabase } = require('../utils/connectDb');
const { formatDistanceToNow } = require("date-fns");

const getTransactionDetails = async (req, res) => {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({
        success: false,
        message: "Address is required",
      });
    }

    try {
        await connectToDatabase();
    
        const query = `
          SELECT transactions.tx_hash, transactions.method, transactions.block_number, blocks.timestamp, transactions.from_address, transactions.to_address, transactions.amount, transactions.gas_fee as gas_fee
          FROM transactions
          LEFT JOIN blocks ON transactions.block_number = blocks.block_number
          WHERE transactions.from_address = $1 OR transactions.to_address = $1
          ORDER BY transactions.block_number DESC
        `;
        const values = [address];
    
        const result = await pool.query(query, values);
    
        if (result.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: "No transactions found for the given address",
          });
        }
    
        const transactions = result.rows.map((tx) => ({
          tx_hash: tx.tx_hash,
          method: tx.method,
          block_number: tx.block_number,
          age: tx.timestamp
            ? `${formatDistanceToNow(new Date(tx.timestamp))} ago`
            : "N/A",
          from_address: tx.from_address,
          to_address: tx.to_address,
          amount: tx.amount,
          gas_fee: tx.gas_fee,
        }));
    
        return res.status(200).json({
          success: true,
          result: transactions,
        });
    } catch (error) {
        console.error("Error fetching transactions:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

module.exports = { getTransactionDetails };