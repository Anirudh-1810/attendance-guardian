// Mock express-rate-limit before imports (Jest 25 can't resolve node: protocol it uses)
jest.mock('express-rate-limit', () => {
    return () => (req, res, next) => next();
});

const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const adminRoutes = require('../../src/routes/admin');
const prisma = require('../../src/prisma');

// Mock prisma
jest.mock('../../src/prisma', () => ({
    user: {
        findUnique: jest.fn(),
    },
    inviteCode: {
        create: jest.fn(),
        createMany: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
    },
}));

jest.mock('jsonwebtoken');

const app = express();
app.use(express.json());
app.use('/admin', adminRoutes);

// Helper to create a valid admin token
function mockAdminAuth() {
    jwt.verify.mockReturnValue({ userId: 'admin-1', email: 'admin@test.com', role: 'admin' });
    prisma.user.findUnique.mockResolvedValue({
        id: 'admin-1',
        email: 'admin@test.com',
        role: 'admin',
    });
}

function mockStudentAuth() {
    jwt.verify.mockReturnValue({ userId: 'user-1', email: 'user@test.com', role: 'student' });
    prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'user@test.com',
        role: 'student',
    });
}

describe('Admin Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = 'test-secret';
    });

    describe('Authentication & Authorization', () => {
        it('should return 401 without auth token', async () => {
            const res = await request(app).get('/admin/invites');
            expect(res.statusCode).toBe(401);
        });

        it('should return 403 for non-admin users', async () => {
            mockStudentAuth();

            const res = await request(app)
                .get('/admin/invites')
                .set('Authorization', 'Bearer fake-token');

            expect(res.statusCode).toBe(403);
        });
    });

    describe('POST /admin/invites/generate', () => {
        it('should generate an invite code for admin', async () => {
            mockAdminAuth();
            prisma.inviteCode.create.mockResolvedValue({
                id: 'inv-1',
                codeHash: 'somehash',
                createdById: 'admin-1',
                used: false,
                revoked: false,
            });

            const res = await request(app)
                .post('/admin/invites/generate')
                .set('Authorization', 'Bearer admin-token')
                .send({});

            expect(res.statusCode).toBe(201);
            expect(res.body.status).toBe('success');
            expect(res.body.data.code).toBeDefined();
            expect(res.body.data.code).toHaveLength(8);
        });
    });

    describe('POST /admin/invites/generate-bulk', () => {
        it('should generate multiple invite codes', async () => {
            mockAdminAuth();
            prisma.inviteCode.createMany.mockResolvedValue({ count: 5 });
            prisma.inviteCode.findMany.mockResolvedValue(
                Array(5).fill({ id: 'inv', codeHash: 'hash', used: false })
            );

            const res = await request(app)
                .post('/admin/invites/generate-bulk')
                .set('Authorization', 'Bearer admin-token')
                .send({ count: 5 });

            expect(res.statusCode).toBe(201);
            expect(res.body.data.codes).toHaveLength(5);
        });

        it('should reject count > 50', async () => {
            mockAdminAuth();

            const res = await request(app)
                .post('/admin/invites/generate-bulk')
                .set('Authorization', 'Bearer admin-token')
                .send({ count: 100 });

            expect(res.statusCode).toBe(400);
        });

        it('should reject missing count', async () => {
            mockAdminAuth();

            const res = await request(app)
                .post('/admin/invites/generate-bulk')
                .set('Authorization', 'Bearer admin-token')
                .send({});

            expect(res.statusCode).toBe(400);
        });
    });

    describe('GET /admin/invites', () => {
        it('should list invites for admin', async () => {
            mockAdminAuth();
            prisma.inviteCode.findMany.mockResolvedValue([
                { id: 'inv-1', used: false, revoked: false },
                { id: 'inv-2', used: true, revoked: false },
            ]);

            const res = await request(app)
                .get('/admin/invites')
                .set('Authorization', 'Bearer admin-token');

            expect(res.statusCode).toBe(200);
            expect(res.body.results).toBe(2);
        });
    });

    describe('GET /admin/invites/stats', () => {
        it('should return invite statistics', async () => {
            mockAdminAuth();
            prisma.inviteCode.count
                .mockResolvedValueOnce(10) // total
                .mockResolvedValueOnce(5)  // used
                .mockResolvedValueOnce(1)  // revoked
                .mockResolvedValueOnce(2); // expired

            const res = await request(app)
                .get('/admin/invites/stats')
                .set('Authorization', 'Bearer admin-token');

            expect(res.statusCode).toBe(200);
            expect(res.body.data.stats).toEqual({
                total: 10,
                used: 5,
                unused: 2,
                expired: 2,
                revoked: 1,
            });
        });
    });

    describe('PATCH /admin/invites/:id/revoke', () => {
        it('should revoke an unused invite', async () => {
            mockAdminAuth();
            prisma.inviteCode.findFirst.mockResolvedValue({
                id: 'inv-1',
                used: false,
                revoked: false,
                createdById: 'admin-1',
            });
            prisma.inviteCode.update.mockResolvedValue({
                id: 'inv-1',
                revoked: true,
            });

            const res = await request(app)
                .patch('/admin/invites/inv-1/revoke')
                .set('Authorization', 'Bearer admin-token');

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toMatch(/revoked/i);
        });

        it('should return 404 for non-existent invite', async () => {
            mockAdminAuth();
            prisma.inviteCode.findFirst.mockResolvedValue(null);

            const res = await request(app)
                .patch('/admin/invites/bad-id/revoke')
                .set('Authorization', 'Bearer admin-token');

            expect(res.statusCode).toBe(404);
        });
    });

    describe('DELETE /admin/invites/:id', () => {
        it('should delete an unused invite', async () => {
            mockAdminAuth();
            prisma.inviteCode.findFirst.mockResolvedValue({
                id: 'inv-1',
                used: false,
                createdById: 'admin-1',
            });
            prisma.inviteCode.delete.mockResolvedValue({});

            const res = await request(app)
                .delete('/admin/invites/inv-1')
                .set('Authorization', 'Bearer admin-token');

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toMatch(/deleted/i);
        });
    });
});
