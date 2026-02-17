const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma');
const AppError = require('../utils/AppError');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

class AuthService {
    async signup({ name, email, password }) {
        // Check if user exists
        const existing = await prisma.user.findUnique({ where: { email } });
        console.log('DEBUG AUTH SERVICE existing:', existing, 'for email:', email);
        if (existing) {
            throw new AppError('Email already in use', 400);
        }

        // Hash password
        const hash = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: { name, email, password: hash },
        });

        // Generate token
        const token = this.signToken(user.id);

        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        };
    }

    async login({ email, password }) {
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

        // Generate token
        const token = this.signToken(user.id);

        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        };
    }

    signToken(userId) {
        return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
    }
}

module.exports = new AuthService();
