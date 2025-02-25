require('module-alias/register'); // Always call on top
require('dotenv').config();
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const sendOTPMail = async (userEmail, userOTP) => {
    try {
        // Read and prepare the email template
        const templatePath = path.resolve(__dirname, 'otpMailTemplate.html');
        let htmlTemplate = fs.readFileSync(templatePath, 'utf-8');

        // Replace placeholders in the HTML template
        htmlTemplate = htmlTemplate.replace(/{{otp}}/g, userOTP);

        // Create the nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: process.env.SMTP_SERVICE, // e.g., 'Gmail', use your preferred service
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: process.env.SMTP_SECURE === 'true', // Convert to boolean
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        });

        // Define email options
        const mailOptions = {
            from: `"Devolved AI Team" <${process.env.SMTP_USER}>`, // Sender address
            to: userEmail, // Receiver address
            subject: 'Your OTP for Argochain Scanner Verification', // Subject
            html: htmlTemplate, // HTML body
        };

        console.log('Preparing to send email...');
        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending confirmation email:', error);
        return false;
    }
};

module.exports = sendOTPMail;
