const crypto = require('crypto');

/**
 * Hashes an OTP using SHA-256 for secure storage.
 * @param {string} otp The plain-text OTP.
 * @returns {string} The SHA-256 hash in hex format.
 */
const hashOTP = (otp) => {
    return crypto.createHash('sha256').update(otp).digest('hex');
};

module.exports = hashOTP;
