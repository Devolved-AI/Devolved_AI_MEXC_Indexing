const { query } = require('@config/connectDB');
const { ApiPromise, WsProvider } = require( '@polkadot/api' );

// Function to get the last 10 transactions from the database
const getLast10Transactions = async (req, res) => {
  try {
    // SQL query to get the last 10 transactions along with their block timestamp
    const result = await query(
      `SELECT
        tx.tx_hash,
        tx.from_address,
        tx.to_address,
        tx.amount,
        tx.fee,
        tx.gas_fee,
        b.timestamp
      FROM transactions tx
      JOIN blocks b ON tx.block_number = b.block_number
      ORDER BY b.block_number DESC
      LIMIT 10`
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No transactions found',
      });
    }

    // Format and return the transactions
    return res.status(200).json({
      success: true,
      transactions: result.rows,
    });
  } catch (error) {
    console.error('Error retrieving transactions from PostgreSQL:', error.message);
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
};

const getTransactionDetailsByHash = async (req, res) => {
  const { tx_hash } = req.body;

  if (!tx_hash) {
    return res.status(400).json({
      success: false,
      message: 'tx_hash is required',
    });
  }

  try {
    // SQL query to get the transaction details along with the block number and timestamp
    const result = await query(
      `SELECT 
        tx.tx_hash, 
        tx.block_number,  -- Include block number
        tx.from_address, 
        tx.to_address, 
        tx.amount, 
        tx.fee, 
        tx.gas_fee, 
        tx.method,
        tx.events,
        b.timestamp  -- Include block timestamp
      FROM transactions tx
      JOIN blocks b ON tx.block_number = b.block_number
      WHERE tx.tx_hash = $1`,
      [tx_hash]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No transaction found with tx_hash: ${tx_hash}`,
      });
    }

    // Return the transaction details including the block timestamp
    return res.status(200).json({
      success: true,
      transaction: {
        ...result.rows[0], // Transaction details
        timestamp: result.rows[0].timestamp // Include the block timestamp
      }
    });
  } catch (error) {
    console.error('Error retrieving transaction by tx_hash from PostgreSQL:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

const getTransactionDetailsByAddress = async (req, res) => {
  try {
    // Extract the address from the request body
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'Address is required.',
      });
    }

    // SQL query to retrieve transactions where the given address is either from_address or to_address
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
        b.timestamp  -- Include block timestamp
      FROM transactions tx
      JOIN blocks b ON tx.block_number = b.block_number
      WHERE tx.from_address = $1 OR tx.to_address = $1`,
      [address]
    );

    // If no transactions are found
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No transactions found for address ${address}.`,
      });
    }

    // Return the matched transactions, including the block timestamp
    return res.status(200).json({
      success: true,
      message: `Transactions retrieved for address ${address}.`,
      transactions: result.rows.map(row => ({
        ...row,
        timestamp: row.timestamp, // Include timestamp in the response
      })),
    });

  } catch (error) {
    console.error(`Error retrieving transaction data for address "${req.body.address}":`, error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: error.message,
    });
  }
};

// Function to get the account balance from Redis or from the blockchain
const getBalance = async ( req, res ) => {
  // Extract address from request body
  const { address } = req.body;

  // If address is not provided, return a 400 error
  if ( !address ) {
      return res.status( 400 ).json( {
          success: false,
          message: 'Address is required',
      } );
  }

  try {
      // If address does not exist in Redis, fetch the balance from the blockchain
      const wsProvider = new WsProvider( process.env.ARGOCHAIN_RPC_URL ); // Replace with your blockchain's RPC URL
      const api = await ApiPromise.create( { provider: wsProvider } );

      // @ts-ignore
      const { data: { free: balance } } = await api.query.system.account( address );

      // Return the balance from the blockchain
      return res.status( 200 ).json( {
          success: true,
          address,
          balance: balance.toString(),
          message: `Successfully retrieved balance for address "${address}" from the blockchain`,
      } );
  } catch ( error ) {
      console.error( `Error retrieving balance for address "${address}":`, error.message );
      return res.status( 500 ).json( {
          success: false,
          message: 'Internal server error',
          error: error.message,
      } );
  }
};

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

module.exports = {
  getLast10Transactions,
  getTransactionDetailsByHash,
  getTransactionDetailsByAddress,
  getBalance,
  fetchTransactionData
};

