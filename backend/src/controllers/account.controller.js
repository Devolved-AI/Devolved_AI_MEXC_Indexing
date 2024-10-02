const { ApiPromise, WsProvider } = require( '@polkadot/api' );
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

// Function to get the account balance from Redis or from the blockchain
const getAddressBalance = async ( req, res ) => {
    // Extract address from request body
    const { address } = req.body;

    // If address is not provided, return a 400 error
    if ( !address ) {
        return res.status( 400 ).json( {
            message: 'Address is required',
        } );
    }

    try {
        // Initialize Redis client
        await initRedis();

        // Check if the address exists in Redis
        const addressExists = await redisClient.exists( `account:${address}` );
        if ( addressExists ) {
            // Fetch the balance from Redis
            const accountData = await redisClient.hGetAll( `account:${address}` );

            // If Redis contains the data, return the balance
            if ( accountData && accountData.balance ) {
                return res.status( 200 ).json( {
                    address,
                    balance: accountData.balance,
                    message: `Successfully retrieved balance for address "${address}" from Redis`,
                } );
            }
        }

        // If address does not exist in Redis, fetch the balance from the blockchain
        const wsProvider = new WsProvider( process.env.ARGOCHAIN_RPC_URL ); // Replace with your blockchain's RPC URL
        const api = await ApiPromise.create( { provider: wsProvider } );

        // Fetch the account balance from the blockchain
        // @ts-ignore
        const { data: { free: balance } } = await api.query.system.account( address );

        // Store the balance in Redis for future requests
        await redisClient.hSet( `account:${address}`, { balance: balance.toString() } );
        console.log( `Balance for address ${address} cached in Redis.` );

        // Return the balance from the blockchain
        return res.status( 200 ).json( {
            address,
            balance: balance.toString(),
            message: `Successfully retrieved balance for address "${address}" from the blockchain`,
        } );
    } catch ( error ) {
        console.error( `Error retrieving balance for address "${address}":`, error.message );
        return res.status( 500 ).json( {
            message: 'Internal server error',
            error: error.message,
        } );
    }
};

module.exports = {
    getAddressBalance,
};
