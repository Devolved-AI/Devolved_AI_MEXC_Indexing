const express = require('express');
const multer = require('multer');
const { 
    verifyContractController,
    getAllUserContracts,
    getContractDetails
 } = require('@controllers/contract.controller');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });
const storage = multer.memoryStorage();
// const upload = multer({ storage });

router.post('/verify-contract', upload.single('solidityFile'), verifyContractController);
router.post('/getAllUserContracts', getAllUserContracts);
router.post('/getContractDetails', getContractDetails);

module.exports = router;
