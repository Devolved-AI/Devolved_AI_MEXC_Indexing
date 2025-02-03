const { query } = require('../config/connectDB'); // Update with your actual DB connection file

/**
 * Converts an amount (in wei or the smallest unit) to a string with fixed precision.
 * @param {string|number|bigint} amount - The amount to convert.
 * @param {number} [decimals=18] - Number of decimals to show.
 * @returns {string} The formatted amount.
 */
const convertToFixedPrecision = (amount, decimals = 18) => {
  try {
    // Validate that amount is convertible to a BigInt
    if (typeof amount !== 'string' && typeof amount !== 'number' && typeof amount !== 'bigint') {
      throw new Error('Amount must be a string, number, or BigInt');
    }
    
    // Convert the amount to a BigInt.
    const balanceBigInt = BigInt(amount);
    // Use a string literal for 1e18 to avoid floating‑point precision issues.
    const divisor = BigInt("1000000000000000000");
    
    const integerPart = balanceBigInt / divisor;
    const fractionalPart = balanceBigInt % divisor;
    
    // Convert the fractional part to a string with fixed precision.
    let fractionalStr = fractionalPart.toString().padStart(18, '0').slice(0, decimals);
    // Remove trailing zeros.
    fractionalStr = fractionalStr.replace(/0+$/, '');
    
    // If there is a fractional part, include it in the result.
    return fractionalStr ? `${integerPart}.${fractionalStr}` : integerPart.toString();
  } catch (error) {
    console.error("Error in convertToFixedPrecision:", error);
    return '0.0'; // Return a default value in case of error.
  }
};

/**
 * Controller function to get the top 10 accounts with the highest distinct balances.
 */
const getTopMaxBalanceAccounts = async (req, res) => {
  try {
    // SQL query that selects accounts having one of the top 10 distinct balances.
    const result = await query(
      `SELECT address, balance 
       FROM accounts 
       WHERE balance IN (
         SELECT DISTINCT balance 
         FROM accounts 
         ORDER BY balance DESC 
         LIMIT 100
       ) 
       ORDER BY balance DESC, address ASC 
       LIMIT 100;`
    );

    // Validate that the result contains rows.
    if (!result || !result.rows || result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No accounts found',
      });
    }

    // Sort the rows by balance using BigInt comparisons.
    // This ensures the comparison is based on numeric value.
    const sortedRows = result.rows.sort((a, b) => {
      const balanceA = BigInt(a.balance);
      const balanceB = BigInt(b.balance);

      if (balanceA < balanceB) return 1;  // For descending order
      if (balanceA > balanceB) return -1;
      return 0;
    });

    // Format each account's balance using the helper.
    const formattedData = sortedRows.map(account => ({
      address: account.address,
      balance: convertToFixedPrecision(account.balance, 18),
    }));

    return res.status(200).json({
      success: true,
      message: "10 account details with 18-decimal precision from accounts table",
      data: formattedData,
    });
  } catch (error) {
    console.error('Error fetching top max balance accounts:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

module.exports = {
  getTopMaxBalanceAccounts,
};
