const crypto = require('crypto');

/**
 * Generates a cryptographically secure 6-digit OTP.
 * @returns {string} The 6-digit OTP.
 */
const generateOTP = () => {
    // Generate a random number between 100000 and 999999
    const otp = crypto.randomInt(100000, 1000000);
    return otp.toString();
};

module.exports = generateOTP;
