const { query } = require('@config/connectDB');
const { ApiPromise, WsProvider } = require('@polkadot/api');
require('dotenv').config();

// Initialize WebSocket provider
const wsProvider = new WsProvider(process.env.ARGOCHAIN_RPC_URL);

const initializeApi = async () => {
  try {
    const api = await ApiPromise.create({ provider: wsProvider });
    return api;
  } catch (error) {
    console.error("Failed to connect to RPC:", error);
    throw error;
  }
};
// Function to get the last 10 blocks from PostgreSQL
const getLast10Blocks = async (req, res) => {
  try {
    // SQL query to get the last 10 blocks, ordered by block number in descending order
    const result = await query(
      'SELECT block_number, block_hash, parent_hash, state_root, extrinsics_root, timestamp FROM blocks ORDER BY block_number DESC LIMIT 10'
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No blocks found',
      });
    }

    return res.status(200).json({
      success: true,
      blocks: result.rows,
    });
  } catch (error) {
    console.error('Error retrieving blocks from PostgreSQL:', error.message);
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// Function to get block details by blockNum from PostgreSQL
const blockDetails = async (req, res) => {
  const { blockNumber } = req.body;

  if (!blockNumber) {
    return res.status(400).json({
      success: false,
      message: 'blockNumber is required',
    });
  }

  try {
    // Query to get the block details by block number
    const blockResult = await query(
      'SELECT block_number, block_hash, parent_hash, state_root, extrinsics_root, timestamp FROM blocks WHERE block_number = $1',
      [blockNumber]
    );

    if (blockResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No block found with block number: ${blockNumber}`,
      });
    }

    // Query to get all transactions associated with the block number
    const transactionsResult = await query(
      'SELECT * FROM transactions WHERE block_number = $1',
      [blockNumber]
    );

    // Return the block details
    return res.status(200).json({
      success: true,
      block: blockResult.rows[0],
      transaction: transactionsResult.rows
    });
  } catch (error) {
    console.error('Error fetching block from PostgreSQL:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

const blockDetailsEVM = async (req, res) => {
  const { blockNumber } = req.body;
  try {
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
      let amount = '0'
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
          transactionHash = event.data[2].toString(); // Transaction hash (your desired hash)
          to = contractAddress ? 'Contract Creation' : ''; // Indicates contract creation if applicable
        }

        // Retrieve gas fee from balances.Withdraw with 18 decimal precision
        if (event.section === 'balances' && event.method === 'Withdraw') {
          const rawGasFee = event.data[1].toString();
          gasFee = (parseFloat(rawGasFee) / 1e18).toFixed(18); // Convert to 18 decimal precision
        }

        if (event.section === 'balances' && event.method === 'Transfer') {
          const rawAmount = event.data[2].toString();
          amount = (parseFloat(rawAmount) / 1e18).toFixed(18); // Convert to 18 decimal precision
        }
      });

      // Add transaction details if it's from ethereum.Executed
      if (from && transactionHash) {
        transactionsData.push({
          transactionHash, // Now using the transaction hash from ethereum.Executed
          blockNumber,
          timestamp,
          from,
          to: contractAddress || to,
          gasFee,
          amount
        });
      }
    });

    return res.status(200).json({
      status: 200,
      success: true,
      message: "Block details found",
      block: transactionsData
    });
  } catch (error) {
    console.error('Error fetching block details:', error);
    return res.status(500).json({
      error: 'Internal Server Error'
    });
  }
};

const transactionDetailsEVM = async (req, res) => {
  const { transactionHash } = req.body;

  if (!transactionHash) {
    return res.status(400).json({
      error: 'transactionHash is required in the request body.'
    });
  }

  try {
    const api = await initializeApi();

    // Retrieve the transaction's block hash using the transaction hash
    const transactionInfo = await api.rpc.chain.getTransactionInfo(transactionHash);
    if (!transactionInfo) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: 'Transaction not found.'
      });
    }

    const blockHash = transactionInfo.blockHash.toHex();
    const blockNumber = transactionInfo.blockNumber.toNumber();
    
    // Fetch the block and its extrinsics
    const signedBlock = await api.rpc.chain.getBlock(blockHash);

    // Get the block timestamp
    const timestampExtrinsic = signedBlock.block.extrinsics.find(
      (extrinsic) => extrinsic.method.section === 'timestamp' && extrinsic.method.method === 'set'
    );
    const timestamp = timestampExtrinsic ? new Date(parseInt(timestampExtrinsic.args[0].toString(), 10)) : null;

    // Fetch all events in the block
    const allEvents = await api.query.system.events.at(blockHash);

    // Collect data specifically for the `transactionHash`
    let from = null;
    let to = null;
    let contractAddress = '';
    let gasFee = '0';

    // Find the specific extrinsic by transaction hash
    const extrinsicIndex = signedBlock.block.extrinsics.findIndex(
      extrinsic => extrinsic.hash.toHex() === transactionHash
    );

    if (extrinsicIndex === -1) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: 'Transaction not found in this block.'
      });
    }

    // Filter events related to this extrinsic index
    const extrinsicEvents = allEvents.filter(
      ({ phase }) => phase.isApplyExtrinsic && phase.asApplyExtrinsic.eq(extrinsicIndex)
    );

    // Get data from ethereum.Executed and balances.Withdraw events
    extrinsicEvents.forEach(({ event }) => {
      if (event.section === 'ethereum' && event.method === 'Executed') {
        from = event.data[0].toString(); // Sender address
        contractAddress = event.data[1].toString(); // New contract address (if applicable)
        to = contractAddress ? 'Contract Creation' : ''; // Indicates contract creation if applicable
      }

      // Retrieve gas fee from balances.Withdraw with 18 decimal precision
      if (event.section === 'balances' && event.method === 'Withdraw') {
        const rawGasFee = event.data[1].toString();
        gasFee = (parseFloat(rawGasFee) / 1e18).toFixed(18); // Convert to 18 decimal precision
      }
    });

    // Construct response
    const transactionData = {
      transactionHash,
      blockNumber,
      timestamp,
      from,
      to: contractAddress || to,
      gasFee,
    };

    return res.status(200).json({
      status: 200,
      success: true,
      message: "Transaction details found",
      transaction: transactionData
    });
  } catch (error) {
    console.error('Error fetching transaction details:', error);
    return res.status(500).json({
      status: 500,
      success: false,
      message: 'Internal Server Error'
    });
  }
};


module.exports = {
  getLast10Blocks,
  blockDetails,
  blockDetailsEVM,
  transactionDetailsEVM
};
