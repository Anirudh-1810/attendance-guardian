const { Resend } = require('resend');

// Initialize Resend
// fallback allows the app to start even if the key is missing from Render temporarily
const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder_key');

/**
 * Sends an OTP email to the specified user using Resend.
 * @param {string} email Address to send to.
 * @param {string} otp The 6-digit OTP code to include in the email.
 */
const sendOTPEmail = async (email, otp) => {
    try {
        const { data, error } = await resend.emails.send({
            // NOTE: Resend requires verified domains in production to email ANYONE.
            // While testing on the free tier, you can only send FROM 'onboarding@resend.dev' 
            // TO the email address you registered your Resend account with.
            // Once you verify a domain, change this to 'noreply@yourdomain.com'
            from: 'Attendance Guardian <onboarding@resend.dev>',
            to: [email],
            subject: 'Your Attendance Guardian Login Code',
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

        if (error) {
            console.error('Resend API returned an error:', error);
            throw new Error(error.message);
        }

        console.log('OTP Email sent via Resend API:', data?.id);
        return true;
    } catch (err) {
        console.error('Error sending OTP email:', err);
        throw new Error('Could not send OTP email');
    }
};

module.exports = {
    sendOTPEmail,
};
