// this function is user api logic
require('module-alias/register'); // always call on top
const bcrypt = require('bcrypt');

// db models
const User = require('@models/user.model');

// libraries
const sendMail = require('@libs/email/sendConfirmMail');

const {
    generateUserToken,
    verifyToken,
    decodeToken
}= require('@libs/auth/jwt');

// Regular expression for email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Regular expression for username validation (alphanumeric, 3-20 characters)
const usernameRegex = /^[a-zA-Z0-9]{3,20}$/;

// Password strength validation function
const validatePassword = (password) => {
    // Password must be at least 8 characters, have 1 uppercase, 1 lowercase, 1 digit, and 1 special character
    const mediumStrengthRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return mediumStrengthRegex.test(password);
};

const register = async (req, res) => {
    // Validate the request body
    const { username, email, password, confirmpassword } = req.body;
    if(!email || !password || !confirmpassword) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: 'Email, password and confirm password are required.'
        });
    }

    // Validate username
    if (!usernameRegex.test(username)) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: 'Username must be alphanumeric and between 3-20 characters.'
        });
    }

    // Validate email
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: 'Invalid email format.'
        });
    }

    // Validate password strength
    if (!validatePassword(password)) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: 'Password must be at least 8 characters long and include uppercase, lowercase, digit, and special character.'
        });
    }

    if (password !== confirmpassword) {
        return res.status(402).json({
            status: 402,
            success: false,
            message: 'Password and confirm password not matched'
        });
    }

    try {
        // Check if the user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(409).json({
                status: 409,
                success: false,
                message: 'User already exists' 
            });
        } else {
            // Hash passwords
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(confirmpassword, salt);

            // Create new user
            const newUser = await User.create({
                username: username,
                email: email,
                password: hashedPassword
            });

            if(newUser) {
                const emailSent = await sendMail(email, true);
                if (!emailSent) {
                    return res.status(500).json({ 
                        status: 500,
                        success: false, 
                        message: 'Failed to send confirmation email' 
                    });
                }

                return res.status(201).json({
                    status: 201,
                    success: true,
                    message: 'Registration successful! Please check your email to confirm your account.',
                });
            } else {
                return res.status(400).json({
                    status: 400,
                    success: false,
                    message: 'User not created'
                });
            }
        }
    } catch (error) {
        return res.status(500).json({ 
            status: 500,
            success: false,
            message: "Internal server error."
        });
    }
};

const login = async (req, res) => {
    try {
        let users;
        const {email, password } = req.body;
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

        // 1. If token is provided
        if (token) {
            // Verify token validity
            const decoded = verifyToken(token);
            if (!decoded || !decoded.email) {
                return res.status(401).json({
                    status: 401,
                    success: false, 
                    message: 'Invalid token.' 
                });
            }

            // Check if user exists and update login status
            const newToken = generateUserToken(decoded.email);
            users = await User.findOneAndUpdate(
                { email: decoded.email },
                { token: newToken, loggedIn: true, emailVerified: true },
                { new: true }
            );

            if (!users) {
                return res.status(404).json({ 
                    status: 404,
                    success: false, 
                    message: 'User not found.' 
                });
            }

            return res.status(200).json({
                status: 200,
                success: true,
                message: 'Login successful.',
                data: users,
            });
        }

        // 2. If email and password are provided instead of a token
        if (email && password) {
            // Check if user exists
            users = await User.findOne({ email });
            if (!users) {
                return res.status(404).json({ 
                    status: 404,
                    success: false, 
                    message: 'User not found.' 
                });
            }

            // Verify password
            const validPassword = await bcrypt.compare(password, users.password);
            if (!validPassword) {
                return res.status(401).json({ 
                    status: 401,
                    success: false, 
                    message: 'Incorrect password.' 
                });
            }

            // Generate a new token, log the user in
            const newToken = generateUserToken(users.email);
            users = await User.findOneAndUpdate(
                { email },
                { token: newToken, loggedIn: true, emailVerified: true },
                { new: true }
            );

            return res.status(200).json({
                status: 200,
                success: true,
                message: 'Login successful.',
                data: users,
            });
        }

        // 3. If neither token nor email/password are provided
        return res.status(400).json({
            status: 400,
            success: false,
            message: 'Token or email and password are required.',
        });
    } catch (error) {
        console.error('Login Error:', error);
        return res.status(500).json({ 
            status: 500,
            success: false,
            message: 'Internal Server Error' 
        });
    }
};

module.exports = {
    register,
    login
};