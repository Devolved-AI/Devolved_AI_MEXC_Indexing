const { loadCompilerVersion, compileContract } = require('@libs/solcCompiler');
const { stripMetadata } = require('@utils/bytecodeUtils');
const { uploadFileToS3 } = require('@libs/s3Upload');
const fs = require('fs');
const { ethers, AbiCoder } = require("ethers");

// Initialize Ethereum provider using the specified RPC URL
const provider = new ethers.WebSocketProvider(process.env.ARGOCHAIN_RPC_URL);

/**
 * Verifies a deployed smart contract by comparing its on-chain bytecode 
 * with the locally compiled bytecode from the provided Solidity file.
 * 
 * @param {string} contractAddress - Address of the deployed contract on the blockchain.
 * @param {string} compilerVersion - Version of the Solidity compiler to use.
 * @param {Object} solidityFile - The uploaded Solidity (.sol) file object.
 * @param {string} evmVersionToTarget - The target EVM version.
 * @param {boolean} sourceCodeOptimized - Whether the source code is optimized.
 * @param {number} runsOptimizer - Optimizer runs.
 * @param {Array} types - Constructor parameter types.
 * @param {Array} values - Constructor parameter values.
 * @param {string|Array} libraryAddress - Library address (or JSON string/array).
 * @param {string} language - Programming language (e.g., "Solidity").
 * @param {string} contractName - Name of the contract to verify (e.g., "HelloWorld").
 * @returns {Object} - Verification results including contract details and S3 file URL.
 */
async function verifyContract(
    contractAddress, 
    compilerVersion, 
    solidityFile, 
    evmVersionToTarget, 
    sourceCodeOptimized, 
    runsOptimizer,
    types, 
    values, 
    libraryAddress,
    language,
    contractName
) {
    try {
        // Upload the Solidity file to S3 and retrieve the file URL
        console.log("Uploading Solidity file to S3...");
        const s3FileUrl = await uploadFileToS3(solidityFile.path, solidityFile.filename);
        console.log(`File uploaded to S3 successfully. URL: ${s3FileUrl}`);

        // Retrieve the deployed bytecode from the blockchain
        console.log(`Fetching deployed bytecode for contract at address: ${contractAddress}`);
        const deployedBytecode = await provider.getCode(contractAddress);
        console.log("Deployed Bytecode:", deployedBytecode);
        if (!deployedBytecode || deployedBytecode === "0x") {
            throw new Error("Deployed bytecode not found or contract address is incorrect.");
        }

        // Read the Solidity source code from the uploaded file
        console.log("Reading Solidity source code from file...");
        const sourceCode = fs.readFileSync(solidityFile.path, 'utf8');

        // Load the specified Solidity compiler version
        console.log(`Loading Solidity compiler version: ${compilerVersion}`);
        const solcSnapshot = await loadCompilerVersion(compilerVersion);

        // Use the uploaded file's original name for the source key
        const fileKey = solidityFile.originalname;

        // Compile the Solidity contract using the loaded compiler with dynamic language and file name
        console.log("Compiling Solidity contract...");
        const compilationResult = compileContract(
            solcSnapshot, 
            sourceCode, 
            evmVersionToTarget,
            sourceCodeOptimized, 
            runsOptimizer,
            language,
            fileKey
        );

        // Check for any compilation errors and throw an error if found
        if (compilationResult.errors) {
            const errorMessage = compilationResult.errors.map(err => err.formattedMessage).join(', ');
            console.error("Compilation errors:", errorMessage);
            throw new Error(errorMessage);
        }

        // Extract contract data from the compilation result using the provided contractName.
        const compiledContracts = compilationResult.contracts[fileKey];
        if (contractName) {
            if (!compiledContracts[contractName]) {
                throw new Error(`Contract ${contractName} not found in the compiled output.`);
            }
        } else {
            // Optionally, default to the first contract if contractName isn't provided.
            contractName = Object.keys(compiledContracts)[0];
            console.warn(`No contractName provided. Defaulting to ${contractName}.`);
        }
        const contractData = compiledContracts[contractName];
        console.log("Contract compiled successfully:", contractName);

        if (!contractData || !contractData.abi || !contractData.evm || !contractData.evm.deployedBytecode) {
            console.error("Compiled output is missing required fields (ABI or bytecode).");
            throw new Error("ABI or bytecode not found in the compiled output.");
        }

        // Log the extracted ABI and bytecode for verification
        console.log("Contract ABI:", contractData.abi);
        console.log("Compiled Bytecode:", contractData.evm.deployedBytecode.object);

        // Construct ABI, Bytecode, and handle constructor and library replacements
        const abi = contractData.abi;
        let generatedBytecode = contractData.evm.deployedBytecode.object;
        if (types && values) {
            const abiCoder = new AbiCoder();
            const encodedParams = abiCoder.encode(types, values);
            generatedBytecode += encodedParams.slice(2);
        }
        if (libraryAddress) {
            // If libraryAddress is an array, you might need to iterate over it
            if (Array.isArray(libraryAddress)) {
                libraryAddress.forEach((libAddr) => {
                    const cleanLibraryAddress = libAddr.slice(2);
                    const placeholderPattern = /__\$[a-fA-F0-9]{34}\$__/g;
                    generatedBytecode = generatedBytecode.replace(placeholderPattern, cleanLibraryAddress);
                });
            } else {
                const cleanLibraryAddress = libraryAddress.slice(2);
                const placeholderPattern = /__\$[a-fA-F0-9]{34}\$__/g;
                generatedBytecode = generatedBytecode.replace(placeholderPattern, cleanLibraryAddress);
            }
        }

        // Use stripMetadata to remove compiler metadata from both bytecodes before comparison
        const strippedGeneratedBytecode = stripMetadata(generatedBytecode);
        const strippedDeployedBytecode = stripMetadata(deployedBytecode);
        const isMatch = strippedGeneratedBytecode === strippedDeployedBytecode;
        
        return {
            contractName,
            contractAddress,
            compilerVersion,
            verificationStatus: isMatch ? "Contract verified successfully." : "Verification failed: Bytecode mismatch.",
            verified: isMatch ? true : false,
            s3FileUrl,
            abi,
            deployedBytecode,
            generatedBytecode,
            strippedDeployedBytecode,
            strippedGeneratedBytecode,
            sourceCode,
            libraryAddress: libraryAddress || "No library linked",
        };

    } catch (error) {
        console.error("Error during contract verification:", error.message);
        throw error;
    } finally {
        // Delete the file from the local uploads folder
        fs.unlink(solidityFile.path, (err) => {
            if (err) {
                console.error("Error deleting file:", err);
            } else {
                console.log("File successfully deleted from uploads folder.");
            }
        });
    }
}

module.exports = { verifyContract };
