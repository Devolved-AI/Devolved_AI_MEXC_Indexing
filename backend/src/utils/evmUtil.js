// This utility will help validate Ethereum (EVM) addresses

/**
 * Checks if the given string is a valid Ethereum address.
 * 
 * @param {string} address - The address to validate.
 * @return {Promise<boolean>} - True if the address is valid, false otherwise.
 */
const isValidAddress = async (address) => {
    if (!address) {
      return false;
    }
    
    // Check if it has the basic requirements of an Ethereum address
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return false;
    }
  
    // If it's ALL uppercase or all lowercase, then it's a valid address
    if (address === address.toLowerCase() || address === address.toUpperCase()) {
      return true;
    }
  
    // Otherwise, check each character in the address for the checksum
    return isChecksumAddress(address);
  }
  
  /**
   * Checks if the given string is a checksummed Ethereum address.
   * 
   * @param {string} address - The address to check.
   * @return {boolean} - True if the address has a valid checksum, false otherwise.
   */
  function isChecksumAddress(address) {
    // Check each case
    address = address.replace('0x','');
    const sha3Hash = keccak256(address.toLowerCase());
    
    for (let i = 0; i < 40; i++) {
      let char = address.charAt(i);
      let val = parseInt(sha3Hash.charAt(i), 16);
      if ((val > 7 && char.toUpperCase() !== char) || (val <= 7 && char.toLowerCase() !== char)) {
        return false;
      }
    }
    return true;
  }
  
  /**
   * Generates a Keccak-256 hash of the input.
   * 
   * @param {string} input - The input data to hash.
   * @return {string} - The hash as a hex string.
   */
  function keccak256(input) {
    // Using the 'js-sha3' library for the Keccak-256 hashing function
    const { keccak256 } = require('js-sha3');
    return keccak256(input);
  }

// Exports if needed
module.exports = {
  isValidAddress
};
