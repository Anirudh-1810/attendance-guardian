const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authRouter = require('../../src/routes/auth');

// Mock prisma
jest.mock('../../src/prisma', () => ({
    user: {
        findUnique: jest.fn(),
        create: jest.fn(),
    },
}));

const prisma = require('../../src/prisma');

const app = express();
app.use(express.json());
app.use('/auth', authRouter);

describe('Auth Route Integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /auth/signup', () => {
        it('should create a new user and return a token', async () => {
            prisma.user.findUnique.mockResolvedValue(null);
            prisma.user.create.mockResolvedValue({
                id: 'user123',
                name: 'Test User',
                email: 'test@example.com',
            });

            const res = await request(app)
                .post('/auth/signup')
                .send({ name: 'Test User', email: 'test@example.com', password: 'password123' });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('token');
            expect(res.body.user.email).toBe('test@example.com');
            expect(prisma.user.create).toHaveBeenCalled();
        });

        it('should return 400 if email is already in use', async () => {
            prisma.user.findUnique.mockResolvedValue({ id: 'existing' });

            const res = await request(app)
                .post('/auth/signup')
                .send({ name: 'Test User', email: 'test@example.com', password: 'password123' });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Email already in use');
        });

        it('should return 400 if fields are missing', async () => {
            const res = await request(app)
                .post('/auth/signup')
                .send({ email: 'test@example.com' });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Missing required fields');
        });
    });

    describe('POST /auth/login', () => {
        it('should login and return a token for valid credentials', async () => {
            const hashedPassword = await bcrypt.hash('password123', 10);
            prisma.user.findUnique.mockResolvedValue({
                id: 'user123',
                email: 'test@example.com',
                password: hashedPassword,
                name: 'Test User',
            });

            const res = await request(app)
                .post('/auth/login')
                .send({ email: 'test@example.com', password: 'password123' });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('token');
        });

        it('should return 400 for invalid password', async () => {
            const hashedPassword = await bcrypt.hash('password123', 10);
            prisma.user.findUnique.mockResolvedValue({
                id: 'user123',
                email: 'test@example.com',
                password: hashedPassword,
            });

            const res = await request(app)
                .post('/auth/login')
                .send({ email: 'test@example.com', password: 'wrongpassword' });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Invalid credentials');
        });
    });
});
