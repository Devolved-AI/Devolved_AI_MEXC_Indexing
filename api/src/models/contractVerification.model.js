const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Main ContractVerification schema
const ContractVerificationSchema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    walletAddress: { type: String, required: true },
    contractName: { type: String, required: true },
    contractAddress: { type: String, required: true, unique: true },
    verificationStatus: { type: String, required: true },
    s3FileUrl: { type: String, required: true },
    abi: { type: Array, required: true },
    deployedBytecode: { type: String, required: true },
    generatedBytecode: { type: String, required: true },
    strippedDeployedBytecode: { type: String, required: true },
    strippedGeneratedBytecode: { type: String, required: true },
    sourceCode: { type: String, required: true },
    libraryAddress: { type: String, default: 'No library linked' },
    license : { type: String, default: 'No license linked' }
}, { timestamps: true });

module.exports = mongoose.model('ContractVerification', ContractVerificationSchema);
