require('module-alias/register'); // always call on top
const express = require('express');
const router = express.Router();
const {
    authEmail,
    verify
} = require('@controllers/auth.controller');

// Registration route
router.post('/authEmail', authEmail);
router.post('/verify', verify);

module.exports = router;