const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ContractVerificationSchema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    contractName: { type: String, required: true },
    contractAddress: { type: String, required: true },
    verificationStatus: { type: String, required: true },
    s3FileUrl: { type: String, required: true },
    abi: { 
      type: [ 
        { 
          inputs: [{ 
            internalType: String, 
            name: String, 
            type: String 
          }],
          name: { type: String, required: true },
          outputs: [{
            internalType: String,
            name: String,
            type: String
          }],
          stateMutability: String,
          type: { type: String, required: true }
        }
      ],
      required: true 
    },
    deployedBytecode: { type: String, required: true },
    generatedBytecode: { type: String, required: true },
    strippedDeployedBytecode: { type: String, required: true },
    strippedGeneratedBytecode: { type: String, required: true },
    sourceCode: { type: String, required: true },
    libraryAddress: { type: String, required: true, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('ContractVerification', ContractVerificationSchema);
