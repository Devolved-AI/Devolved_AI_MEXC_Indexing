// Importing the necessary functions from the polkadot/util-crypto package
const { decodeAddress, encodeAddress } = require('@polkadot/util-crypto');

/**
 * Validates if the given string is a valid Polkadot address.
 * 
 * @param {string} address - The address to validate.
 * @return {Promise<boolean>} - True if the address is valid, false otherwise.
 */
const isValidAddress = async (address) => {
  try {
    encodeAddress(
      decodeAddress(address)
    );
    return true;
  } catch (error) {
    return false;
  }
};

// Export the function if needed
module.exports = {
  isValidAddress
};
