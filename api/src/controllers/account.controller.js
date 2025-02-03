const { query } = require('../config/connectDB'); // Update with your actual DB connection file

/**
 * Converts an amount (in wei or the smallest unit) to a string with fixed precision.
 * @param {string|number|bigint} amount - The amount to convert.
 * @param {number} [decimals=18] - Number of decimals to show.
 * @returns {string} The formatted amount.
 */
const convertToFixedPrecision = (amount, decimals = 18) => {
  try {
    // Validate that the amount is convertible to a BigInt.
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
    // Remove any trailing zeros.
    fractionalStr = fractionalStr.replace(/0+$/, '');
    
    // Return with a fractional part if available.
    return fractionalStr ? `${integerPart}.${fractionalStr}` : integerPart.toString();
  } catch (error) {
    console.error("Error in convertToFixedPrecision:", error);
    return '0.0'; // Default value in case of error.
  }
};

/**
 * Controller function to get the top 100 accounts with the highest distinct balances.
 * It adds a serial number field to each account (1 to 100).
 */
const getTopMaxBalanceAccounts = async (req, res) => {
  try {
    // SQL query selects accounts with one of the top 100 distinct balances.
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

    if (!result || !result.rows || result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No accounts found',
      });
    }

    // Sort the rows by balance (using BigInt for accurate numeric comparison).
    const sortedRows = result.rows.sort((a, b) => {
      const balanceA = BigInt(a.balance);
      const balanceB = BigInt(b.balance);
      if (balanceA < balanceB) return 1;  // Descending order.
      if (balanceA > balanceB) return -1;
      return 0;
    });

    // Map each account to include a serial number (starting at 1) and a formatted balance.
    const formattedData = sortedRows.map((account, index) => ({
      serial: index + 1, // Serial number (1-indexed)
      address: account.address,
      balance: convertToFixedPrecision(account.balance, 18),
    }));

    if(!formattedData) {
        return res.status(200).json({
            status: 200,
            success: true,
            message: "No data found",
            data: [],
        });
    }

    return res.status(200).json({
        status: 200,
        success: true,
        message: "Top 100 account details found",
        data: formattedData,
    });
  } catch (error) {
    console.error('Error fetching top max balance accounts:', error);
    return res.status(500).json({
        status: 500,
        success: false,
        message: 'Internal Server Error',
    });
  }
};

module.exports = {
  getTopMaxBalanceAccounts,
};
