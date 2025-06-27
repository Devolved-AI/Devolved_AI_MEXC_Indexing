const { query } = require('@config/connectDB');
const { ApiPromise, WsProvider } = require( '@polkadot/api' );
const logger = require('@config/logger');
const { asyncHandler, errorHandler } = require('@middleware/errorHandler');
const { successResponse, errorResponse, paginatedResponse } = require('@middleware/responseFormatter');
require('dotenv').config();

// Initialize WebSocket provider
const wsProvider = new WsProvider(process.env.ARGOCHAIN_RPC_URL);

const initializeApi = async () => {
  try {
    logger.debug('🔗 Initializing Polkadot API connection...');
    const api = await ApiPromise.create({ provider: wsProvider });
    logger.info('✅ Polkadot API connection established successfully');
    return api;
  } catch (error) {
    logger.error('❌ Failed to connect to RPC:', error);
    throw error;
  }
};

// Function to get the last 10 transactions from the database
const getLast10Transactions = asyncHandler(async (req, res) => {
  const requestId = req.requestId;
  
  logger.info(`[${requestId}] 📊 Fetching last 10 transactions from database`);
  
  try {
    // SQL query to get the last 10 transactions along with their block timestamp
    logger.debug(`[${requestId}] Executing SQL query for last 10 transactions`);
    
    const result = await query(
      `SELECT
        tx.tx_hash,
        tx.from_address,
        tx.to_address,
        tx.amount,
        tx.fee,
        tx.gas_fee,
        tx.method,
        tx.events,
        b.timestamp
      FROM transactions tx
      JOIN blocks b ON tx.block_number = b.block_number
      ORDER BY b.block_number DESC
      LIMIT 10`
    );

    logger.debug(`[${requestId}] Query executed successfully, found ${result.rows.length} transactions`);

    if (result.rows.length === 0) {
      logger.warn(`[${requestId}] No transactions found in database`);
      return errorResponse(res, 'No transactions found', 404, 'NO_DATA_FOUND');
    }

    // Format and return the transactions
    logger.info(`[${requestId}] Successfully retrieved ${result.rows.length} transactions`);
    return successResponse(res, result.rows, 'Last 10 transactions retrieved successfully');
    
  } catch (error) {
    logger.error(`[${requestId}] Database error while fetching transactions:`, error);
    throw new Error(`Database query failed: ${error.message}`);
  }
});

const getTransactionDetailsByHash = asyncHandler(async (req, res) => {
  const requestId = req.requestId;
  const { tx_hash } = req.body;

  logger.info(`[${requestId}] 🔍 Fetching transaction details for hash: ${tx_hash}`);

  if (!tx_hash) {
    logger.warn(`[${requestId}] Missing tx_hash in request body`);
    return errorResponse(res, 'tx_hash is required', 400, 'MISSING_PARAMETER');
  }

  // Validate transaction hash format
  if (!/^0x[a-fA-F0-9]{64}$/.test(tx_hash)) {
    logger.warn(`[${requestId}] Invalid transaction hash format: ${tx_hash}`);
    return errorResponse(res, 'Invalid transaction hash format', 400, 'INVALID_FORMAT');
  }

  try {
    logger.debug(`[${requestId}] Executing SQL query for transaction hash: ${tx_hash}`);
    
    // SQL query to get the transaction details along with the block number and timestamp
    const result = await query(
      `SELECT 
        tx.tx_hash, 
        tx.block_number,
        tx.from_address, 
        tx.to_address, 
        tx.amount, 
        tx.fee, 
        tx.gas_fee, 
        tx.method,
        tx.events,
        b.timestamp
      FROM transactions tx
      JOIN blocks b ON tx.block_number = b.block_number
      WHERE tx.tx_hash = $1`,
      [tx_hash]
    );

    logger.debug(`[${requestId}] Query executed successfully, found ${result.rows.length} matching transactions`);

    if (result.rows.length === 0) {
      logger.warn(`[${requestId}] No transaction found with hash: ${tx_hash}`);
      return errorResponse(res, `No transaction found with tx_hash: ${tx_hash}`, 404, 'TRANSACTION_NOT_FOUND');
    }

    const transaction = {
      ...result.rows[0],
      timestamp: result.rows[0].timestamp
    };

    logger.info(`[${requestId}] Successfully retrieved transaction details for hash: ${tx_hash}`);
    return successResponse(res, transaction, 'Transaction details retrieved successfully');
    
  } catch (error) {
    logger.error(`[${requestId}] Database error while fetching transaction by hash:`, error);
    throw new Error(`Database query failed: ${error.message}`);
  }
});

const getTransactionDetailsByAddress = asyncHandler(async (req, res) => {
  const requestId = req.requestId;
  
  try {
    // Extract the address from the request body
    const { address } = req.body;

    logger.info(`[${requestId}] 🔍 Fetching transaction details for address: ${address}`);

    if (!address) {
      logger.warn(`[${requestId}] Missing address in request body`);
      return errorResponse(res, 'Address is required', 400, 'MISSING_PARAMETER');
    }

    // Validate address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      logger.warn(`[${requestId}] Invalid address format: ${address}`);
      return errorResponse(res, 'Invalid address format', 400, 'INVALID_FORMAT');
    }

    logger.debug(`[${requestId}] Executing SQL query for address: ${address}`);
    
    // SQL query to retrieve all transaction details for the given address
    const result = await query(
      `SELECT 
        tx.tx_hash, 
        tx.from_address, 
        tx.to_address, 
        tx.amount, 
        tx.fee, 
        tx.gas_fee, 
        tx.gas_value, 
        tx.method, 
        tx.events, 
        tx.block_number, 
        b.timestamp
      FROM transactions tx
      JOIN blocks b ON tx.block_number = b.block_number
      WHERE tx.from_address = $1 OR tx.to_address = $1
      ORDER BY tx.block_number`,
      [address]
    );

    logger.debug(`[${requestId}] Query executed successfully, found ${result.rows.length} transactions for address`);

    // If no transactions are found
    if (result.rows.length === 0) {
      logger.warn(`[${requestId}] No transactions found for address: ${address}`);
      return errorResponse(res, `No transactions found for address ${address}`, 404, 'NO_TRANSACTIONS_FOUND');
    }

    // Organize the transactions by block number
    const transactionsByBlock = result.rows.reduce((acc, row) => {
      const { block_number, timestamp, ...transactionDetails } = row;
      if (!acc[block_number]) {
        acc[block_number] = {
          block_number,
          timestamp,
          transactions: [],
        };
      }
      acc[block_number].transactions.push(transactionDetails);
      return acc;
    }, {});

    const blocks = Object.values(transactionsByBlock);

    logger.info(`[${requestId}] Successfully retrieved ${result.rows.length} transactions across ${blocks.length} blocks for address: ${address}`);
    
    // Return the organized transactions grouped by block number
    return successResponse(res, {
      blocks: blocks,
      totalTransactions: result.rows.length,
      totalBlocks: blocks.length
    }, `Transactions grouped by block number retrieved for address ${address}`);

  } catch (error) {
    logger.error(`[${requestId}] Database error while fetching transactions for address "${req.body.address}":`, error);
    throw new Error(`Database query failed: ${error.message}`);
  }
});

// Function to get the account balance from Redis or from the blockchain
const getBalance = asyncHandler(async (req, res) => {
  const requestId = req.requestId;
  
  // Extract address from request body
  const { address } = req.body;

  logger.info(`[${requestId}] 💰 Fetching balance for address: ${address}`);

  // If address is not provided, return a 400 error
  if (!address) {
    logger.warn(`[${requestId}] Missing address in request body`);
    return errorResponse(res, 'Address is required', 400, 'MISSING_PARAMETER');
  }

  // Validate address format
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    logger.warn(`[${requestId}] Invalid address format: ${address}`);
    return errorResponse(res, 'Invalid address format', 400, 'INVALID_FORMAT');
  }

  try {
    logger.debug(`[${requestId}] Initializing Polkadot API for balance check`);
    const api = await initializeApi();

    logger.debug(`[${requestId}] Querying balance for address: ${address}`);
    const { data: balance } = await api.query.system.account(address);

    logger.info(`[${requestId}] Successfully retrieved balance for address: ${address}`);
    
    return successResponse(res, {
      address: address,
      balance: balance.free.toString(),
      reserved: balance.reserved.toString(),
      miscFrozen: balance.miscFrozen.toString(),
      feeFrozen: balance.feeFrozen.toString()
    }, 'Balance retrieved successfully');

  } catch (error) {
    logger.error(`[${requestId}] Error fetching balance for address ${address}:`, error);
    throw new Error(`Failed to fetch balance: ${error.message}`);
  }
});

const fetchTransactionData = async (req, res) => {
  try {
    const { blockHash } = req.body;

    // Validate request payload
    if (!blockHash) {
      return res.status(400).json({ 
        status: 400,
        success: false,
        error: "Block hash is required." 
      });
    }

    // Initialize the connection to the blockchain
    const wsProvider = new WsProvider(process.env.ARGOCHAIN_RPC_URL);
    const api = await ApiPromise.create({ provider: wsProvider });

    try {
      // Get the block details using the block hash
      const blockDetails = await api.rpc.chain.getBlock(blockHash);
      const events = await api.query.system.events.at(blockHash);

      // Extract block number from the block header
      const blockNumber = blockDetails.block.header.number.toNumber();

      // Loop through the block's extrinsics and filter those that match `palletCounter.includeIpfsHash`
      const extrinsics = blockDetails.block.extrinsics.map((extrinsic, index) => {
        const extrinsicMethod = `${extrinsic.method.section}.${extrinsic.method.method}`;

        if (extrinsicMethod === "palletCounter.includeIpfsHash") {
          const relatedEvents = events
            .filter(({ phase }) => phase.isApplyExtrinsic && phase.asApplyExtrinsic.eq(index))
            .map(({ event }) => ({
              section: event.section,
              method: event.method,
              data: event.data.toHuman(),
            }));

          return {
            blockNumber,
            blockHash: blockHash.toString(),
            extrinsicIndex: index,
            hash: extrinsic.hash.toHex(),
            method: extrinsicMethod,
            signer: extrinsic.signer?.toString(),
            args: extrinsic.args.map((arg) => arg.toHuman()),
            events: relatedEvents.filter(
              (e) => e.section === "palletCounter" && e.method === "IPFSHashIncluded"
            ),
          };
        }

        return null;
      }).filter(Boolean);

      // Check if any extrinsics were found
      if (extrinsics.length > 0) {
        return res.status(200).json({ 
          status: 200,
          success: true,
          data: extrinsics
        });
      } else {
        return res.status(404).json({
          status: 404,
          success: false,
          error: "No relevant extrinsics found for the provided block hash."
        });
      }
    } catch (error) {
      console.error(`Error fetching block with hash ${blockHash}:`, error);
      return res.status(500).json({ 
        status: 500,
        success: false,
        error: `Internal server error: ${error.message}`
      });
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return res.status(500).json({ 
      status: 400,
      success: false,
      error: `Internal server error: ${error.message}` 
    });
  }
};

const transactionDetailsEVM = async (req, res) => {
  const { tx_hash } = req.body;

  if (!tx_hash) {
    return res.status(400).json({
      success: false,
      message: 'tx_hash is required',
    });
  }

  try {
    // Step 1: Query the database to get the block number using the transaction hash
    const result = await query(
      `SELECT block_number 
       FROM events 
       WHERE section = 'ethereum' 
         AND method = 'Executed' 
         AND data->>2 = $1`,
      [tx_hash]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: 'Transaction not found in the database.',
      });
    }

    const blockNumber = result.rows[0].block_number;

    // Step 2: Initialize API and fetch block details from blockchain using blockNumber
    const api = await initializeApi();

    // Fetch the block hash from the block number
    const blockHash = await api.rpc.chain.getBlockHash(blockNumber);
    const signedBlock = await api.rpc.chain.getBlock(blockHash);

    // Get the block timestamp
    const timestampExtrinsic = signedBlock.block.extrinsics.find(
      (extrinsic) => extrinsic.method.section === 'timestamp' && extrinsic.method.method === 'set'
    );
    const timestamp = timestampExtrinsic ? new Date(parseInt(timestampExtrinsic.args[0].toString(), 10)) : null;

    // Fetch all events in the block
    const allEvents = await api.query.system.events.at(blockHash);

    // Collect required data specifically for ethereum.Executed extrinsics
    const transactionsData = [];
    signedBlock.block.extrinsics.forEach((extrinsic, index) => {
      let from = null;
      let to = null;
      let contractAddress = '';
      let gasFee = '0';
      let amount = '0';
      let transactionHash = null;

      // Filter events related to this extrinsic index
      const extrinsicEvents = allEvents.filter(
        ({ phase }) => phase.isApplyExtrinsic && phase.asApplyExtrinsic.eq(index)
      );

      // Get data from ethereum.Executed and balances.Withdraw events
      extrinsicEvents.forEach(({ event }) => {
        if (event.section === 'ethereum' && event.method === 'Executed') {
          from = event.data[0].toString(); // Sender address
          contractAddress = event.data[1].toString(); // New contract address (if applicable)
          transactionHash = event.data[2].toString(); // Transaction hash
          to = contractAddress ? 'Contract Creation' : ''; // Indicates contract creation if applicable
        }

        // Retrieve gas fee from balances.Withdraw with 18 decimal precision
        if (event.section === 'balances' && event.method === 'Withdraw') {
          const rawGasFee = event.data[1].toString();
          gasFee = (parseFloat(rawGasFee) / 1e18).toFixed(18); // Convert to 18 decimal precision
        }

        // Retrieve transfer amount from balances.Transfer with 18 decimal precision
        if (event.section === 'balances' && event.method === 'Transfer') {
          const rawAmount = event.data[2].toString();
          amount = (parseFloat(rawAmount) / 1e18).toFixed(18); // Convert to 18 decimal precision
        }
      });

      // Add transaction details if it's from ethereum.Executed
      if (from && transactionHash) {
        transactionsData.push({
          transactionHash,
          blockNumber,
          timestamp,
          from,
          to: contractAddress || to,
          gasFee,
          amount,
        });
      }
    });

    return res.status(200).json({
      status: 200,
      success: true,
      message: "Block details found",
      block: transactionsData,
    });
  } catch (error) {
    console.error('Error fetching transaction details and block data:', error);
    return res.status(500).json({
      status: 500,
      success: false,
      message: 'Internal Server Error',
    });
  }
};

module.exports = {
  getLast10Transactions,
  getTransactionDetailsByHash,
  getTransactionDetailsByAddress,
  getBalance,
  fetchTransactionData,
  transactionDetailsEVM
};