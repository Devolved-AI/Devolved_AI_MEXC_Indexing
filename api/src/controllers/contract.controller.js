const fs = require('fs');
const path = require('path');
const { verifyContract } = require('@services/contract.service');
const ContractVerification = require('@models/contractVerification.model');
const User = require('@models/user.model');
const { verifyToken }= require('@libs/auth/jwt');
const { isValidAddress } = require('@utils/evmUtil');

/**
 * Controller function to verify a smart contract.
 * Handles file upload, compilation, bytecode comparison, and cleanup.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */

// Regular expression for Ethereum address validation
const contractAddressRegex = /^0x[a-fA-F0-9]{40}$/;

// Regular expression for compiler version validation (e.g., 'v0.8.0' or '0.8.0')
const compilerVersionRegex = /^v?\d+\.\d+\.\d+$/;

async function verifyContractController(req, res) {
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

        const { 
            walletAddress,
            contractAddress,
            compilerVersion,
            license,
            types,
            values, 
            deployedBytecodeSourcemap,
            sourceCodeOptimized,
            runsOptimizer,
            evmVersionToTarget,
            constructorArgs,
            libraryName,
            libraryAddress,
            language
        } = req.body;

        // Check for required fields: contract address, compiler version, and uploaded file
        if (!contractAddress || !compilerVersion || !req.file) {
            console.log("Missing required fields: contract address compiler version or Solidity file.");
            return res.status(400).json({
                status: 400,
                success: false,
                error: "Contract address, compiler version and Solidity file are required."
            });
        }

        // Validate contract address format
        if (!contractAddressRegex.test(contractAddress)) {
            return res.status(400).json({
                status: 400,
                success: false,
                message: "Invalid contract address format."
            });
        }

        // Validate file extension for .sol format
        if (path.extname(req.file.originalname) !== '.sol') {
            return res.status(400).json({
                status: 400,
                success: false,
                message: "Uploaded file must be in .sol format."
            });
        }

        if(walletAddress) {
            if (!isValidAddress(walletAddress)) {
                return res.status(400).json({
                    status: 400,
                    success: false,
                    message: "Invalid EVM wallet address.",
                });
            }
        }

        // Log input data for verification process
        console.log("Starting contract verification with data:", { contractAddress, compilerVersion, types, values, libraryAddress });

        // Try to parse the types and values only if they are provided
        let parsedTypes = types;
        let parsedValues = values;

        try {
            if (typeof types === 'string') {
                parsedTypes = JSON.parse(types);
            } else if (!types) {
                parsedTypes = []; // default to an empty array if undefined
            }

            if (typeof values === 'string') {
                parsedValues = JSON.parse(values);
            } else if (!values) {
                parsedValues = []; // default to an empty array if undefined
            }
        } catch (error) {
            console.error("Error parsing JSON:", error.message);
            return res.status(400).json({
                status: 400,
                success: false,
                message: "Invalid JSON format in types or values.",
            });
        }

        // Ensure types and values have the same length
        if (parsedTypes.length !== parsedValues.length) {
            return res.status(400).json({
                status: 400,
                success: false,
                message: `Mismatch between types and values: expected ${parsedTypes.length}, got ${parsedValues.length}.`
            });
        }

        // Call the verification service with provided details
        const verificationResult = await verifyContract(
            contractAddress, 
            compilerVersion, 
            req.file, 
            evmVersionToTarget, 
            sourceCodeOptimized, 
            runsOptimizer, 
            parsedTypes, 
            parsedValues, 
            libraryAddress,
            language
        );
        
        // Prepare verification data with schema-compliant ABI format
        const verificationData = {
            user: user._id,
            walletAddress: walletAddress || 'No wallet address provided',
            license: license || 'No license linked',
            contractName: verificationResult?.contractName || 'Unnamed Contract',
            contractAddress: verificationResult?.contractAddress || "No contract address provided",
            compilerVersion: verificationResult?.compilerVersion || "No compiler version provided",
            verificationStatus: verificationResult?.verificationStatus || 'Verification status unknown',
            s3FileUrl: verificationResult?.s3FileUrl || 'No URL provided',
            abi: verificationResult?.abi || [],
            deployedBytecode: verificationResult?.deployedBytecode || 'No deployed bytecode available',
            generatedBytecode: verificationResult?.generatedBytecode || 'No generated bytecode available',
            strippedDeployedBytecode: verificationResult?.strippedDeployedBytecode || 'No stripped deployed bytecode available',
            strippedGeneratedBytecode: verificationResult?.strippedGeneratedBytecode || 'No stripped generated bytecode available',
            sourceCode: verificationResult?.sourceCode || 'No source code available',
            sourceCodeOptimized: sourceCodeOptimized || false,
            runsOptimizer: runsOptimizer || 0,
            evmVersionToTarget: evmVersionToTarget || 'No EVM version specified',
            libraryName: libraryName || 'No library name linked',
            libraryAddress: libraryAddress || 'No library address linked',
            constructorArgs: constructorArgs || [],
            types: types || [],
            values: values || [],
            deployedBytecodeSourcemap: deployedBytecodeSourcemap || 'No deployed bytecode sourcemap provided',
            language: language || 'No language provided'
        };

        // // Store verification data in MongoDB
        const contractVerification = await ContractVerification.create(verificationData);

        if (!contractVerification) {
            // Log success response if verification is successful
            console.log("Contract verification not successful.");
            
            // Send the successful response with verification data
            return res.status(400).json({ 
                status: 400,
                success: false, 
                message: "Contract verification not successful." 
            });
        }

        // Log success response if verification is successful
        console.log("Contract verification successful:", verificationResult);
        
        // Send the successful response with verification data
        return res.status(200).json({ 
            status: 200,
            success: true, 
            message: "Contract verification successful and created successfully.",
            data: contractVerification
        });

    } catch (error) {
        // Log any errors encountered during verification
        console.error("Contract verification error:", error.message);
        
        // Send an error response with the error message
        return res.status(500).json({ 
            status: 500,
            success: false, 
            error: error.message 
        });
    } finally {
        // Clean up the uploaded file after processing
        if (req.file && req.file.path) {
            fs.unlink(req.file.path, (err) => {
                if (err) {
                    console.error("Error deleting uploaded file:", err.message);
                } else {
                    console.log("Uploaded file deleted successfully:", req.file.path);
                }
            });
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
