const { ApiPromise, WsProvider } = require('@polkadot/api');
require('dotenv').config();

// Initialize WebSocket provider for the Substrate node
const wsProvider = new WsProvider('wss://test-rpc.devolvedai.com');

async function getBlockData(blockNumber) {
    try {
        // Initialize API
        const api = await ApiPromise.create({ provider: wsProvider });

        // Get the block hash for the given block number
        const blockHash = await api.rpc.chain.getBlockHash(blockNumber);

        // Fetch the block data using the block hash
        const signedBlock = await api.rpc.chain.getBlock(blockHash);
        const blockHeader = signedBlock.block.header;
        const blockHashHex = blockHeader.hash.toHex();
        const parentHash = blockHeader.parentHash.toHex();
        const stateRoot = blockHeader.stateRoot.toHex();
        const extrinsicsRoot = blockHeader.extrinsicsRoot.toHex();
        const blockNum = blockHeader.number.toNumber();

        // Fetch the timestamp from extrinsics
        let timestamp;
        for (const extrinsic of signedBlock.block.extrinsics) {
            const { method: { method, section }, args } = extrinsic;
            if (section === 'timestamp' && method === 'set') {
                timestamp = new Date(parseInt(args[0].toString(), 10));
                break;
            }
        }

        if (!timestamp) {
            timestamp = new Date(); // Default to current time if no timestamp is found
        }

        // Get all events related to this block
        const allEvents = await api.query.system.events.at(blockHash);

        // Process all extrinsics and link the events
        const extrinsics = signedBlock.block.extrinsics.map((extrinsic, index) => {
            const { method: { method, section }, args } = extrinsic;
            const extrinsicHash = extrinsic.hash.toHex(); // Get the hash of the extrinsic
            const extrinsicEvents = allEvents
                .filter(({ phase }) => phase.isApplyExtrinsic && phase.asApplyExtrinsic.eq(index))
                .map(({ event }) => {
                    return {
                        section: event.section,
                        method: event.method,
                        data: event.data.map(d => d.toString())
                    };
                });

            return {
                extrinsicIndex: index,
                isSigned: extrinsic.isSigned,
                method: `${section}.${method}`,
                args: args.map(arg => arg.toString()),
                signer: extrinsic.isSigned ? extrinsic.signer.toString() : null,
                events: extrinsicEvents,
                hash: extrinsicHash // Include the hash in the output
            };
        });

        // Return the full block data along with all extrinsics
        const blockData = {
            blockNumber: blockNum,
            blockHash: blockHashHex,
            parentHash: parentHash,
            stateRoot: stateRoot,
            extrinsicsRoot: extrinsicsRoot,
            timestamp: timestamp.toISOString(),
            extrinsics: extrinsics,
            events: allEvents.map(({ event }) => {
                return {
                    section: event.section,
                    method: event.method,
                    data: event.data.map(d => d.toString())
                };
            })
        };

        return blockData;

    } catch (error) {
        console.error(`Error fetching block data for block number ${blockNumber}:`, error);
        throw error;
    }
}

// Example usage
getBlockData(314626).then((blockData) => {
    console.log('Block Data:', JSON.stringify(blockData, null, 2));
    blockData.extrinsics.forEach((extrinsic) => {
        console.log(`Transaction Hash for extrinsic index ${extrinsic.extrinsicIndex}: ${extrinsic.hash}`);
    });
}).catch(error => {
    console.error('Error:', error);
});
