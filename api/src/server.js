// src/server.js
const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();
// const initDb = require('./utils/initDb');
// const fetchChainData = require('./utils/fetchChainData');

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());

// Initialize the database
// initDb()
//   .then(() => {
//     // Start fetching chain data
//     setInterval(fetchChainData, 6000); // Fetch data every 6 seconds
//   })
//   .catch((err) => {
//     console.error('Error during initialization:', err);
//   });

// Health Check Endpoint

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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
