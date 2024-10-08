const { ApiPromise, WsProvider } = require('@polkadot/api');
const initializeRedisClient = require( '@config/connectCache' );
let redisClient;

// Initialize the Redis client
const initRedis = async () => {
  if ( !redisClient || !redisClient.isOpen ) {
    try {
      redisClient = await initializeRedisClient();
      console.log( '✓ Redis is connected successfully' );
    } catch ( error ) {
      console.error( 'Error connecting to Redis:', error.message );
      throw new Error( 'Redis connection failed' );
    }
  }
};
// Function to get the latest 10 transactions from Redis server
const getLast10Transactions = async ( req, res ) => {
  try {
    // Initialize Redis client
    await initRedis();

    // Check if the 'transaction' sorted set exists in Redis
    const transactionsExist = await redisClient.exists( 'transaction' );
    if ( !transactionsExist ) {
      return res.status( 404 ).json( {
        message: 'No transactions found.'
      } );
    }

    // Retrieve the last 10 transactions from the sorted set 'transaction'
    const transactionKeys = await redisClient.zRange( 'transaction', 0, 9, { REV: true } );

    // If no transactions are found in the set, return a 404
    if ( !transactionKeys.length ) {
      return res.status( 404 ).json( {
        message: 'No transactions available.'
      } );
    }

    // Fetch transaction details for each transaction key
    const transactions = await Promise.all(
      transactionKeys.map( async ( key ) => {
        const transaction = await redisClient.hGetAll( `transaction:${key}` );

        // If transaction details are not found, handle it
        if ( !transaction || Object.keys( transaction ).length === 0 ) {
          console.warn( `Transaction details for key "${key}" not found in Redis.` );
        }

        return transaction;
      } )
    );

    // Filter out any undefined or empty transactions that were not found
    const validTransactions = transactions.filter( transaction => Object.keys( transaction ).length !== 0 );

    if ( !validTransactions.length ) {
      return res.status( 404 ).json( {
        message: 'No valid transactions found.'
      } );
    }

    return res.status( 200 ).json( {
      transactions: validTransactions,
      message: 'Transactions retrieved successfully.'
    } );

  } catch ( error ) {
    console.error( 'Error:', error.message );
    return res.status( 500 ).json( {
      message: 'Server error.',
      error: error.message
    } );
  }
};


// Function to get specific transaction details by address
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

    // Initialize Redis client if not already initialized
    await initRedis();

    // Get all transaction keys in Redis
    const transactionKeys = await redisClient.keys('transaction:*');

    if (!transactionKeys || transactionKeys.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No transactions found in Redis.',
      });
    }

    // Filter transactions based on the given address
    const transactions = [];

    for (const txKey of transactionKeys) {
      const transactionData = await redisClient.hGetAll(txKey);

      // Check if the address matches either the from_address or to_address
      if (transactionData.from_address === address || transactionData.to_address === address) {
        transactions.push(transactionData);
      }
    }

    // If no matching transactions are found
    if (transactions.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No transactions found for address ${address}.`,
      });
    }

    // Return the matched transactions
    return res.status(200).json({
      success: true,
      message: `Transactions retrieved for address ${address}.`,
      data: transactions,
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

// Function to get specific transaction details by tx_hash
const getTransactionByHash = async (req, res) => {
  try {
    // Extract the tx_hash from the request body
    const { tx_hash } = req.body;

    if (!tx_hash) {
      return res.status(400).json({
        success: false,
        message: 'Transaction hash is required.',
      });
    }

    // Initialize Redis client if not already initialized
    await initRedis();

    // Define the Redis key for the transaction
    const transactionKey = `transaction:${tx_hash}`;

    // Fetch transaction data from Redis
    const transactionData = await redisClient.hGetAll(transactionKey);

    // Check if the transaction exists
    if (!transactionData || Object.keys(transactionData).length === 0) {
      return res.status(404).json({
        success: false,
        message: `Transaction with hash ${tx_hash} not found in Redis.`,
      });
    }

    // Parse the `events` field if it exists (assuming events are stored as a JSON string)
    if (transactionData.events) {
      try {
        transactionData.events = JSON.parse(transactionData.events); // Convert the JSON string back to an array of objects
      } catch (err) {
        console.error(`Error parsing events for transaction ${tx_hash}:`, err.message);
        return res.status(500).json({
          success: false,
          message: 'Error parsing transaction events.',
          error: err.message,
        });
      }
    }

    // Return the transaction data as a JSON response
    return res.status(200).json({
      success: true,
      message: `Transaction details retrieved for tx_hash ${tx_hash}.`,
      data: transactionData,
    });

  } catch (error) {
    console.error(`Error retrieving transaction data for tx_hash "${req.body.tx_hash}":`, error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: error.message,
    });
  }
};

// Controller for fetching the balance without updating the database
const getBalance = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed!"
    });
  }

  try {
    const { address } = req.body;

    // Validate if the address is provided
    if (!address) {
      return res.status(400).json({
        success: false,
        message: "Address is required"
      });
    }

    // Connect to the Polkadot API provider
    const provider = new WsProvider(process.env.ARGOCHAIN_RPC_URL);
    const api = await ApiPromise.create({ provider });

    await api.isReady;  // Ensure the API is ready

    // Fetch the account balance
    const { data: balance } = await api.query.system.account(address);
    const balanceValue = parseFloat(balance.free.toString()) / Math.pow(10, 18);

    // Format balance to 4 decimal places and add commas
    const balanceFormatted = balanceValue.toLocaleString(undefined, {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    });

    // Return the balance without updating it in the database
    return res.status(200).json({
      success: true,
      balance: balanceFormatted
    });

  } catch (error) {
    console.error("Error fetching balance:", error);
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
      errorMessage = `Error: ${error.message}`;
    }
    return res.status(500).json({
      success: false,
      message: errorMessage
    });
  }
};

module.exports = {
  getLast10Transactions,
  getTransactionDetailsByAddress,
  getTransactionByHash,
  getBalance
};
