const pool = require('../config/connectDB');
require('dotenv').config();

const createTables = async () => {
  const client = await pool.connect();  // Use pool to connect to the database

  try {
    await client.query('BEGIN'); // Start a transaction

    // Create blocks table
    await client.query(`
      CREATE TABLE IF NOT EXISTS blocks (
        block_number BIGINT PRIMARY KEY,
        block_hash VARCHAR(66) NOT NULL,
        parent_hash VARCHAR(66) NOT NULL,
        state_root VARCHAR(66) NOT NULL,
        extrinsics_root VARCHAR(66) NOT NULL,
        timestamp TIMESTAMP NOT NULL
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_blocks_hash ON blocks(block_hash);
    `);

    // Create events table
    await client.query(`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        block_number BIGINT REFERENCES blocks(block_number),
        section VARCHAR(255) NOT NULL,
        method VARCHAR(255) NOT NULL,
        data JSONB NOT NULL
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_events_block_number ON events(block_number);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_events_section_method ON events(section, method);
    `);

    // Create transactions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        tx_hash VARCHAR(66) PRIMARY KEY,
        block_number BIGINT REFERENCES blocks(block_number),
        from_address VARCHAR(66) NOT NULL,
        to_address VARCHAR(66) NOT NULL,
        amount VARCHAR(255) NOT NULL,
        fee VARCHAR(255) NOT NULL,
        gas_fee VARCHAR(255) NOT NULL,
        gas_value VARCHAR(255) NOT NULL,
        method VARCHAR(255) NOT NULL,
        events JSONB NOT NULL
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_block_number ON transactions(block_number);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_from_address ON transactions(from_address);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_to_address ON transactions(to_address);
    `);

    // Create accounts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS accounts (
        address VARCHAR(66) PRIMARY KEY,
        balance VARCHAR(255) NOT NULL
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_accounts_balance ON accounts(balance);
    `);

    // Create transactionMessages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactionMessages (
        id SERIAL PRIMARY KEY,
        tx_hash VARCHAR(66) REFERENCES transactions(tx_hash),
        message TEXT NOT NULL
      );
    `);

    await client.query('COMMIT'); // Commit the transaction if all queries succeed
    console.log('6 Tables created successfully');
  } catch (err) {
    await client.query('ROLLBACK'); // Rollback transaction in case of error
    console.error('Error creating tables:', err);
  } finally {
    client.release(); // Release the client back to the pool
  }
};

module.exports = createTables;