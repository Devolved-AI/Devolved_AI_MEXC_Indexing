require('module-alias/register'); // always call on top
const express = require('express');
const router = express.Router();
const {
    register,
    login
} = require('@controllers/auth.controller');

// Registration route
router.post('/register', register);
router.post('/login', login);

module.exports = router;