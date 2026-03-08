// Mock express-rate-limit before imports (Jest 25 can't resolve node: protocol it uses)
jest.mock('express-rate-limit', () => {
    return () => (req, res, next) => next();
});

// Set JWT_SECRET before loading routes (captured at module init time)
process.env.JWT_SECRET = 'test-secret';

const request = require('supertest');
const express = require('express');
const authRoutes = require('../../src/routes/auth');
const prisma = require('../../src/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { hashInviteCode } = require('../../src/utils/generateInviteCode');
const { OAuth2Client } = require('google-auth-library');

// Mock prisma
jest.mock('../../src/prisma', () => ({
    user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
    },
    inviteCode: {
        findUnique: jest.fn(),
        update: jest.fn(),
    },
    $transaction: jest.fn(),
}));

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

jest.mock('google-auth-library');

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

describe('Auth Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Clear mock instances for google client
        OAuth2Client.mockClear();
        process.env.JWT_SECRET = 'test-secret';
    });

    // --- SIGNUP TESTS ---
    describe('POST /auth/signup', () => {
        const validPayload = {
            name: 'Test User',
            email: 'test@test.com',
            password: 'secure123',
            inviteCode: 'A92FD3K1',
        };

        const mockInvite = {
            id: 'invite-1',
            codeHash: hashInviteCode('A92FD3K1'),
            used: false,
            revoked: false,
            expiresAt: null,
        };

        const mockUser = {
            id: 'user-1',
            name: 'Test User',
            email: 'test@test.com',
            password: 'hashed',
            role: 'student',
        };

        it('should create a new user with a valid invite code and return token', async () => {
            prisma.user.findUnique.mockResolvedValue(null);
            prisma.inviteCode.findUnique.mockResolvedValue(mockInvite);
            bcrypt.hash.mockResolvedValue('hashed');
            jwt.sign.mockReturnValue('jwt-token');
            prisma.$transaction.mockImplementation(async (fn) => {
                // Simulate the transaction callback
                const tx = {
                    user: { create: jest.fn().mockResolvedValue(mockUser) },
                    inviteCode: { update: jest.fn().mockResolvedValue({}) },
                };
                return fn(tx);
            });

            const res = await request(app)
                .post('/auth/signup')
                .send(validPayload);

            expect(res.statusCode).toBe(201);
            expect(res.body.message).toBe('Account created successfully');
            expect(res.body.token).toBe('jwt-token');
            expect(res.body.user).toEqual({
                id: 'user-1',
                name: 'Test User',
                email: 'test@test.com',
                role: 'student',
            });
        });

        it('should return 400 if invite code is missing', async () => {
            const res = await request(app)
                .post('/auth/signup')
                .send({ name: 'Test', email: 'test@test.com', password: 'secure123' });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Invite code is required');
        });

        it('should return 400 if required fields are missing', async () => {
            const res = await request(app)
                .post('/auth/signup')
                .send({ email: 'test@test.com', inviteCode: 'ABC123DE' });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Missing required fields');
        });

        it('should return 400 if email format is invalid', async () => {
            const res = await request(app)
                .post('/auth/signup')
                .send({ ...validPayload, email: 'notanemail' });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Invalid email format');
        });

        it('should return 400 if password is too short', async () => {
            const res = await request(app)
                .post('/auth/signup')
                .send({ ...validPayload, password: 'ab1' });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toMatch(/at least 8 characters/);
        });

        it('should return 400 if password has no number', async () => {
            const res = await request(app)
                .post('/auth/signup')
                .send({ ...validPayload, password: 'abcdefgh' });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toMatch(/letter and one number/);
        });

        it('should return 400 if email already exists', async () => {
            prisma.user.findUnique.mockResolvedValue({ id: 'existing-user' });

            const res = await request(app)
                .post('/auth/signup')
                .send(validPayload);

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Email already in use');
        });

        it('should return 404 for non-existent invite code', async () => {
            prisma.user.findUnique.mockResolvedValue(null);
            prisma.inviteCode.findUnique.mockResolvedValue(null);

            const res = await request(app)
                .post('/auth/signup')
                .send(validPayload);

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe('Invalid invite code');
        });

        it('should return 400 for already used invite code', async () => {
            prisma.user.findUnique.mockResolvedValue(null);
            prisma.inviteCode.findUnique.mockResolvedValue({ ...mockInvite, used: true });

            const res = await request(app)
                .post('/auth/signup')
                .send(validPayload);

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Invite code has already been used');
        });

        it('should return 400 for revoked invite code', async () => {
            prisma.user.findUnique.mockResolvedValue(null);
            prisma.inviteCode.findUnique.mockResolvedValue({ ...mockInvite, revoked: true });

            const res = await request(app)
                .post('/auth/signup')
                .send(validPayload);

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Invite code has been revoked');
        });

        it('should return 400 for expired invite code', async () => {
            prisma.user.findUnique.mockResolvedValue(null);
            prisma.inviteCode.findUnique.mockResolvedValue({
                ...mockInvite,
                expiresAt: new Date('2020-01-01'),
            });

            const res = await request(app)
                .post('/auth/signup')
                .send(validPayload);

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Invite code has expired');
        });
    });

    // --- LOGIN TESTS ---
    describe('POST /auth/login', () => {
        it('should login user and return token with role', async () => {
            const mockUser = {
                id: 'user-1',
                name: 'Test',
                email: 'test@test.com',
                password: 'hashed',
                role: 'student',
            };
            prisma.user.findUnique.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);
            jwt.sign.mockReturnValue('jwt-token');

            const res = await request(app)
                .post('/auth/login')
                .send({ email: 'test@test.com', password: 'password' });

            expect(res.statusCode).toBe(200);
            expect(res.body.token).toBe('jwt-token');
            expect(res.body.user.role).toBe('student');
            expect(jwt.sign).toHaveBeenCalledWith(
                { userId: 'user-1', email: 'test@test.com', role: 'student' },
                'test-secret',
                { expiresIn: '7d' }
            );
        });

        it('should return 400 for invalid credentials (wrong email)', async () => {
            prisma.user.findUnique.mockResolvedValue(null);

            const res = await request(app)
                .post('/auth/login')
                .send({ email: 'wrong@test.com', password: 'password' });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Invalid credentials');
        });

        it('should return 400 for invalid credentials (wrong password)', async () => {
            prisma.user.findUnique.mockResolvedValue({
                id: 'user-1',
                password: 'hashed',
                role: 'student',
            });
            bcrypt.compare.mockResolvedValue(false);

            const res = await request(app)
                .post('/auth/login')
                .send({ email: 'test@test.com', password: 'wrongpass' });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Invalid credentials');
        });

        it('should return 400 if fields are missing', async () => {
            const res = await request(app)
                .post('/auth/login')
                .send({ email: 'test@test.com' });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Missing required fields');
        });
    });

    // --- GOOGLE OAUTH TESTS ---
    describe('POST /auth/google', () => {
        const mockTicket = {
            getPayload: () => ({
                sub: 'google-123',
                email: 'google@test.com',
                name: 'Google User',
                picture: 'https://avatar.com/google.png'
            })
        };

        const mockInvite = {
            id: 'invite-1',
            codeHash: 'hash',
            used: false,
            revoked: false,
            expiresAt: null
        };

        it('should login existing Google user and return token', async () => {
            OAuth2Client.prototype.verifyIdToken.mockResolvedValue(mockTicket);
            prisma.user.findFirst.mockResolvedValue({
                id: 'user-1',
                email: 'google@test.com',
                googleId: 'google-123',
                name: 'Google User',
                role: 'student'
            });
            jwt.sign.mockReturnValue('jwt-token');

            const res = await request(app)
                .post('/auth/google')
                .send({ credential: 'valid-token' });

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Logged in successfully');
            expect(res.body.token).toBe('jwt-token');
            expect(res.body.user.email).toBe('google@test.com');
        });

        it('should create a new user with valid invite code and return token', async () => {
            OAuth2Client.prototype.verifyIdToken.mockResolvedValue(mockTicket);
            // new user doesn't exist
            prisma.user.findFirst.mockResolvedValue(null);

            // invite code is valid
            prisma.inviteCode.findUnique.mockResolvedValue(mockInvite);

            const newUser = {
                id: 'user-2',
                email: 'google@test.com',
                googleId: 'google-123',
                role: 'student',
                createdAt: new Date().toISOString()
            };
            prisma.$transaction.mockResolvedValue(newUser);
            jwt.sign.mockReturnValue('new-jwt-token');

            const res = await request(app)
                .post('/auth/google')
                .send({ credential: 'valid-token', inviteCode: 'A1B2C3D4' });

            expect(res.statusCode).toBe(201);
            expect(res.body.message).toBe('Account created successfully');
            expect(res.body.token).toBe('new-jwt-token');
        });

        it('should return 400 if invite code is missing for new user', async () => {
            OAuth2Client.prototype.verifyIdToken.mockResolvedValue(mockTicket);
            prisma.user.findFirst.mockResolvedValue(null);

            const res = await request(app)
                .post('/auth/google')
                .send({ credential: 'valid-token' });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Invite code is required for new account registration');
        });

        it('should return 401 if Google token is invalid', async () => {
            OAuth2Client.prototype.verifyIdToken.mockRejectedValue(new Error('Invalid token'));

            const res = await request(app)
                .post('/auth/google')
                .send({ credential: 'invalid-token' });

            expect(res.statusCode).toBe(401);
            expect(res.body.message).toBe('Invalid Google token');
        });

        it('should link existing email user to Google account on first Google login', async () => {
            OAuth2Client.prototype.verifyIdToken.mockResolvedValue(mockTicket);
            // user exists but without googleId
            const existingUser = {
                id: 'user-3',
                email: 'google@test.com',
                password: 'hashed-password',
                role: 'student',
                googleId: null
            };
            prisma.user.findFirst.mockResolvedValue(existingUser);

            // Update returns the linked user
            const linkedUser = { ...existingUser, googleId: 'google-123', avatar: 'https://avatar.com/google.png' };
            prisma.user.update.mockResolvedValue(linkedUser);

            jwt.sign.mockReturnValue('jwt-token-linked');

            const res = await request(app)
                .post('/auth/google')
                .send({ credential: 'valid-token' });

            expect(res.statusCode).toBe(200);
            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: 'user-3' },
                data: { googleId: 'google-123', avatar: 'https://avatar.com/google.png' }
            });
            expect(res.body.token).toBe('jwt-token-linked');
        });
    });
});
