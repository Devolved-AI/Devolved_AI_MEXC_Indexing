function stripMetadata(bytecode) {
    if (bytecode.startsWith('0x')) {
        bytecode = bytecode.slice(2);
    }
    // Remove metadata that starts with either "a2646970667358" or "fea2646970667358"
    const regex = /f?a2646970667358.*/;
    return bytecode.replace(regex, '');
}

function matchContractBytecode(generatedBytecode, deployedBytecode) {
    const strippedGeneratedBytecode = stripMetadata(generatedBytecode);
    const strippedDeployedBytecode = stripMetadata(deployedBytecode);
    return {
        isMatch: strippedGeneratedBytecode === strippedDeployedBytecode,
        strippedGeneratedBytecode,
        strippedDeployedBytecode
    };
}

module.exports = { stripMetadata, matchContractBytecode };
