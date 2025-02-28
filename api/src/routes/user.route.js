require('module-alias/register'); // always call on top
const express = require('express');
const router = express.Router();
const { profile, isValid } = require('@controllers/user.controller');

router.post('/profile', profile);
router.post('/isValid', isValid);

module.exports = router;