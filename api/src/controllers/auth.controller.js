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

const register = async (req, res) => {
    // Validate the request body
    const { username, email, password, confirmpassword } = req.body;
    if(!email || !password || !confirmpassword) {
        console.log('Validation Error: Missing required fields');
        return res.status(400).json({
            status: 400,
            success: false,
            message: 'Email, password and confirm password are required.'
        });
    }

    if (password !== confirmpassword) {
        console.log('Password Mismatch: Password and confirm password do not match');
        res.status(402).json({
            status: 402,
            success: false,
            message: 'Password and confirm password not matched'
        });
    }

    try {
        // Check if the user already exists
        console.log('User already exists for email:', email);
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(409).json({
                status: 409,
                success: false,
                message: 'User already exists' 
            });
        } else {
            // Hash passwords
            console.log('Hashing password for new user registration');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(confirmpassword, salt);

            console.log('Creating new user for email:', email);
            // Create new user
            const newUser = await User.create({
                username: username,
                email: email,
                password: hashedPassword
            });

            if(newUser) {
                console.log('Sending confirmation email to:', email);
                const emailSent = await sendMail(email, true);
                if (!emailSent) {
                    return res.status(500).json({ 
                        status: 500,
                        success: false, 
                        message: 'Failed to send confirmation email' 
                    });
                }

                console.log('User registered successfully, confirmation email sent:', email);
                return res.status(201).json({
                    status: 201,
                    success: true,
                    message: 'Registration successful! Please check your email to confirm your account.',
                });
            } else {
                console.log('User creation failed for email:', email);
                return res.status(400).json({
                    status: 400,
                    success: false,
                    message: 'User not created'
                });
            }
        }
    } catch (error) {
        console.error('Registration Error:', error.message);
        return res.status(500).json({ 
            status: 500,
            success: false,
            message: "Internal server error."
        });
    }
};

const login = async (req, res) => {
    const {email, password } = req.body;
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    try {
        let users;

        // 1. If token is provided
        if (token) {
            console.log('Token provided, validating...');

            // Verify token validity
            const decoded = verifyToken(token);
            if (!decoded || !decoded.email) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Invalid token.' });
            }

            // Check if user exists and update login status
            const newToken = generateUserToken(decoded.email);
            users = await User.findOneAndUpdate(
                { email: decoded.email },
                { token: newToken, loggedIn: true, emailVerified: true },
                { new: true }
            );

            if (!users) {
                return res.status(404).json({ success: false, message: 'User not found.' });
            }

            console.log('Token valid, user logged in:', users.email);
            return res.status(200).json({
                status: 200,
                success: true,
                message: 'Login successful.',
                data: users,
            });
        }

        // 2. If email and password are provided instead of a token
        if (email && password) {
            console.log('Email and password provided, verifying credentials...');

            // Check if user exists
            users = await User.findOne({ email });
            if (!users) {
                return res.status(404).json({ success: false, message: 'User not found.' });
            }

            // Verify password
            const validPassword = await bcrypt.compare(password, users.password);
            if (!validPassword) {
                return res.status(401).json({ success: false, message: 'Incorrect password.' });
            }

            // Generate a new token, log the user in
            const newToken = generateUserToken(users.email);
            users = await User.findOneAndUpdate(
                { email },
                { token: newToken, loggedIn: true, emailVerified: true },
                { new: true }
            );

            console.log('Email and password valid, user logged in:', users.email);
            return res.status(200).json({
                success: true,
                message: 'Login successful.',
                data: users,
            });
        }

        // 3. If neither token nor email/password are provided
        return res.status(400).json({
            success: false,
            message: 'Token or email and password are required.',
        });
    } catch (error) {
        console.error('Login Error:', error);
        return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR.code).json({ 
            status: 500,
            message: 'Internal Server Error' 
        });
    }
};

module.exports = {
    register,
    login
};