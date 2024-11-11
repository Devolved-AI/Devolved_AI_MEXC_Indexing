const { loadCompilerVersion, compileContract } = require('@libs/solcCompiler');
const { stripMetadata, matchContractBytecode } = require('@utils/bytecodeUtils');
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
 * @returns {Object} - Verification results including contract details and S3 file URL.
 */
async function verifyContract(contractAddress, compilerVersion, solidityFile, types, values, libraryAddress) {
    try {
        // Upload the Solidity file to S3 and retrieve the file URL
        console.log("Uploading Solidity file to S3...");
        const s3FileUrl = await uploadFileToS3(solidityFile.path, solidityFile.filename);
        console.log(`File uploaded to S3 successfully. URL: ${s3FileUrl}`);

        // Retrieve the deployed bytecode from the blockchain
        console.log(`Fetching deployed bytecode for contract at address: ${contractAddress}`);
        const deployedBytecode = await provider.getCode(contractAddress);
        console.log("Deployed Bytecode:", deployedBytecode);

        // Read the Solidity source code from the uploaded file
        console.log("Reading Solidity source code from file...");
        const sourceCode = fs.readFileSync(solidityFile.path, 'utf8');

        // Load the specified Solidity compiler version
        console.log(`Loading Solidity compiler version: ${compilerVersion}`);
        const solcSnapshot = await loadCompilerVersion(compilerVersion);

        // Compile the Solidity contract using the loaded compiler
        console.log("Compiling Solidity contract...");
        const compilationResult = compileContract(solcSnapshot, sourceCode);

        // Check for any compilation errors and throw an error if found
        if (compilationResult.errors) {
            const errorMessage = compilationResult.errors.map(err => err.formattedMessage).join(', ');
            console.error("Compilation errors:", errorMessage);
            throw new Error(errorMessage);
        }

        // Extract contract data from the compilation result
        const contractKey = Object.keys(compilationResult.contracts['Contract.sol'])[0];
        const contractData = compilationResult.contracts['Contract.sol'][contractKey];
        console.log("Contract compiled successfully:", contractKey);

        // Construct ABI, Bytecode, and handle constructor and library replacements
        const abi = contractData.abi;
        let generatedBytecode = contractData.evm.deployedBytecode.object;
        if (types && values) {
            const abiCoder = new AbiCoder();
            const encodedParams = abiCoder.encode(types.split(','), values.split(','));
            generatedBytecode += encodedParams.slice(2);
        }
        if (libraryAddress) {
            const cleanLibraryAddress = libraryAddress.slice(2);
            const placeholderPattern = /__\$[a-fA-F0-9]{34}\$__/g;
            generatedBytecode = generatedBytecode.replace(placeholderPattern, cleanLibraryAddress);
        }

        // Bytecode comparison
        const { isMatch, strippedGeneratedBytecode, strippedDeployedBytecode } = matchContractBytecode(generatedBytecode, deployedBytecode);
        
        return {
            contractName: contractKey,
            contractAddress,
            verificationStatus: isMatch ? "Contract verified successfully!" : "Verification failed: Bytecode mismatch.",
            s3FileUrl,
            abi,
            deployedBytecode,
            generatedBytecode,
            strippedDeployedBytecode,
            strippedGeneratedBytecode,
            sourceCode,
            libraryAddress: libraryAddress || "No library linked",

        };

        // Strip metadata from both generated and deployed bytecode for comparison
        // console.log("Stripping metadata from compiled and deployed bytecode...");
        // const strippedGeneratedBytecode = stripMetadata(contractData.evm.deployedBytecode.object);
        // const strippedDeployedBytecode = stripMetadata(deployedBytecode);

        // // Check if the compiled bytecode matches the deployed bytecode
        // const isMatch = strippedGeneratedBytecode === strippedDeployedBytecode;
        // console.log(isMatch ? "Bytecode match found! Contract verified successfully." : "Bytecode mismatch. Verification failed.");

        // // Return the verification result and contract details
        // return {
        //     contractName,
        //     compilerVersion,
        //     sourceCode,
        //     abi: contractData.abi,
        //     creationCode: contractData.evm.deployedBytecode.object,
        //     verificationStatus: isMatch ? "Contract verified successfully!" : "Verification failed: Bytecode mismatch.",
        //     fileUrl: s3FileUrl,
        // };

    } catch (error) {
        console.error("Error during contract verification:", error.message);
        throw error;
    }
}

module.exports = { verifyContract };
