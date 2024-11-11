require('module-alias/register'); // always call on top
require('dotenv').config();
const nodemailer = require('nodemailer');
const { generateConfirmationToken } = require('@libs/auth/jwt');
const fs = require('fs');
const path = require('path');

const sendMail = async (userEmail, userVerified) => {
    try {
        const userToken = await generateConfirmationToken(userEmail, userVerified);
        const templatePath = path.join(__dirname, 'confirmEmailTemplate.html');
        let htmlTemplate = fs.readFileSync(templatePath, { encoding: 'utf-8' });
        const confirmationLink = `${process.env.WEBAPP_URL}/login?confirmation_token=${userToken}`;
        const currentYear = new Date().getFullYear();
        
        // Replace placeholders in the HTML template
        htmlTemplate = htmlTemplate.replace('{{confirmationLink}}', confirmationLink);
        htmlTemplate = htmlTemplate.replace('{{userEmail}}', userEmail);
        htmlTemplate = htmlTemplate.replace('{{linkedin}}', process.env.linkedin);
        htmlTemplate = htmlTemplate.replace('{{facebook}}', process.env.facebook);
        htmlTemplate = htmlTemplate.replace('{{reddit}}', process.env.reddit);
        htmlTemplate = htmlTemplate.replace('{{logo}}', process.env.logo);
        htmlTemplate = htmlTemplate.replace('{{discord}}', process.env.discord);
        htmlTemplate = htmlTemplate.replace('{{twitter}}', process.env.twitter);
        htmlTemplate = htmlTemplate.replace('{{telegram}}', process.env.telegram);
        htmlTemplate = htmlTemplate.replace('{{webAppUrl}}', process.env.WEBAPP_URL);
        htmlTemplate = htmlTemplate.replace('{{currentYear}}', currentYear);

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
            subject: 'Confirm Your Account',
            html: htmlTemplate,
        };

        console.log('Preparing to send confirmation email...');
        const info = await transporter.sendMail(mailOptions);
        console.log('Confirmation email sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending confirmation email:', error);
        return false;
    }
};

module.exports = sendMail;