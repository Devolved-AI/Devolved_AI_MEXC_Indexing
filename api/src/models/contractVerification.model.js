const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Main ContractVerification schema
const ContractVerificationSchema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    walletAddress: { type: String },
    contractName: { type: String, required: true },
    contractAddress: { type: String, required: true, unique: true },
    compilerVersion: { type: String, required: true },
    license : { type: String, default: 'No license linked' },
    s3FileUrl: { type: String, required: true },
    verificationStatus: { type: String, required: true },
    abi: { type: Array, required: true },
    deployedBytecode: { type: String, required: true },
    generatedBytecode: { type: String, required: true },
    strippedDeployedBytecode: { type: String, required: true },
    strippedGeneratedBytecode: { type: String, required: true },
    sourceCode: { type: String, required: true },
    deployedBytecodeSourcemap: { type: String, default: 'No deployed bytecode sourcemap provided' },
    sourceCodeOptimized: { type: Boolean, default: false },
    runsOptimizer: { type: Number, default: 0 },
    evmVersionToTarget: { type: String, default: 'No evm version provided' },
    libraryName: { type: [String], default: ['No library name linked'] },  // Allow multiple library names
    libraryAddress: { type: [String], default: ['No library linked'] },    // Allow multiple library addresses
    constructorArgs: { type: [String], default: [] },                      // Allow multiple constructor arguments
    types: { type: String, default: 'No types provided' },
    values: { type: String, default: 'No values provided' }
}, { timestamps: true });

module.exports = mongoose.model('ContractVerification', ContractVerificationSchema);
