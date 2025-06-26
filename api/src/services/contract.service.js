const { loadCompilerVersion, compileContract } = require("@libs/solcCompiler");
const { stripMetadata } = require("@utils/bytecodeUtils");
const { uploadFileToS3 } = require("@libs/s3Upload");
const fs = require("fs");
const path = require("path");
const { ethers, AbiCoder } = require("ethers");

// Initialize Ethereum provider using your RPC URL
const provider = new ethers.JsonRpcProvider(process.env.ARGOCHAIN_RPC_URL);

/**
 * Verifies a deployed smart contract by comparing its on‐chain bytecode 
 * with the locally compiled bytecode from the provided Solidity file.
 * Automatically selects the contract to verify (by choosing the one with a constructor).
 *
 * @param {string} contractAddress - Address of the deployed contract.
 * @param {string} compilerVersion - Solidity compiler version.
 * @param {Object} solidityFile - The uploaded Solidity (.sol) file object.
 * @param {string} evmVersionToTarget - The target EVM version.
 * @param {boolean} sourceCodeOptimized - Whether the source code is optimized.
 * @param {number} runsOptimizer - Optimizer runs.
 * @param {Array} types - Constructor parameter types.
 * @param {Array} values - Constructor parameter values.
 * @param {string|Array} libraryAddress - Library addresses (if any).
 * @param {string|Array} libraryName - Library names (if any).
 *
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
  libraryName
) {
  try {
    // Upload the Solidity file to S3 and get its URL
    console.log("Uploading Solidity file to S3...");
    const s3FileUrl = await uploadFileToS3(solidityFile.path, solidityFile.filename);
    console.log(`File uploaded to S3 successfully. URL: ${s3FileUrl}`);

    // Retrieve the deployed bytecode from the blockchain
    console.log(`Fetching deployed bytecode for contract at address: ${contractAddress}`);
    const deployedBytecode = await provider.getCode(contractAddress);
    console.log("Deployed Bytecode:", deployedBytecode);
    
    // Log the block number where the deployed bytecode was retrieved
    const currentBlockNumber = await provider.getBlockNumber();
    console.log(`Verification performed at block number: ${currentBlockNumber}`);
    
    if (!deployedBytecode || deployedBytecode === "0x") {
      throw new Error("Deployed bytecode not found or contract address is incorrect.");
    }

    // Read the Solidity source code from the uploaded file
    console.log("Reading Solidity source code from file...");
    const sourceCode = fs.readFileSync(solidityFile.path, "utf8");

    // Load the specified Solidity compiler version
    console.log(`Loading Solidity compiler version: ${compilerVersion}`);
    const solcSnapshot = await loadCompilerVersion(compilerVersion);

    // Use the file's original name as the key in the compilation output
    const fileKey = solidityFile.originalname;

    // Compile the Solidity contract
    console.log("Compiling Solidity contract...");
    const compilationResult = compileContract(
      solcSnapshot,
      sourceCode,
      evmVersionToTarget,
      sourceCodeOptimized,
      runsOptimizer,
      fileKey
    );

    // Check for any compilation errors
    if (compilationResult.errors) {
      const errorMessage = compilationResult.errors
        .map((err) => err.formattedMessage)
        .join(", ");
      console.error("Compilation errors:", errorMessage);
      throw new Error(errorMessage);
    }

    // Extract compiled contracts from the file key
    const compiledContracts = compilationResult.contracts[fileKey];
    const contractNames = Object.keys(compiledContracts);
    if (contractNames.length === 0) {
      throw new Error("No contracts found in the compiled output.");
    }

    // Auto-detect the contract name by choosing the contract that has a constructor
    let contractNameToUse = contractNames.find(name => {
      const contractABI = compiledContracts[name].abi;
      return contractABI.some(item => item.type === "constructor");
    });
    if (!contractNameToUse) {
      // fallback: default to the first contract if none with a constructor is found
      contractNameToUse = contractNames[0];
      console.warn(`No contract with constructor found. Defaulting to ${contractNameToUse}.`);
    }
    const contractData = compiledContracts[contractNameToUse];
    console.log("Contract compiled successfully:", contractNameToUse);

    if (!contractData || !contractData.abi || !contractData.evm || !contractData.evm.deployedBytecode) {
      console.error("Compiled output is missing required fields (ABI or bytecode).");
      throw new Error("ABI or bytecode not found in the compiled output.");
    }

    console.log("Contract ABI:", contractData.abi);
    console.log("Compiled Bytecode:", contractData.evm.deployedBytecode.object);

    // Prepare the generated bytecode - FIXED: Use deployed bytecode for comparison
    const abi = contractData.abi;
    let generatedBytecode = contractData.evm.deployedBytecode.object;
    
    // Handle constructor arguments - FIXED: Only append if there are constructor args
    if (types && values && types.length > 0 && values.length > 0) {
      console.log("Encoding constructor arguments:", { types, values });
      const abiCoder = new AbiCoder();
      const encodedParams = abiCoder.encode(types, values);
      generatedBytecode += encodedParams.slice(2);
      console.log("Generated bytecode with constructor args:", generatedBytecode);
    }
    
    // Handle library addresses - FIXED: Proper library name matching
    if (libraryAddress && libraryName) {
      console.log("Processing library addresses:", { libraryName, libraryAddress });
      const libraryNames = Array.isArray(libraryName) ? libraryName : [libraryName];
      const libraryAddresses = Array.isArray(libraryAddress) ? libraryAddress : [libraryAddress];
      
      libraryNames.forEach((name, index) => {
        if (index < libraryAddresses.length) {
          const placeholder = `__$${name}__`;
          const address = libraryAddresses[index].slice(2);
          const placeholderRegex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
          generatedBytecode = generatedBytecode.replace(placeholderRegex, address);
          console.log(`Replaced ${placeholder} with ${address}`);
        }
      });
    }

    // Strip metadata from both bytecodes before comparison
    const strippedGeneratedBytecode = stripMetadata(generatedBytecode);
    const strippedDeployedBytecode = stripMetadata(deployedBytecode);
    
    console.log("Stripped generated bytecode:", strippedGeneratedBytecode);
    console.log("Stripped deployed bytecode:", strippedDeployedBytecode);
    
    const isMatch = strippedGeneratedBytecode === strippedDeployedBytecode;
    
    console.log("Bytecode match result:", isMatch);

    return {
      contractName: contractNameToUse,
      contractAddress,
      compilerVersion,
      verificationStatus: isMatch
        ? "Contract verified successfully."
        : "Verification failed: Bytecode mismatch.",
      verified: isMatch,
      s3FileUrl,
      abi,
      deployedBytecode,
      generatedBytecode,
      strippedDeployedBytecode,
      strippedGeneratedBytecode,
      sourceCode,
      libraryAddress: libraryAddress || "No library linked",
      libraryName: libraryName || "No library name provided",
    };
  } catch (error) {
    console.error("Error during contract verification:", error.message);
    throw error;
  }
}

module.exports = { verifyContract };