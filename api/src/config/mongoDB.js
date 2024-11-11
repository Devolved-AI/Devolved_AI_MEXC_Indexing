const mongoose = require('mongoose');
// Load environment variables
require('dotenv').config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_DB_URI, { dbName: process.env.DB_NAME, });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1); // Exit with failure
    }
};

module.exports = connectDB;