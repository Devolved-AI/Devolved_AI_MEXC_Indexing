const { query, shutdown } = require('../src/config/connectDB');

const getTopAccounts = async () => {
  try {
    const result = await query(
      `SELECT address, balance FROM accounts ORDER BY balance DESC LIMIT 100;`
    );

    console.log('Top 100 Accounts with Highest Balance:');
    console.table(result.rows); // Display result in table format
  } catch (error) {
    console.error('Error fetching top accounts:', error.message);
  } finally {
    await shutdown(); // Properly close the DB connection pool
  }
};

getTopAccounts();