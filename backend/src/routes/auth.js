const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const prisma = require('../prisma');
const { hashInviteCode } = require('../utils/generateInviteCode');
const { signupLimiter, loginLimiter, otpLimiter } = require('../middleware/rateLimiter');
const authController = require('../controllers/authController');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

if (!process.env.JWT_SECRET) {
  console.warn('JWT_SECRET env var not set. Falling back to insecure dev-secret.');
}

// Validation helpers
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)/;

// POST /auth/signup — requires a valid invite code
router.post('/signup', signupLimiter, async (req, res) => {
  try {
    const { name, email, password, inviteCode } = req.body;

    // 1. Validate input fields
    if (!email || !password || !name) {
      return res.status(400).json({
        status: 'fail',
        message: 'Missing required fields',
        hint: 'Include name, email, password, and inviteCode in the request body',
      });
    }
    if (!inviteCode) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invite code is required',
      });
    }
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid email format',
      });
    }
    if (password.length < PASSWORD_MIN_LENGTH) {
      return res.status(400).json({
        status: 'fail',
        message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
      });
    }
    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Password must contain at least one letter and one number',
      });
    }

    // 2. Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email already in use',
      });
    }

    // 3. Query invite code by hash
    const codeHash = hashInviteCode(inviteCode);
    const invite = await prisma.inviteCode.findUnique({ where: { codeHash } });

    // 4. Check if invite code exists
    if (!invite) {
      return res.status(404).json({
        status: 'fail',
        message: 'Invalid invite code',
      });
    }

    // 5. Check if invite code already used
    if (invite.used) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invite code has already been used',
      });
    }

    // 5b. Check if invite code is revoked
    if (invite.revoked) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invite code has been revoked',
      });
    }

    // 6. Check if invite code expired
    if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invite code has expired',
      });
    }

    // 7. Hash password
    const hash = await bcrypt.hash(password, 12);

    // 8-10. Transaction: create user + mark invite as used
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: { name, email, password: hash, role: 'student' },
      });

      await tx.inviteCode.update({
        where: { id: invite.id },
        data: {
          used: true,
          redeemedById: newUser.id,
          redeemedAt: new Date(),
        },
      });

      return newUser;
    });

    // 11. Return JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(500).json({
      status: 'error',
      message: 'Signup failed. Please try again.',
    });
  }
});

// POST /auth/request-otp — Request a login OTP
router.post('/request-otp', otpLimiter, authController.requestOtp);

// POST /auth/verify-otp — Verify OTP and login
router.post('/verify-otp', otpLimiter, authController.verifyOtp);

// POST /auth/login
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Missing required fields',
        hint: 'Include email and password in the request body',
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ status: 'fail', message: 'Invalid credentials' });

    // Google-only users cannot login with password
    if (!user.password) {
      return res.status(400).json({
        status: 'fail',
        message: 'This account uses Google Sign-In. Please use "Continue with Google" to log in.',
      });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ status: 'fail', message: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({
      status: 'error',
      message: 'Login failed. Please try again.',
    });
  }
});

// POST /auth/google — Google OAuth login/signup
router.post('/google', signupLimiter, async (req, res) => {
  try {
    const { credential, inviteCode } = req.body;

    if (!credential) {
      return res.status(400).json({
        status: 'fail',
        message: 'Google credential token is required',
      });
    }

    // 1. Verify Google ID token
    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (err) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid Google token',
      });
    }

    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({
        status: 'fail',
        message: 'Google account does not have an email address',
      });
    }

    // 2. Check if user already exists (by googleId or email)
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { googleId },
          { email },
        ],
      },
    });

    if (user) {
      // Existing user — link Google account if not already linked
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId, avatar: picture || user.avatar },
        });
      }
    } else {
      // 3. New user — create account directly (no invite code needed for Google)
      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split('@')[0],
          googleId,
          avatar: picture,
          role: 'student',
          // No password — Google-only user
        },
      });
    }

    // 4. Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(user.createdAt && (new Date() - new Date(user.createdAt)) < 5000 ? 201 : 200).json({
      message: user.createdAt && (new Date() - new Date(user.createdAt)) < 5000
        ? 'Account created successfully'
        : 'Logged in successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error('Google auth error:', err.message);
    res.status(500).json({
      status: 'error',
      message: 'Google authentication failed. Please try again.',
    });
  }
});

module.exports = router;
