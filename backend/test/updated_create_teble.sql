-- Start transaction
BEGIN;

-- Create the blocks table
CREATE TABLE IF NOT EXISTS blocks (
    block_number BIGINT PRIMARY KEY,
    block_hash VARCHAR(66) NOT NULL,
    parent_hash VARCHAR(66) NOT NULL,
    state_root VARCHAR(66) NOT NULL,
    extrinsics_root VARCHAR(66) NOT NULL,
    timestamp TIMESTAMP NOT NULL
);

-- Index for faster query performance on block_hash
CREATE INDEX IF NOT EXISTS idx_blocks_hash ON blocks(block_hash);

-- Create the events table with event_index and timestamp
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    event_index INT NOT NULL,
    block_number BIGINT REFERENCES blocks(block_number),
    section VARCHAR(255) NOT NULL,
    method VARCHAR(255) NOT NULL,
    data JSONB NOT NULL,
    timestamp TIMESTAMP NOT NULL
);

-- Indexes for events table
CREATE INDEX IF NOT EXISTS idx_events_block_number ON events(block_number);
CREATE INDEX IF NOT EXISTS idx_events_section_method ON events(section, method);

-- Create the transactions table
CREATE TABLE IF NOT EXISTS transactions (
    tx_hash VARCHAR(66) PRIMARY KEY,
    block_number BIGINT REFERENCES blocks(block_number),
    from_address VARCHAR(66) NOT NULL,
    to_address VARCHAR(66) NOT NULL,
    amount NUMERIC NOT NULL,
    fee NUMERIC DEFAULT 0,
    gas_fee NUMERIC DEFAULT 0,
    method VARCHAR(255) NOT NULL,
    events JSONB NOT NULL,
    timestamp TIMESTAMP NOT NULL
);

-- Indexes for transactions table
CREATE INDEX IF NOT EXISTS idx_transactions_block_number ON transactions(block_number);
CREATE INDEX IF NOT EXISTS idx_transactions_from_address ON transactions(from_address);
CREATE INDEX IF NOT EXISTS idx_transactions_to_address ON transactions(to_address);

-- Create the accounts table
CREATE TABLE IF NOT EXISTS accounts (
    address VARCHAR(66) PRIMARY KEY,
    balance NUMERIC NOT NULL
);

-- Index for accounts based on balance
CREATE INDEX IF NOT EXISTS idx_accounts_balance ON accounts(balance);

-- Create the transactionMessages table with tx_hash as a foreign key
CREATE TABLE IF NOT EXISTS transactionmessages (
    id SERIAL PRIMARY KEY,
    tx_hash VARCHAR(66) NOT NULL UNIQUE,
    block_number BIGINT NOT NULL REFERENCES blocks(block_number),
    from_address VARCHAR(66) NOT NULL,
    to_address VARCHAR(66) NOT NULL,
    amount NUMERIC NOT NULL,
    method VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    CONSTRAINT fk_transactions FOREIGN KEY (tx_hash) REFERENCES transactions(tx_hash)
);

-- Create the extrinsics table with proper foreign key and indexing
CREATE TABLE IF NOT EXISTS extrinsics (
    id SERIAL PRIMARY KEY,
    extrinsic_index INT NOT NULL,
    block_number BIGINT REFERENCES blocks(block_number),
    from_address VARCHAR(66),
    to_address VARCHAR(66),
    amount NUMERIC,
    fee NUMERIC DEFAULT 0,
    gas_fee NUMERIC DEFAULT 0,
    method VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    tx_hash VARCHAR(66) UNIQUE
);

-- Index for extrinsics based on block_number
CREATE INDEX IF NOT EXISTS idx_extrinsics_block_number ON extrinsics(block_number);

-- Commit transaction
COMMIT;
