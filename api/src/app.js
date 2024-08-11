// src/app.js
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
require('express-async-errors');

const blockRoutes = require('./routes/blockRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const addressRoutes = require('./routes/addressRoutes');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

const app = express();

app.use(helmet());
app.use(cors());
app.options('*', cors());
app.use(express.json());

app.use('/hitme/blocks', blockRoutes);
app.use('/hitme/transactions', transactionRoutes);
app.use('/hitme/address', addressRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
