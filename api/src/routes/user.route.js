require('module-alias/register'); // always call on top
const express = require('express');
const router = express.Router();
const { profile } = require('@controllers/user.controller');

router.post('/profile', profile);

module.exports = router;