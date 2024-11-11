const solc = require('solc');

function loadCompilerVersion(version) {
    return new Promise((resolve, reject) => {
        solc.loadRemoteVersion(version, (err, solcSnapshot) => {
            if (err) return reject(new Error(`Error loading compiler version: ${err.message}`));
            resolve(solcSnapshot);
        });
    });
}

function compileContract(solcSnapshot, sourceCode) {
    const input = {
        language: 'Solidity',
        sources: { 'Contract.sol': { content: sourceCode } },
        settings: {
            optimizer: { enabled: true, runs: 200 },
            evmVersion: 'shanghai',
            outputSelection: { '*': { '*': [ 'abi', 'evm.deployedBytecode.object' ] } },
            // metadata: { useLiteralContent: true },
        },
    };
    return JSON.parse(solcSnapshot.compile(JSON.stringify(input)));
}

module.exports = { loadCompilerVersion, compileContract };
