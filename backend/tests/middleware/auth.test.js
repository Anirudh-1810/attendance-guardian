const auth = require('../../src/middleware/auth');
const jwt = require('jsonwebtoken');
const httpMocks = require('node-mocks-http');

const prisma = require('../../src/prisma');

jest.mock('jsonwebtoken');
jest.mock('../../src/prisma', () => ({
    user: {
        findUnique: jest.fn()
    }
}));

describe('Auth Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = httpMocks.createRequest();
        res = httpMocks.createResponse();
        next = jest.fn();
        process.env.JWT_SECRET = 'test-secret';
        jest.clearAllMocks();
    });

    it('should return 401 if no token is provided', async () => {
        await auth(req, res, next);

        expect(res.statusCode).toBe(401);
        expect(res._getJSONData()).toEqual({ status: 'fail', message: 'No token provided' });
        expect(next).not.toHaveBeenCalled();
    });

    it('should call next if token is valid and user exists', async () => {
        req.headers.authorization = 'Bearer valid-token';
        const decoded = { userId: 'user-123' };
        jwt.verify.mockReturnValue(decoded);
        prisma.user.findUnique.mockResolvedValue({ id: 'user-123', email: 'test@exam.com', role: 'STUDENT' });

        await auth(req, res, next);

        expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret');
        expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 'user-123' }, select: { id: true, email: true, role: true } });
        expect(req.user).toEqual({ userId: 'user-123', email: 'test@exam.com', role: 'STUDENT' });
        expect(next).toHaveBeenCalled();
    });

    it('should return 401 if user no longer exists', async () => {
        req.headers.authorization = 'Bearer valid-token';
        const decoded = { userId: 'user-123' };
        jwt.verify.mockReturnValue(decoded);
        prisma.user.findUnique.mockResolvedValue(null);

        await auth(req, res, next);

        expect(res.statusCode).toBe(401);
        expect(res._getJSONData()).toEqual({ status: 'fail', message: 'User no longer exists' });
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if token is invalid', async () => {
        req.headers.authorization = 'Bearer invalid-token';
        jwt.verify.mockImplementation(() => {
            throw new Error('Invalid token');
        });

        await auth(req, res, next);

        expect(res.statusCode).toBe(401);
        expect(res._getJSONData()).toEqual({ status: 'fail', message: 'Invalid token' });
        expect(next).not.toHaveBeenCalled();
    });
});
