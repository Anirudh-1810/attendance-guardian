const jwt = require('jsonwebtoken');
const prisma = require('../prisma');

/**
 * JWT authentication middleware.
 * Verifies token, looks up user in DB to get current role,
 * and attaches { userId, email, role } to req.user.
 */
async function auth(req, res, next) {
  const authHeader = req.headers.authorization; // "Bearer token"

  if (!authHeader) {
    return res.status(401).json({ status: 'fail', message: 'No token provided' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ status: 'fail', message: 'Invalid authorization header format' });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Query DB for current user to get up-to-date role (prevents stale JWT role)
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      return res.status(401).json({ status: 'fail', message: 'User no longer exists' });
    }

    req.user = { userId: user.id, email: user.email, role: user.role };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ status: 'fail', message: 'Token has expired. Please log in again.' });
    }
    return res.status(401).json({ status: 'fail', message: 'Invalid token' });
  }
}

module.exports = auth;
