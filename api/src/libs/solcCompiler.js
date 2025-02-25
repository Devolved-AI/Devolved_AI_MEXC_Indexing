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
    runsOptimizer,
    language,       // dynamic language (e.g., "Solidity")
    fileName        // dynamic file name (e.g., "test1.sol")
) {
    const input = {
        language: 'Solidity',
        sources: { [fileName]: { content: sourceCode } },
        settings: {
            optimizer: { 
                enabled: Boolean(sourceCodeOptimized),
                runs: Number.isInteger(runsOptimizer) && runsOptimizer >= 0 ? runsOptimizer : 200
            },
            evmVersion: evmVersionToTarget,
            outputSelection: { '*': { '*': [ 'abi', 'evm.deployedBytecode.object' ] } }
        },
    };
    return JSON.parse(solcSnapshot.compile(JSON.stringify(input)));
}

module.exports = { loadCompilerVersion, compileContract };
