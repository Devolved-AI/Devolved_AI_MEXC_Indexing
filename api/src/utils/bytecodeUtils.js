function stripMetadata(bytecode) {
    if (bytecode.startsWith('0x')) {
        bytecode = bytecode.slice(2);
    }
    const metadataMarker = 'a2646970667358';
    const metadataIndex = bytecode.indexOf(metadataMarker);
    return metadataIndex === -1 ? bytecode : bytecode.slice(0, metadataIndex);
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
