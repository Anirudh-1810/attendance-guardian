const request = require('supertest');
const express = require('express');
const authRoutes = require('../../src/routes/auth');
const prisma = require('../../src/prisma'); // This will be the mock
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock prisma
jest.mock('../../src/prisma', () => ({
    user: {
        findUnique: jest.fn(),
        create: jest.fn(),
    },
}));

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

describe('Auth Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = 'test-secret';
    });

    describe('POST /auth/signup', () => {
        it('should create a new user and return token', async () => {
            const mockUser = { id: '1', name: 'Test', email: 'test@test.com', password: 'hashed' };
            prisma.user.findUnique.mockResolvedValue(null);
            bcrypt.hash.mockResolvedValue('hashed');
            prisma.user.create.mockResolvedValue(mockUser);
            jwt.sign.mockReturnValue('token');

            const res = await request(app)
                .post('/auth/signup')
                .send({ name: 'Test', email: 'test@test.com', password: 'password' });

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual({
                token: 'token',
                user: { id: '1', name: 'Test', email: 'test@test.com' },
            });
            expect(prisma.user.create).toHaveBeenCalled();
        });

        it('should return 400 if email exists', async () => {
            prisma.user.findUnique.mockResolvedValue({ id: '1' });

            const res = await request(app)
                .post('/auth/signup')
                .send({ name: 'Test', email: 'test@test.com', password: 'password' });

            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual({ message: 'Email already in use' });
        });
    });

    describe('POST /auth/login', () => {
        it('should login user and return token', async () => {
            const mockUser = { id: '1', name: 'Test', email: 'test@test.com', password: 'hashed' };
            prisma.user.findUnique.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);
            jwt.sign.mockReturnValue('token');

            const res = await request(app)
                .post('/auth/login')
                .send({ email: 'test@test.com', password: 'password' });

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual({
                token: 'token',
                user: { id: '1', name: 'Test', email: 'test@test.com' },
            });
        });

        it('should return 400 for invalid credentials', async () => {
            prisma.user.findUnique.mockResolvedValue(null);

            const res = await request(app)
                .post('/auth/login')
                .send({ email: 'test@test.com', password: 'password' });

            expect(res.statusCode).toBe(400);
        });
    });
});
