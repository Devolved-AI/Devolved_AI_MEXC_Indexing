require('module-alias/register'); // always call on top
require('dotenv').config();
const nodemailer = require('nodemailer');
const { generateResetToken } = require('@libs/auth/jwt');

const sendResetMail = async (userEmail) => {
    try {
        const userToken = await generateResetToken(userEmail);
        const resetLink = `${process.env.WEBAPP_URL}/reset-password?token=${userToken}`;

        const transporter = nodemailer.createTransport({
            service: process.env.SMTP_SERVICE,
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT, 10),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.SMTP_USER,
            to: userEmail,
            subject: 'Reset Password Instruction',
            text: `Hello ${userEmail}. \n
            To reset your password, please use the following link: ${resetLink} \n
            This link will expire after 24 hours. \n
            If you did not request this, please contact our support team.`,
        };

        console.log('Sending email...');
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending reset email:', error);
        return false;
    }
};

module.exports = sendResetMail;
