const solc = require('solc');

/**
 * Loads a specific Solidity compiler version
 * @param {string} version - The compiler version to load
 * @returns {Promise<Object>} - The compiler snapshot
 */
function loadCompilerVersion(version) {
    return new Promise((resolve, reject) => {
        solc.loadRemoteVersion(version, (err, solcSnapshot) => {
            if (err) return reject(new Error(`Error loading compiler version: ${err.message}`));
            resolve(solcSnapshot);
        });
    });
}

/**
 * Compiles a Solidity contract with proper settings
 * @param {Object} solcSnapshot - The compiler snapshot
 * @param {string} sourceCode - The Solidity source code
 * @param {string} evmVersionToTarget - The target EVM version
 * @param {boolean} sourceCodeOptimized - Whether optimization is enabled
 * @param {number} runsOptimizer - Number of optimizer runs
 * @param {string} fileName - The file name for compilation
 * @returns {Object} - The compilation result
 */
function compileContract(
    solcSnapshot, 
    sourceCode, 
    evmVersionToTarget,
    sourceCodeOptimized, 
    runsOptimizer,
    fileName
) {
    // Validate EVM version
    const validEVMVersions = [
        'london', 'berlin', 'istanbul', 'petersburg', 'constantinople', 
        'byzantium', 'spuriousDragon', 'tangerineWhistle', 'homestead', 'frontier'
    ];
    const evmVersion = validEVMVersions.includes(evmVersionToTarget) ? evmVersionToTarget : 'london';
    
    // Validate optimizer settings
    const optimized = Boolean(sourceCodeOptimized);
    const runs = optimized ? (Number.isInteger(runsOptimizer) && runsOptimizer > 0 ? runsOptimizer : 200) : 0;
    
    console.log(`Compiling with settings: EVM=${evmVersion}, Optimized=${optimized}, Runs=${runs}`);
    
    const input = {
        language: 'Solidity',
        sources: { 
            [fileName]: { 
                content: sourceCode 
            } 
        },
        settings: {
            optimizer: { 
                enabled: optimized,
                runs: runs
            },
            evmVersion: evmVersion,
            outputSelection: { 
                '*': { 
                    '*': [ 
                        'abi', 
                        'evm.deployedBytecode.object',
                        'evm.bytecode.object',
                        'evm.deployedBytecode.sourceMap',
                        'evm.bytecode.sourceMap'
                    ] 
                } 
            }
        },
    };
    
    try {
        const output = JSON.parse(solcSnapshot.compile(JSON.stringify(input)));
        
        // Check for compilation errors
        if (output.errors) {
            const errors = output.errors.filter(error => error.severity === 'error');
            if (errors.length > 0) {
                const errorMessages = errors.map(err => err.formattedMessage).join('\n');
                throw new Error(`Compilation failed:\n${errorMessages}`);
            }
        }
        
        return output;
    } catch (error) {
        if (error.message.includes('Compilation failed')) {
            throw error;
        }
        throw new Error(`Compilation error: ${error.message}`);
    }
}

module.exports = { loadCompilerVersion, compileContract };