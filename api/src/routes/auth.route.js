require('module-alias/register'); // always call on top
const express = require('express');
const router = express.Router();
const {
    register,
    login,
    resetPassword,
    sendResetPasswordMail,
    logout
} = require('@controllers/auth.controller');

// Registration route
router.post('/register', register);
router.post('/login', login);
router.post('/sendResetPasswordMail', sendResetPasswordMail);
router.post('/resetPassword', resetPassword);
router.post('/logout', logout);

module.exports = router;