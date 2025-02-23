const solc = require('solc');

function loadCompilerVersion(version) {
    return new Promise((resolve, reject) => {
        solc.loadRemoteVersion(version, (err, solcSnapshot) => {
            if (err) return reject(new Error(`Error loading compiler version: ${err.message}`));
            resolve(solcSnapshot);
        });
    });
}

function compileContract(
    solcSnapshot, 
    sourceCode, 
    evmVersionToTarget,
    sourceCodeOptimized, 
    runsOptimizer
) {
    const input = {
        language: 'Solidity',
        sources: { 'Contract.sol': { content: sourceCode } },
        settings: {
            optimizer: { 
                enabled: Boolean(sourceCodeOptimized), // Convert to boolean
                runs: Number.isInteger(runsOptimizer) && runsOptimizer >= 0 ? runsOptimizer : 200 // Default to 200 if invalid 
            },
            evmVersion: evmVersionToTarget,
            outputSelection: { '*': { '*': [ 'abi', 'evm.deployedBytecode.object' ] } }
        },
    };
    return JSON.parse(solcSnapshot.compile(JSON.stringify(input)));
}

module.exports = { loadCompilerVersion, compileContract };
