const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma');
const AppError = require('../utils/AppError');
const { hashInviteCode } = require('../utils/generateInviteCode');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// Validation helpers
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)/; // At least one letter + one digit

class AuthService {
    /**
     * Signup with invite code validation.
     * Uses a Prisma transaction to atomically create user + mark invite as used.
     */
    async signup({ name, email, password, inviteCode }) {
        // 1. Validate input
        if (!EMAIL_REGEX.test(email)) {
            throw new AppError('Invalid email format', 400);
        }
        if (!password || password.length < PASSWORD_MIN_LENGTH) {
            throw new AppError(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`, 400);
        }
        if (!PASSWORD_REGEX.test(password)) {
            throw new AppError('Password must contain at least one letter and one number', 400);
        }
        if (!inviteCode) {
            throw new AppError('Invite code is required', 400);
        }

        // 2. Check if email already exists
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            throw new AppError('Email already in use', 400);
        }

        // 3. Hash invite code and look it up
        const codeHash = hashInviteCode(inviteCode);
        const invite = await prisma.inviteCode.findUnique({ where: { codeHash } });

        // 4. Validate invite code
        if (!invite) {
            throw new AppError('Invalid invite code', 404);
        }
        if (invite.used) {
            throw new AppError('Invite code has already been used', 400);
        }
        if (invite.revoked) {
            throw new AppError('Invite code has been revoked', 400);
        }
        if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
            throw new AppError('Invite code has expired', 400);
        }

        // 5. Hash password
        const hash = await bcrypt.hash(password, 12);

        // 6. Transaction: create user + mark invite as used
        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: { name, email, password: hash, role: 'student' },
            });

            await tx.inviteCode.update({
                where: { id: invite.id },
                data: {
                    used: true,
                    redeemedById: user.id,
                    redeemedAt: new Date(),
                },
            });

            return user;
        });

        // 7. Generate JWT
        const token = this.signToken(result);

        return {
            message: 'Account created successfully',
            token,
            user: {
                id: result.id,
                name: result.name,
                email: result.email,
                role: result.role,
            },
        };
    }

    /**
     * Login with email and password.
     */
    async login({ email, password }) {
        if (!email || !password) {
            throw new AppError('Email and password are required', 400);
        }

        // Find user
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new AppError('Invalid credentials', 401);
        }

        // Verify password
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            throw new AppError('Invalid credentials', 401);
        }

        // Generate token with role
        const token = this.signToken(user);

        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        };
    }

    /**
     * Sign JWT token with userId, email, and role.
     * @param {object} user - User object from DB
     * @returns {string} JWT token
     */
    signToken(user) {
        return jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
    }
}

module.exports = new AuthService();
