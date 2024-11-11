const fs = require('fs');
const { verifyContract } = require('@services/contract.service');
const ContractVerification = require('@models/contractVerification.model');
const User = require('@models/user.model');
const { verifyToken }= require('@libs/auth/jwt');

/**
 * Controller function to verify a smart contract.
 * Handles file upload, compilation, bytecode comparison, and cleanup.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
async function verifyContractController(req, res) {
    try {
        const { contractAddress, compilerVersion, types, values, libraryAddress } = req.body;

        // Check for required fields: contract address, compiler version, and uploaded file
        if (!contractAddress || !compilerVersion || !req.file) {
            console.log("Missing required fields: contract address, compiler version, or Solidity file.");
            return res.status(400).json({
                success: false,
                error: "Contract address, compiler version, and Solidity file are required."
            });
        }

        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

        const decoded = verifyToken(token);
        if (!decoded || !decoded.email) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token.' });
        }
        // Check if user exists
        const user = await User.findOne({ email: decoded.email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        // Log input data for verification process
        console.log("Starting contract verification with data:", { contractAddress, compilerVersion, types, values, libraryAddress });

        // Call the verification service with provided details
        const verificationResult = await verifyContract(contractAddress, compilerVersion, req.file, types, values, libraryAddress);
        
        // Ensure required fields in verificationResult before proceeding
        if (!verificationResult || !verificationResult.details || !verificationResult.details.abi) {
            console.error("Contract verification failed: ABI or required details missing.");
            return res.status(500).json({
                success: false,
                message: "Contract verification failed: ABI or required details missing."
            });
        }
        
        // Prepare data for MongoDB
        const verificationData = {
            user: user._id,
            contractName: verificationResult.contractName,
            contractAddress: verificationResult.contractAddress,
            verificationStatus: verificationResult.verificationStatus,
            s3FileUrl: verificationResult.s3FileUrl,
            abi: verificationResult.details.abi,
            deployedBytecode: verificationResult.details.deployedBytecode,
            generatedBytecode: verificationResult.details.generatedBytecode,
            strippedDeployedBytecode: verificationResult.details.strippedDeployedBytecode,
            strippedGeneratedBytecode: verificationResult.details.strippedGeneratedBytecode,
            sourceCode: verificationResult.details.sourceCode,
            libraryAddress: verificationResult.details.libraryAddress || 'No library linked'
        };

        // Store verification data in MongoDB
        const contractVerification = await ContractVerification.create(verificationData);

        if (!contractVerification) {
            // Log success response if verification is successful
            console.log("Contract verification not successful.");
            
            // Send the successful response with verification data
            res.status(400).json({ success: false, message: "Contract verification not successful." });
        }

        // Log success response if verification is successful
        console.log("Contract verification successful:", verificationResult);
        
        // Send the successful response with verification data
        res.status(200).json({ success: true, data: verificationResult });

    } catch (error) {
        // Log any errors encountered during verification
        console.error("Contract verification error:", error.message);
        
        // Send an error response with the error message
        res.status(500).json({ success: false, error: error.message });
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

module.exports = { verifyContractController };
