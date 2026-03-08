const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for signup endpoint.
 * Prevents invite code brute-force attacks.
 * Max 5 requests per 15 minutes per IP.
 */
const signupLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 'fail',
        message: 'Too many signup attempts. Please try again after 15 minutes.',
    },
});

/**
 * Rate limiter for login endpoint.
 * Prevents credential brute-force attacks.
 * Max 10 requests per 15 minutes per IP.
 */
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 'fail',
        message: 'Too many login attempts. Please try again after 15 minutes.',
    },
});

/**
 * Rate limiter for invite code generation.
 * Max 200 requests per hour per IP (admin protection).
 */
const inviteGenerateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 'fail',
        message: 'Too many invite generation requests. Please try again later.',
    },
});

/**
 * Rate limiter for OTP requests.
 * Max 3 requests per 10 minutes per IP.
 */
const otpLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 'fail',
        message: 'Too many OTP requests. Please try again after 10 minutes.',
    },
});

module.exports = { signupLimiter, loginLimiter, inviteGenerateLimiter, otpLimiter };
