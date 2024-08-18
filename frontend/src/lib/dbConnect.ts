import { Pool } from 'pg';

// Initialize PostgreSQL connection pool using environment variables
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
});

const RETRY_LIMIT = 10; // Number of retries for the database connection
const RETRY_DELAY = 5000; // Delay between retries (in milliseconds)

const connectToDatabase = async (retries = RETRY_LIMIT): Promise<Pool> => {
  while (retries > 0) {
    try {
      await pool.connect();
      console.log('Connected to PostgreSQL database');
      return pool;
    } catch (error) {
      console.error(`Failed to connect to PostgreSQL database. Retries left: ${retries - 1}`);
      retries -= 1;
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
    }
  }
  throw new Error('Unable to connect to PostgreSQL database after multiple retries');
};

export { pool, connectToDatabase };
