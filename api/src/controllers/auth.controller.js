// this function is user api logic
require('module-alias/register');
const moment = require('moment');

// db models
const User = require('@models/user.model');

const {
    authValidation,
    verifyOTPValidation,
} = require('@validations/auth.validation');
const sendOTPMail = require('@libs/email/sendOTPMail');

const { generateUserToken, verifyToken }= require('@libs/auth/jwt');

const authEmail = async (req, res) => {
    // Validate the request body
    const { error } = authValidation.validate(req.body);
    if (error) return res.status(400).json({ status: 400, success: false, message: error.details[0].message });

    try {
        const { email } = req.body;

        // Generate a 6-digit OTP
        const userOTP = Math.floor(100000 + Math.random() * 900000);
        if (!userOTP) {
            return res.status(500).json({
                status: 500,
                success: false,
                message: 'Failed to generate OTP'
            });
        }

        // Check if the user exists
        const user = await User.findOne({ email });
        // Current timestamp for OTP creation
        const otpCreatedAt = new Date();

        if (!user) {
            // User does not exist, create new user and send OTP email
            const newUser = new User({ email, otp: userOTP, otpCreatedAt });
            await newUser.save();

            const emailSent = await sendOTPMail(email, userOTP);
            if (!emailSent) {
                return res.status(500).json({
                    status: 500,
                    success: false,
                    message: 'Failed to send confirmation email'
                });
            }

            return res.status(200).json({
                status: 200,
                success: true,
                message: 'Welcome! OTP email sent successfully'
            });
        } else {
            // User exists, update OTP and send email
            user.otp = userOTP;
            user.otpCreatedAt = otpCreatedAt;
            await user.save();

            const emailSent = await sendOTPMail(email, userOTP);
            if (!emailSent) {
                return res.status(500).json({
                    status: 500,
                    success: false,
                    message: 'Failed to send OTP email'
                });
            }

            return res.status(200).json({
                status: 200,
                success: true,
                stage: 'otp',
                message: 'OTP email sent successfully'
            });
        }
    } catch (error) {
        return res.status(500).json({
            status: 500,
            success: false,
            message: error.message
        });
    }
};

const verify = async (req, res) => {
    // Validate the request body
    const { error } = verifyOTPValidation.validate(req.body);
    if (error) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: error.details[0].message 
        });
    }

    try {
        // Check if the user already exists
        const user = await User.findOne({ email: req.body.email });
        
        if (!user) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: 'User not found'
            });
        }

        // Check if OTP exists and is within the valid time frame (3 minutes)
        if (user.otp && user.otpCreatedAt && moment().diff(moment(user.otpCreatedAt), 'minutes') < 3) {
            if (user.otp === req.body.otp) {
                // OTP is correct and within the time limit
                // Generate token
                const token = await generateUserToken(req.body.email);
                if (!token) {
                    console.error('Failed to generate token for user:', req.body.email);
                    return res.status(500).json({ 
                        status: 500,
                        success: false,
                        message: 'Failed to generate token' 
                    });
                }

                // Update user with the generated token and reset OTP
                // clear otp and timestamp
                const updatedUser = await User.findByIdAndUpdate(
                    user._id, // Assuming _id is the correct identifier
                    { token: token, loggedIn: true, emailVerified: true, otp: "", otpCreatedAt: "" },
                    { new: true }
                );

                if (!updatedUser) {
                    return res.status(500).json({ 
                        status: 500,
                        success: false,
                        message: 'Failed to authenticate' 
                    });
                }
                
                // Successful login
                return res.status(200).json({
                    status: 200,
                    success: true,
                    message: 'Successfully logged in',
                    user: {
                        name: updatedUser.name,
                        email: updatedUser.email,
                        image: updatedUser.image? updatedUser.image : "",
                        loggedIn: updatedUser.loggedIn,
                        token: updatedUser.token,
                        firstLoggedIn: updatedUser.createdAt,
                        LastLoggedIn: updatedUser.updatedAt
                    }
                });
            } else {
                return res.status(404).json({ 
                    status: 404,
                    success: false,
                    message: 'OTP not found'
                });
            }
        } else {
            // OTP is either not set or expired
            return res.status(400).json({ 
                status: 400,
                success: false,
                message: 'OTP is expired or invalid'
            });
        }
    } catch (error) {
        console.error('Error during OTP verification:', error);
        return res.status(500).json({ 
            status: 500,
            success: false,
            message: 'An error occurred during authentication'
        });
    }
};

const logout = async (req, res) => {
    // Extract token from the Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1]; // Using optional chaining

    if (!token) {
        return res.status(401).json({ 
            status: 401,
            success: false,
            message: 'Authorization token required' 
        });
    }

    try {
        const decodedToken = await verifyToken(token);
        if (!decodedToken) {
            return res.status(403).json({ 
                status: 403,
                success: false,
                message: 'Invalid Token' 
            });
        }

        const user = await User.findOne({ email: decodedToken.email });
        // Check if the user exists
        if (!user) {
            return res.status(404).json({ 
                status: 404,
                success: false,
                message: 'User not found' 
            });
        }

        // Log the user out by clearing the token and loggedIn flag
        const updatedUser = await User.findByIdAndUpdate(
            user._id, 
            { $unset: { token: 1 }, $set: { loggedIn: false, otp: "" } },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(500).json({
                status: 500,
                success: false,
                message: 'Could not log out' 
            });
        }

        // Successful logout
        return res.status(200).json({
            status: 200,
            success: true,
            message: 'Successfully logged out',
            user: {
                name: updatedUser.name,
                email: updatedUser.email,
                loggedIn: updatedUser.loggedIn,
                token: updatedUser.token
            }
        });

    } catch (error) {
        console.error('Logout Error:', error);
        return res.status(500).json({ 
            status: 500,
            success: false,
            message: 'Server error' 
        });
    }
};

module.exports = {
    authEmail,
    verify,
    logout
};