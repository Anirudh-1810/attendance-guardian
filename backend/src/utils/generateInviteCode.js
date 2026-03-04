const crypto = require('crypto');

/**
 * Generate a cryptographically secure 8-character alphanumeric invite code.
 * Uses only uppercase letters and digits for readability.
 * @returns {string} e.g. "A92FD3K1"
 */
function generateInviteCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Omit 0/O/1/I to avoid confusion
    const bytes = crypto.randomBytes(8);
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars[bytes[i] % chars.length];
    }
    return code;
}

/**
 * Hash an invite code using SHA-256.
 * Always compare hashes, never store plain codes in the database.
 * @param {string} code - The plain invite code
 * @returns {string} Hex-encoded SHA-256 hash
 */
function hashInviteCode(code) {
    return crypto.createHash('sha256').update(code).digest('hex');
}

module.exports = { generateInviteCode, hashInviteCode };
