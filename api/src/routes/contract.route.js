const express = require('express');
const multer = require('multer');
const { verifyContractController } = require('@controllers/contract.controller');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });
const storage = multer.memoryStorage();
// const upload = multer({ storage });

router.post('/verify-contract', upload.single('solidityFile'), verifyContractController);

module.exports = router;
