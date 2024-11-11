require('dotenv').config();
const jwt = require('jsonwebtoken');

// Generate Registration Confirmation Token
function generateConfirmationToken(userEmail, userVerified) {
    return jwt.sign(
        { email: userEmail, verified: userVerified }, 
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_VERIFY_EMAIL_EXPIRATION });
}

// Generate User's Token (for authentication, assumed here)
function generateUserToken(userEmail) {
    return jwt.sign(
        { email: userEmail },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_USER_EXPIRATION });
}

const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return false;
    }
};

const decodeToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded.exp; // Return the email from the token payload
    } catch (error) {
        console.error('Error decoding token:', error);
        return null; // or handle the error as appropriate
    }
}

module.exports = {
    generateConfirmationToken,
    generateUserToken,
    verifyToken,
    decodeToken
};