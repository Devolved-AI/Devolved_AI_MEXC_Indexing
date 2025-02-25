require('module-alias/register'); // always call on top
const express = require('express');
const router = express.Router();
const {
    authEmail,
    verify,
    logout
} = require('@controllers/auth.controller');

// Registration route
router.post('/authEmail', authEmail);
router.post('/verify', verify);
router.post('/logout', logout);

module.exports = router;