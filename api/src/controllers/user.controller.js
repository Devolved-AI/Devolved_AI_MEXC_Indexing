require('module-alias/register');
const User = require('@models/user.model');
const { verifyToken }= require('@libs/auth/jwt');

const profile = async (req, res) => {
    // Extract token from the Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    if (!token) {
        return res.status(401).json({
            status: 401,
            success: false,
            message: "Authorization token required"
        });
    }

    const decodedToken = await verifyToken(token);
    if (!decodedToken) {
        return res.status(400).json({
            status: 400,
            success: false,
            message: "Invalid Token"
        });
    }

    try {
        // Fetch user and account details
        const user = await User.findOne({ email: decodedToken.email });
        if (!user) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "User not found."
            });
        }

        // Determine if the user is active
        const isActive = user.loggedIn;

        // Check for image URL and provide a fallback if not found or blank
        const imageUrl = user.image && user.image.trim() !== "" ? user.image : "https://storage-devolvedai.s3.amazonaws.com/common/logo/user.png";

        return res.status(200).json({
            status: 200,
            success: true,
            message: "User details found",
            data: {
                name: user.name,
                email: user.email,
                image: user.image,
                firstLogin: user.firstLoginAt || user.createdAt,
                lastLogin: user.lastLoginAt || user.updatedAt,
                isActive
            }
        });

    } catch (error) {
        console.error('Error fetching user details:', error);
        return res.status(500).json({
            status: 500,
            success: false,
            message: 'Internal server error'
        });
    }
}

module.exports = { 
    profile,
};
