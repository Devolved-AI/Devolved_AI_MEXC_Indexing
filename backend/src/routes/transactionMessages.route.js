const express = require( 'express' );
const { body } = require( 'express-validator' );
const { postTransactionMessage } = require( '../controllers/transactionMessages.controller' );

const router = express.Router();

// Validation rules
const transactionMessageValidation = [
  body( 'tx_hash' )
    .isString()
    .isLength( { min: 64, max: 66 } )
    .withMessage( 'Transaction hash must be a valid string of 64 to 66 characters.' ),
  body( 'message' )
    .isString()
    .isLength( { min: 1, max: 90 } )
    .withMessage( 'Message must be between 1 and 90 characters.' ),
];

// Define the POST route
router.post( '/', transactionMessageValidation, postTransactionMessage );

module.exports = router;
