const nodemailer = require('nodemailer');
const { welcomeTemplate, otpTemplate } = require('../templates/mailTemplates');
require('dotenv').config();

// Debug logs to ensure environment variables are loaded (remove in production)
// console.log('DEBUG MAIL:', { 
//   user: process.env.GOOGLE_MAIL_USER, 
//   passLen: process.env.GOOGLE_MAIL_PASS?.length 
// });

/**
 * Configure Transporter for Gmail SMTP
 * Explicit host/port is often more reliable than 'service' shorthand.
 */
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Use SSL
    auth: {
        user: (process.env.GOOGLE_MAIL_USER || '').trim(),
        pass: (process.env.GOOGLE_MAIL_PASS || '').trim(),
    },
});

/**
 * Send an email
 */
const sendEmail = async ({ to, subject, html, text }) => {
    // Check for credentials before sending
    if (!process.env.GOOGLE_MAIL_USER || !process.env.GOOGLE_MAIL_PASS) {
        return { success: false, error: 'Chưa cấu hình GOOGLE_MAIL_USER hoặc GOOGLE_MAIL_PASS trong .env' };
    }

    try {
        const mailOptions = {
            from: {
                name: process.env.SENDGRID_SENDER_NAME || 'ToyRent',
                address: process.env.GOOGLE_MAIL_USER,
            },
            to,
            subject,
            text: text || '',
            html: html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: %s', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Mail Service Error:', error);
        return { success: false, error: error.message };
    }
};

const sendWelcomeEmail = async (to, name) => {
    const subject = 'Chào mừng bạn đến với ToyRent!';
    const html = welcomeTemplate(name);
    return await sendEmail({ to, subject, html });
};

const sendOTPEmail = async (to, otp) => {
    const subject = 'Mã xác thực OTP của bạn';
    const html = otpTemplate(otp);
    return await sendEmail({ to, subject, html });
};

module.exports = {
    sendEmail,
    sendWelcomeEmail,
    sendOTPEmail
};
