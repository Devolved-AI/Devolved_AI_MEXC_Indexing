// src/server.js
const express = require('express');
const { Pool } = require('pg');
const { formatDistanceToNow } = require("date-fns");
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();
require('express-async-errors');

const port = process.env.PORT || 4000;

const app = express();

app.use(helmet());
app.use(cors({
  origin: '*', // You can specify a specific origin like 'http://localhost:3000' if needed
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Initialize PostgreSQL connection pool using environment variables
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
});

app.get('/hitme/health', async (req, res) => {
  try {
    // Check database connection
    const client = await pool.connect();
    await client.query('SELECT NOW()'); // Simple query to check if the database is reachable
    client.release();

    res.status(200).json({
      success: true,
      serverUp: true,
      databaseUp: true,
      message: 'Server and database are running.',
    });
  } catch (error) {
    console.error('Health check failed:', error);

    res.status(500).json({
      success: false,
      serverUp: false,
      databaseUp: false,
      message: 'Failed to connect to the database.',
    });
  }
});

app.post('/hitme/address', async (req, res) => {
  const { address } = req.body;
  console.log(address);

    if (!address) {
      return res.status(400).json({
        success: false,
        message: "Address is required",
      });
    }

    try {
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
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
