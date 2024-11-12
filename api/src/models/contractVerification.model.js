const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define a flexible schema for the ABI structure
const AbiSchema = new Schema({
    inputs: [
        {
            internalType: { type: String },
            name: { type: String },
            type: { type: String }
        }
    ],
    name: { type: String, required: true },
    outputs: [
        {
            internalType: { type: String },
            name: { type: String },
            type: { type: String }
        }
    ],
    stateMutability: { type: String },
    type: { type: String, required: true }
});

// Main ContractVerification schema
const ContractVerificationSchema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    contractName: { type: String, required: true },
    contractAddress: { type: String, required: true, unique: true },
    verificationStatus: { type: String, required: true },
    s3FileUrl: { type: String, required: true },
    abi: { type: [AbiSchema], required: true }, // Use the flexible ABI schema
    deployedBytecode: { type: String, required: true },
    generatedBytecode: { type: String, required: true },
    strippedDeployedBytecode: { type: String, required: true },
    strippedGeneratedBytecode: { type: String, required: true },
    sourceCode: { type: String, required: true },
    libraryAddress: { type: String, default: 'No library linked' }
}, { timestamps: true });

module.exports = mongoose.model('ContractVerification', ContractVerificationSchema);
