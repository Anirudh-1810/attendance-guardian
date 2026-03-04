const AppError = require('../utils/AppError');

/**
 * Middleware that restricts access to admin users only.
 * Must be used AFTER the auth middleware (requires req.user to be set).
 */
function adminAuth(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
        return next(new AppError('Access denied. Admin privileges required.', 403));
    }
    next();
}

module.exports = adminAuth;
