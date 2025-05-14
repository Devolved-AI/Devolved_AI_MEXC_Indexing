const fs = require('fs');
const path = require('path');
const { verifyContract } = require('@services/contract.service');
const ContractVerification = require('@models/contractVerification.model');
const User = require('@models/user.model');
const { verifyToken }= require('@libs/auth/jwt');
const { isValidAddress } = require('@utils/evmUtil');
const hre = require('hardhat');
const os = require('os');
const { v4: uuidv4 } = require('uuid');

/**
 * Controller function to verify a smart contract.
 * Handles file upload, compilation, bytecode comparison, and cleanup.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */

// Regular expression for Ethereum address validation
const contractAddressRegex = /^0x[a-fA-F0-9]{40}$/;

async function verifyContractController(req, res) {
  let flattenedFilePath;
  try {
    // Auth
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') && authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded?.email) return res.status(401).json({ status: 401, success: false, message: 'Invalid token.' });

    const user = await User.findOne({ email: decoded.email });
    if (!user) return res.status(404).json({ status: 404, success: false, message: 'User not found.' });

    // Required fields
    const { walletAddress, contractAddress, compilerVersion, license, types, values,
            deployedBytecodeSourcemap, sourceCodeOptimized, runsOptimizer,
            evmVersionToTarget, constructorArgs, libraryName, libraryAddress } = req.body;

    if (!contractAddress || !compilerVersion || !req.file) {
      return res.status(400).json({ status: 400, success: false, error: 'Contract address, compiler version and Solidity file are required.' });
    }
    if (!contractAddressRegex.test(contractAddress)) {
      return res.status(400).json({ status: 400, success: false, message: 'Invalid contract address format.' });
    }
    if (path.extname(req.file.originalname) !== '.sol') {
      return res.status(400).json({ status: 400, success: false, message: 'Uploaded file must be in .sol format.' });
    }
    if (walletAddress && !isValidAddress(walletAddress)) {
      return res.status(400).json({ status: 400, success: false, message: 'Invalid EVM wallet address.' });
    }

    // Flatten the uploaded Solidity file using Hardhat
    const tempDir = os.tmpdir();
    const flatName = `flattened_${uuidv4()}.sol`;
    flattenedFilePath = path.join(tempDir, flatName);
    // Run Hardhat flatten task
    let flatSource = await hre.run('flatten', { files: [req.file.path] });
    // Ensure SPDX identifier is present at top
    if (!flatSource.trim().startsWith('// SPDX-License-Identifier:')) {
      flatSource = `// SPDX-License-Identifier: MIT\n\n${flatSource}`;
    }
    fs.writeFileSync(flattenedFilePath, flatSource, 'utf8');
    // Override req.file to point to the flattened file
    req.file.path = flattenedFilePath;
    req.file.originalname = flatName;

    // Parse types & values
    let parsedTypes = [], parsedValues = [];
    if (typeof types === 'string' && types.trim()) parsedTypes = JSON.parse(types);
    else if (Array.isArray(types)) parsedTypes = types;
    if (typeof values === 'string' && values.trim()) parsedValues = JSON.parse(values);
    else if (Array.isArray(values)) parsedValues = values;
    if (parsedTypes.length !== parsedValues.length) {
      return res.status(400).json({ status: 400, success: false, message: `Mismatch between types and values: expected ${parsedTypes.length}, got ${parsedValues.length}.` });
    }

    // Normalize optimizer flags
    const optimized = sourceCodeOptimized === true || sourceCodeOptimized === 'true';
    const optimizerRuns = runsOptimizer != null ? Number(runsOptimizer) : 0;
    if (!optimized && optimizerRuns !== 0) {
      return res.status(400).json({ status: 400, success: false, message: 'When sourceCodeOptimized is false, runsOptimizer must be 0.' });
    }
    if (optimized && optimizerRuns <= 0) {
      return res.status(400).json({ status: 400, success: false, message: 'When sourceCodeOptimized is true, runsOptimizer must be greater than 0.' });
    }

    // Normalize libraryAddress
    let parsedLibraryAddress = [];
    if (typeof libraryAddress === 'string' && libraryAddress.trim()) parsedLibraryAddress = JSON.parse(libraryAddress);
    else if (Array.isArray(libraryAddress)) parsedLibraryAddress = libraryAddress;

    console.log('Starting contract verification with flattened source:', { contractAddress, compilerVersion, flatName, evmVersionToTarget, optimized, optimizerRuns });

    // Call the verification service
    const verificationResult = await verifyContract(
      contractAddress, compilerVersion, req.file,
      evmVersionToTarget, optimized, optimizerRuns,
      parsedTypes, parsedValues, parsedLibraryAddress
    );

    // Prepare and store verification data
    const verificationData = {
      user: user._id,
      walletAddress: walletAddress || 'No wallet address provided',
      license: license || 'No license linked',
      contractName: verificationResult.contractName || 'Unnamed Contract',
      contractAddress: verificationResult.contractAddress || 'No contract address provided',
      compilerVersion: verificationResult.compilerVersion || 'No compiler version provided',
      verificationStatus: verificationResult.verificationStatus || 'Verification status unknown',
      verified: verificationResult.verified || false,
      s3FileUrl: verificationResult.s3FileUrl || 'No URL provided',
      abi: verificationResult.abi || [],
      deployedBytecode: verificationResult.deployedBytecode || 'No deployed bytecode available',
      generatedBytecode: verificationResult.generatedBytecode || 'No generated bytecode available',
      strippedDeployedBytecode: verificationResult.strippedDeployedBytecode || 'No stripped deployed bytecode available',
      strippedGeneratedBytecode: verificationResult.strippedGeneratedBytecode || 'No stripped generated bytecode available',
      sourceCode: verificationResult.sourceCode || 'No source code available',
      sourceCodeOptimized: optimized,
      runsOptimizer: optimizerRuns,
      evmVersionToTarget: evmVersionToTarget || 'No EVM version specified',
      libraryName: libraryName || 'No library name linked',
      libraryAddress: libraryAddress || 'No library address linked',
      constructorArgs: constructorArgs || [],
      types: types || [],
      values: values || [],
      deployedBytecodeSourcemap: deployedBytecodeSourcemap || 'No deployed bytecode sourcemap provided',
      language: 'Solidity'
    };

    const contractVerification = await ContractVerification.create(verificationData);
    if (!contractVerification) {
      return res.status(400).json({ status: 400, success: false, message: 'Contract verification not successful.' });
    }

    console.log('Contract verification successful:', verificationResult);
    return res.status(200).json({ status: 200, success: true, message: 'Contract verification successful.', data: contractVerification });

  } catch (error) {
    console.error('Contract verification error:', error.message);
    return res.status(500).json({ status: 500, success: false, error: error.message });
  } finally {
    // Clean up uploaded and flattened files
    if (req.file?.path) {
      fs.unlink(req.file.path, err => { if (err) console.error('Error deleting file:', err.message); });
    }
    if (flattenedFilePath) {
      fs.unlink(flattenedFilePath, err => { if (err) console.error('Error deleting flattened file:', err.message); });
    }
  }
}

/**
 * Get all contracts created by a user
 */
const getAllUserContracts = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

        const decoded = verifyToken(token);
        if (!decoded || !decoded.email) {
            return res.status(401).json({
                status: 401,
                success: false, 
                message: 'Invalid token.' });
        }
        // Check if user exists
        const user = await User.findOne({ email: decoded.email });
        if (!user) {
            return res.status(404).json({ 
                status: 404,
                success: false, 
                message: 'User not found.' 
            });
        }

        // Find all contracts created by the user
        const contracts = await ContractVerification.find({ user: user._id }).select('contractAddress contractName createdAt -_id');
        return res.status(200).json({ 
            status: 200,
            success: true, 
            data: contracts
        });
    } catch (error) {
        console.error("Error fetching user contracts:", error.message);
        return res.status(500).json({ 
            status: 500,
            success: false, 
            message: 'Internal server error.' 
        });
    }
};

/**
 * Get contract details by user and contract address
 */
const getContractDetails = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

        const decoded = verifyToken(token);
        if (!decoded || !decoded.email) {
            return res.status(401).json({
                status: 401,
                success: false, 
                message: 'Invalid token.' });
        }
        // Check if user exists
        const user = await User.findOne({ email: decoded.email });
        if (!user) {
            return res.status(404).json({ 
                status: 404,
                success: false, 
                message: 'User not found.' 
            });
        }

        const { contractAddress } = req.body;

        // Find the specific contract for the user by contract address
        const contract = await ContractVerification.findOne({ user: user._id, contractAddress }).select('contractAddress contractName verificationStatus abi deployedBytecode generatedBytecode strippedDeployedBytecode strippedGeneratedBytecode sourceCode libraryAddress createdAt -_id');
        if (!contract) {
            return res.status(404).json({ 
                status: 404,
                success: false, 
                message: 'Contract not found.' 
            });
        }

        return res.status(200).json({ 
            status: 200,
            success: true,
            data: contract 
        });
    } catch (error) {
        console.error("Error fetching contract details:", error.message);
        return res.status(500).json({ 
            status: 500,
            success: false, 
            message: 'Internal server error.' 
        });
    }
};

module.exports = { 
    verifyContractController,
    getAllUserContracts,
    getContractDetails
 };