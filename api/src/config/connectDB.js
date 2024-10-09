const { Pool } = require('pg');

// Create a new PostgreSQL connection pool
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT,
});

// Function to handle unexpected pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1); // Exit the process to prevent undefined behavior
});

// Function to get a client from the pool and handle connection issues
const getClient = async () => {
  try {
    const client = await pool.connect(); // Get a client from the pool
    console.log('Connected to PostgreSQL successfully');
    return client;
  } catch (err) {
    console.error('Error acquiring client from pool:', err.stack);
    throw new Error('Database connection failed');
  }
};

// Function to query the database with proper error handling
const query = async (text, params) => {
  const client = await getClient();
  try {
    const result = await client.query(text, params); // Run the query
    return result;
  } catch (err) {
    console.error('Error executing query:', err.stack);
    throw new Error('Query execution failed');
  } finally {
    client.release(); // Release the client back to the pool
  }
};

// Proper shutdown and pool cleanup
const shutdown = async () => {
  try {
    await pool.end();
    console.log('PostgreSQL pool has ended');
  } catch (err) {
    console.error('Error during pool shutdown:', err.stack);
  }
};

module.exports = {
  query,
  shutdown,
};
