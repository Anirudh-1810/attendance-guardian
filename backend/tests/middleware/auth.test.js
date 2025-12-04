const auth = require('../../src/middleware/auth');
const jwt = require('jsonwebtoken');
const httpMocks = require('node-mocks-http');

jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = httpMocks.createRequest();
        res = httpMocks.createResponse();
        next = jest.fn();
        process.env.JWT_SECRET = 'test-secret';
    });

    it('should return 401 if no token is provided', () => {
        auth(req, res, next);

        expect(res.statusCode).toBe(401);
        expect(res._getJSONData()).toEqual({ message: 'No token provided' });
        expect(next).not.toHaveBeenCalled();
    });

    it('should call next if token is valid', () => {
        req.headers.authorization = 'Bearer valid-token';
        const decoded = { userId: 'user-123' };
        jwt.verify.mockReturnValue(decoded);

        auth(req, res, next);

        expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret');
        expect(req.user).toEqual(decoded);
        expect(next).toHaveBeenCalled();
    });

    it('should return 401 if token is invalid', () => {
        req.headers.authorization = 'Bearer invalid-token';
        jwt.verify.mockImplementation(() => {
            throw new Error('Invalid token');
        });

        auth(req, res, next);

        expect(res.statusCode).toBe(401);
        expect(res._getJSONData()).toEqual({ message: 'Invalid token' });
        expect(next).not.toHaveBeenCalled();
    });
});
