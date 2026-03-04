const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Sends an OTP email to the specified user.
 * @param {string} email Address to send to.
 * @param {string} otp The 6-digit OTP code to include in the email.
 */
const sendOTPEmail = async (email, otp) => {
    try {
        const info = await transporter.sendMail({
            from: `"Attendance Guardian" <${process.env.EMAIL_USER || 'noreply@attendanceguardian.com'}>`,
            to: email,
            subject: 'Your Attendance Guardian Login Code',
            text: `Your Attendance Guardian login code is ${otp}. This code expires in 5 minutes.`,
            html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4F46E5;">Attendance Guardian</h2>
          <p>Your login code is:</p>
          <h1 style="letter-spacing: 5px; color: #111827; background: #F3F4F6; padding: 10px 20px; display: inline-block; border-radius: 8px;">${otp}</h1>
          <p>This code expires in <b>5 minutes</b>.</p>
          <p style="font-size: 12px; color: #6B7280; margin-top: 30px;">If you didn't request this code, you can safely ignore this email.</p>
        </div>
      `,
        });
        console.log('OTP Email sent:', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending OTP email:', error);
        throw new Error('Could not send OTP email');
    }
};

module.exports = {
    sendOTPEmail,
};
