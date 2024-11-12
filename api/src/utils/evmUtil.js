const { keccak256 } = require('js-sha3');

/**
 * Checks if the given string is a valid Ethereum address.
 * 
 * @param {string} address - The address to validate.
 * @return {boolean} - True if the address is valid, false otherwise.
 */
const isValidAddress = (address) => {
  if (!address) {
    return false;
  }

  // Basic Ethereum address pattern check
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return false;
  }

  // Valid if all lowercase or all uppercase
  if (address === address.toLowerCase() || address === address.toUpperCase()) {
    return true;
  }

  // Otherwise, validate checksum
  return isChecksumAddress(address);
};

/**
 * Checks if the given address has a valid EIP-55 checksum.
 * 
 * @param {string} address - The address to check.
 * @return {boolean} - True if the checksum is valid.
 */
const isChecksumAddress = (address) => {
  const addressWithoutPrefix = address.replace('0x', '');
  const hash = keccak256(addressWithoutPrefix.toLowerCase());

  for (let i = 0; i < 40; i++) {
    const char = addressWithoutPrefix[i];
    const hashCharValue = parseInt(hash[i], 16);

    if ((hashCharValue > 7 && char !== char.toUpperCase()) ||
        (hashCharValue <= 7 && char !== char.toLowerCase())) {
      return false;
    }
  }

  return true;
};

module.exports = { isValidAddress };
